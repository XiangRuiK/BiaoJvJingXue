document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // Debug line
    Promise.all([
        fetch('data/sishu_final.json').then(response => response.json()),
        fetch('data/zhuyu_final.json').then(response => response.json()),
        fetch('data/xunyi_final.json').then(response => response.json())
    ]).then(([sishuData, zhuyuData, xunyiData]) => {
        window.sishuData = sishuData;
        window.zhuyuData = zhuyuData;
        window.xunyiData = xunyiData;
        console.log("Loaded data:", { sishuData, zhuyuData, xunyiData }); // Debug line
    }).catch(error => console.error('Error loading JSON files:', error));

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

        const results = { sishu: [], xunyi: [], zhuyu: [] };

        // 搜索四书整理
        const sishuGrouped = {};
        window.sishuData.forEach(item => {
            const { text, type, chapter_name, paragraph_number, sentence_number } = item;
            if (text.includes(originalKeyword) || text.includes(traditionalKeyword) || text.includes(simplifiedKeyword)) {
                const key = `${chapter_name}-${paragraph_number}-${sentence_number}`;
                if (!sishuGrouped[key]) {
                    sishuGrouped[key] = { chapter_name, paragraph_number, sentence_number, 经: '', 注: '' };
                }
                sishuGrouped[key][type] = text;
            }
        });

        for (const key in sishuGrouped) {
            const pair = sishuGrouped[key];
            if (pair["经"] || pair["注"]) {
                results.sishu.push(pair);
            }
        }

        // 搜索训义整理
        window.xunyiData.forEach(item => {
            const { text, chapter_name } = item;
            if (text.includes(originalKeyword) || text.includes(traditionalKeyword) || text.includes(simplifiedKeyword)) {
                results.xunyi.push(item);
            }
        });

        // 搜索朱子语类
        window.zhuyuData.forEach(chapter => {
            chapter.text.forEach(paragraph => {
                if (paragraph.text.includes(originalKeyword) || paragraph.text.includes(traditionalKeyword) || paragraph.text.includes(simplifiedKeyword)) {
                    results.zhuyu.push({ ...paragraph, chapter_name: chapter.章节名 });
                }
            });
        });

        // 展示结果
        displayResults(results, traditionalKeyword, originalKeyword);
    }).catch(error => {
        console.error('Error during conversion:', error);
    });
}

function displayResults(results, traditionalKeyword, originalKeyword) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // 展示四书整理结果
    if (results.sishu.length > 0) {
        const sishuDiv = document.createElement('div');
        sishuDiv.className = 'level-1';
        results.sishu.forEach(result => {
            const resultElement = document.createElement('p');
            const jingText = result["经"] ? `<span style="color:blue;">${highlightKeyword(result["经"], traditionalKeyword, originalKeyword)}</span>` : '';
            const zhuText = result["注"] ? `<span style="color:green;">${highlightKeyword(result["注"], traditionalKeyword, originalKeyword)}</span>` : '';
            resultElement.innerHTML = `<strong>【${result.chapter_name}】</strong> ${jingText} ${zhuText}`;
            sishuDiv.appendChild(resultElement);
        });
        resultsDiv.appendChild(sishuDiv);
    }

    // 展示训义整理结果
    if (results.xunyi.length > 0) {
        const xunyiDiv = document.createElement('div');
        xunyiDiv.className = 'level-2';
        results.xunyi.forEach(result => {
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>【${result.chapter_name}】</strong> ${highlightKeyword(result.text, traditionalKeyword, originalKeyword)}`;
            xunyiDiv.appendChild(resultElement);
        });
        resultsDiv.appendChild(xunyiDiv);
    }

    // 展示朱子语类结果
    if (results.zhuyu.length > 0) {
        const zhuyuDiv = document.createElement('div');
        zhuyuDiv.className = 'level-3';
        results.zhuyu.forEach(result => {
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>【${result.chapter_name}】</strong> ${highlightKeyword(result.text, traditionalKeyword, originalKeyword)}`;
            zhuyuDiv.appendChild(resultElement);
        });
        resultsDiv.appendChild(zhuyuDiv);
    }

    if (results.sishu.length === 0 && results.xunyi.length === 0 && results.zhuyu.length === 0) {
        resultsDiv.textContent = 'No results found.';
    }
}
