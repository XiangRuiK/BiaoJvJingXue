document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // Debug line
    fetch('data/texts.json')
        .then(response => response.json())
        .then(data => {
            window.textData = data;
            console.log("Loaded data:", data); // Debug line
        })
        .catch(error => console.error('Error loading texts.json:', error));

    document.getElementById('searchInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchText();
        }
    });
});

function highlightKeyword(text, keyword, originalKeyword) {
    const regex = new RegExp(`(${keyword}|${originalKeyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function truncateText(text, keyword) {
    const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (keywordIndex === -1) return text;

    const start = Math.max(0, keywordIndex - 40);
    const end = Math.min(text.length, keywordIndex + keyword.length + 40);
    return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function searchText() {
    const originalKeyword = document.getElementById('searchInput').value;
    console.log("Original keyword:", originalKeyword); // Debug line
    if (!originalKeyword) {
        document.getElementById('results').textContent = 'Please enter a keyword.';
        return;
    }

    const s2tConverter = OpenCC.Converter({ from: 'cn', to: 't' });
    const t2sConverter = OpenCC.Converter({ from: 't', to: 'cn' });

    Promise.all([
        s2tConverter(originalKeyword),
        t2sConverter(originalKeyword)
    ]).then(([traditionalKeyword, simplifiedKeyword]) => {
        console.log("Traditional keyword:", traditionalKeyword); // Debug line
        console.log("Simplified keyword:", simplifiedKeyword); // Debug line

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const results = {"level=1": [], "level=2": [], "level=2.5": [], "level=3": []};

        for (const level in window.textData) {
            const texts = window.textData[level];
            texts.forEach(item => {
                const content = typeof item === 'string' ? item : item.内容;
                if (content.includes(originalKeyword) || content.includes(traditionalKeyword) || content.includes(simplifiedKeyword)) {
                    results[level].push(item);
                }
            });
        }

        console.log("Search results:", results); // Debug line

        if (results["level=1"].length > 0) {
            results["level=1"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-1';
                resultElement.innerHTML = `<strong>经传注:</strong> ${highlightKeyword(result.内容, traditionalKeyword, originalKeyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=2"].length > 0) {
            results["level=2"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-2';
                resultElement.innerHTML = `<strong>锡恭按 [${result.对应经文}]:</strong> ${highlightKeyword(result.内容, traditionalKeyword, originalKeyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=2.5"].length > 0) {
            results["level=2.5"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-2-5';
                resultElement.innerHTML = `<strong>锡恭段内按 [${result.对应经文}]:</strong> ${highlightKeyword(result.内容, traditionalKeyword, originalKeyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=3"].length > 0) {
            results["level=3"].forEach(result => {
                const truncatedContent = truncateText(result.内容, originalKeyword);
                const resultElement = document.createElement('div');
                resultElement.className = 'level-3';
                resultElement.innerHTML = `<strong>疏及其他 [${result.对应经文}]:</strong> ${highlightKeyword(truncatedContent, traditionalKeyword, originalKeyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=1"].length === 0 && results["level=2"].length === 0 && results["level=2.5"].length === 0 && results["level=3"].length === 0) {
            resultsDiv.textContent = 'No results found.';
        }
    }).catch(error => {
        console.error('Error during conversion:', error);
    });
}
