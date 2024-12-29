// Initialize CodeMirror
        const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
            lineNumbers: true,
            theme: "dracula",
            mode: "text/html",
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            autofocus: true,
            extraKeys: {
                "Ctrl-Z": "undo",
                "Ctrl-Y": "redo",
                "Ctrl-F": "findPersistent",
                "Ctrl-Space": "autocomplete",
                "Alt-F": "format"
            }
        });

        // Menu Functions
        const menuBtn = document.getElementById('menuBtn');
        const menuPanel = document.getElementById('menuPanel');
        const menuOverlay = document.getElementById('menuOverlay');
        const menuClose = document.getElementById('menuClose');

        function toggleMenu() {
            menuPanel.classList.toggle('active');
            menuOverlay.style.display = menuPanel.classList.contains('active') ? 'block' : 'none';
        }

        menuBtn.addEventListener('click', toggleMenu);
        menuClose.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);

        // Preview Functions
        const previewBtn = document.getElementById('previewBtn');
        const previewContainer = document.getElementById('previewContainer');
        const closePreviewBtn = document.getElementById('closePreviewBtn');

        function togglePreview() {
            previewContainer.classList.toggle('active');
            if (previewContainer.classList.contains('active')) {
                updatePreview();
            }
        }

        function updatePreview() {
            const code = editor.getValue();
            const preview = document.getElementById('previewFrame').contentWindow.document;
            preview.open();
            preview.write(code);
            preview.close();
        }

        previewBtn.addEventListener('click', togglePreview);
        closePreviewBtn.addEventListener('click', togglePreview);

        // Code History System
        let codeHistory = JSON.parse(localStorage.getItem('codeHistory') || '[]');
        
        function saveToHistory() {
            const code = editor.getValue();
            const timestamp = new Date().toISOString();
            codeHistory.unshift({ code, timestamp });
            if (codeHistory.length > 50) codeHistory.pop();
            localStorage.setItem('codeHistory', JSON.stringify(codeHistory));
            updateHistoryPanel();
        }

        function updateHistoryPanel() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';
            codeHistory.forEach((item, index) => {
                const date = new Date(item.timestamp);
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div>Version ${index + 1}</div>
                    <div class="history-time">${date.toLocaleString()}</div>
                `;
                historyItem.onclick = () => {
                    editor.setValue(item.code);
                    toggleHistoryPanel();
                };
                historyList.appendChild(historyItem);
            });
        }

        // Auto-save and history
        setInterval(() => {
            saveToHistory();
            document.getElementById('lastSavedStatus').textContent = 
                `Last saved: ${new Date().toLocaleTimeString()}`;
        }, 30000);

        // Code Operations
        document.getElementById('formatCodeBtn').addEventListener('click', () => {
            const code = editor.getValue();
            try {
                const formatted = prettier.format(code, {
                    parser: "html",
                    plugins: prettierPlugins,
                    printWidth: 80,
                    tabWidth: 4,
                    useTabs: false
                });
                editor.setValue(formatted);
                showNotification('Code formatted successfully');
            } catch (err) {
                showNotification('Error formatting code', 'error');
            }
            toggleMenu();
        });

        // Find & Replace Functions
        const findReplacePanel = document.getElementById('findReplacePanel');
        
        document.getElementById('findReplaceBtn').addEventListener('click', () => {
            findReplacePanel.classList.toggle('active');
            if (findReplacePanel.classList.contains('active')) {
                document.getElementById('findInput').focus();
            }
            toggleMenu();
        });

        document.getElementById('findNextBtn').addEventListener('click', () => {
            const query = document.getElementById('findInput').value;
            editor.execCommand('findNext');
        });

        document.getElementById('replaceBtn').addEventListener('click', () => {
            const replacement = document.getElementById('replaceInput').value;
            editor.execCommand('replace');
        });

        document.getElementById('replaceAllBtn').addEventListener('click', () => {
            const replacement = document.getElementById('replaceInput').value;
            editor.execCommand('replaceAll');
        });

        // Notification System
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            `;

            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Initialize with default content
        const defaultCode = `<!DOCTYPE html>
<html>
<head>
    <title>My Code</title>
</head>
<body>
    <h1>Welcome to ProCode Studio 5.0</h1>
    <p>Start coding here...</p>
</body>
</html>`;

        editor.setValue(localStorage.getItem('savedCode') || defaultCode);

        // Additional event listeners
        document.getElementById('newFileBtn').addEventListener('click', () => {
            editor.setValue(defaultCode);
            toggleMenu();
            showNotification('New file created');
        });

        document.getElementById('saveFileBtn').addEventListener('click', () => {
            localStorage.setItem('savedCode', editor.getValue());
            showNotification('File saved');
            toggleMenu();
        });

        // Language and theme selection
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            editor.setOption('mode', e.target.value);
            document.getElementById('languageStatus').textContent = 
                e.target.options[e.target.selectedIndex].text;
            showNotification(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
        });

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            editor.setOption('theme', e.target.value);
            showNotification(`Theme changed to ${e.target.value}`);
        });

        // Mobile optimization
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            editor.setOption('fontSize', '16px');
        }