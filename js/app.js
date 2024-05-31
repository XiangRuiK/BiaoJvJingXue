document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired."); // Debug line
  fetch("data/texts.json")
    .then((response) => {
      console.log("Received response from fetch."); // Debug line
      return response.json();
    })
    .then((data) => {
      console.log("Parsed JSON data:", data); // Debug line
      window.textData = data;
      previewData(data); // 调用预览函数
    })
    .catch((error) => console.error("Error loading texts.json:", error));
});

function previewData(data) {
  const dataPreviewDiv = document.getElementById("dataPreview");
  let previewHTML = "<h2>Data Preview:</h2>";

  for (const level in data) {
    const texts = data[level];
    texts.forEach((text) => {
      previewHTML += `<p>[${level}] ${text.slice(0, 3)}...</p>`;
    });
  }

  dataPreviewDiv.innerHTML = previewHTML;
}

function searchText() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  console.log("Searching for:", keyword); // Debug line

  if (keyword) {
    const results = [];
    for (const level in window.textData) {
      const texts = window.textData[level];
      console.log(`Checking level ${level}:`, texts); // Debug line
      texts.forEach((text) => {
        if (text.toLowerCase().includes(keyword)) {
          results.push({ level, text });
        }
      });
    }

    console.log("Search results:", results); // Debug line

    if (results.length > 0) {
      results.forEach((result) => {
        const resultElement = document.createElement("div");
        resultElement.textContent = `[${result.level}] ${result.text}`;
        resultsDiv.appendChild(resultElement);
      });
    } else {
      resultsDiv.textContent = "No results found.";
    }
  } else {
    resultsDiv.textContent = "Please enter a keyword.";
  }
}
