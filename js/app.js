document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const themeToggleButton = document.getElementById("theme-toggle");
    const editor = document.getElementById("editor");
    const preview = document.getElementById("preview");
    const exportButton = document.getElementById("export-btn");
    const clearButton = document.getElementById("clear-btn");
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');

    // Default markdown content
    const defaultMarkdown = `# Welcome to Markdown Previewer

## Try writing some markdown

Here's a **quick guide**:

- \`inline code\`
- **bold** and *italic* text
- [links](https://example.com)
- \`\`\`javascript
// code blocks
function hello() {
  console.log("Hello Markdown!");
}
\`\`\`

> Beautiful blockquotes
`;

    // Initialize editor with default content
    editor.value = localStorage.getItem('markdownContent') || defaultMarkdown;

    // Undo/Redo History
    let history = [];
    let historyIndex = -1;

    // Function to toggle the theme between dark and light mode
    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem('darkMode', isDarkMode);
        
        themeToggleButton.innerHTML = isDarkMode 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add("dark-mode");
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Function to render Markdown to HTML using Marked.js
    function renderMarkdown() {
        const markdownContent = editor.value;
        localStorage.setItem('markdownContent', markdownContent);
        preview.innerHTML = marked.parse(markdownContent);
        Prism.highlightAll();
    }

    // Update counters
    function updateCounters() {
        const text = editor.value;
        charCount.textContent = `${text.length} characters`;
        wordCount.textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} words`;
        lineCount.textContent = `${text.split('\n').length} lines`;
    }

    // Insert text at cursor position
    function insertText(text) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        editor.value = editor.value.substring(0, start) + 
                      text.replace('text', selectedText || 'text') + 
                      editor.value.substring(end);
        editor.focus();
        editor.setSelectionRange(
            start + text.indexOf('text'), 
            start + text.indexOf('text') + (selectedText.length || 4)
        );
    }

    // Event Listeners
    editor.addEventListener("input", () => {
        // Update history for undo/redo
        history = history.slice(0, historyIndex + 1);
        history.push(editor.value);
        historyIndex++;
        
        // Update preview and counters
        renderMarkdown();
        updateCounters();
    });

    // Export to HTML functionality
    exportButton.addEventListener("click", () => {
        const markdownContent = editor.value;
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Exported Markdown</title>
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        ${document.querySelector('style').textContent}
    </style>
</head>
<body>
    ${marked.parse(markdownContent)}
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
</body>
</html>
        `;
        
        const blob = new Blob([htmlContent], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "markdown-export.html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Clear editor functionality
    clearButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the editor?")) {
            editor.value = "";
            localStorage.removeItem('markdownContent');
            renderMarkdown();
            updateCounters();
        }
    });

    // Theme toggle
    themeToggleButton.addEventListener("click", toggleTheme);

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    // Undo/Redo functionality
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                editor.value = history[historyIndex];
                renderMarkdown();
                updateCounters();
            }
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                editor.value = history[historyIndex];
                renderMarkdown();
                updateCounters();
            }
        }
    });

    // Cheat sheet button
    const cheatSheetBtn = document.createElement('button');
    cheatSheetBtn.innerHTML = '<i class="fas fa-question-circle"></i> Cheat Sheet';
    cheatSheetBtn.id = 'cheat-sheet-btn';
    cheatSheetBtn.addEventListener('click', () => {
        window.open('https://www.markdownguide.org/cheat-sheet/', '_blank');
    });
    document.querySelector('.button-group').appendChild(cheatSheetBtn);

    // Auto-resize textarea
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === editor) {
                editor.style.height = 'auto';
                editor.style.height = (editor.scrollHeight) + 'px';
            }
        }
    });
    resizeObserver.observe(editor);

    // Initial setup
    renderMarkdown();
    updateCounters();
});