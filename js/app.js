document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // 调试信息
    fetch('data/texts.json')
        .then(response => response.json())
        .then(data => {
            window.textData = data;
            console.log("Loaded data:", data); // 调试信息
        })
        .catch(error => console.error('Error loading texts.json:', error));
});

function highlightKeyword(text, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function truncateText(text, keyword) {
    const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (keywordIndex === -1) return text;

    const start = Math.max(0, keywordIndex - 20);
    const end = Math.min(text.length, keywordIndex + keyword.length + 20);
    return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function searchText() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    console.log("Searching for:", keyword); // 调试信息

    if (keyword) {
        const results = {"level=1": [], "level=2": [], "level=2.5": [], "level=3": []};

        for (const level in window.textData) {
            const texts = window.textData[level];
            texts.forEach(item => {
                const content = typeof item === 'string' ? item : item.内容;
                if (content.toLowerCase().includes(keyword)) {
                    results[level].push(item);
                }
            });
        }

        console.log("Search results:", results); // 调试信息

        if (results["level=1"].length > 0) {
            results["level=1"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-1';
                resultElement.innerHTML = `<strong>一级文本:</strong> ${highlightKeyword(result.内容, keyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=2"].length > 0) {
            results["level=2"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-2';
                resultElement.innerHTML = `<strong>二级文本:</strong> ${highlightKeyword(result.内容, keyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=2.5"].length > 0) {
            results["level=2.5"].forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'level-2-5';
                resultElement.innerHTML = `<strong>2.5级文本:</strong> ${highlightKeyword(result.内容, keyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=3"].length > 0) {
            results["level=3"].forEach(result => {
                const truncatedContent = truncateText(result, keyword);
                const resultElement = document.createElement('div');
                resultElement.className = 'level-3';
                resultElement.innerHTML = `<strong>三级文本:</strong> ${highlightKeyword(truncatedContent, keyword)}`;
                resultsDiv.appendChild(resultElement);
            });
        }

        if (results["level=1"].length === 0 && results["level=2"].length === 0 && results["level=2.5"].length === 0 && results["level=3"].length === 0) {
            resultsDiv.textContent = 'No results found.';
        }
    } else {
        resultsDiv.textContent = 'Please enter a keyword.';
    }
}
