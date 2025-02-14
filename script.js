// ==UserScript==
// @name         JavaGuide Enhanced Controls
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Enhanced controls for JavaGuide website with eye icon and settings
// @author       Your name
// @match        https://javaguide.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add required CSS
    const style = document.createElement('style');
    style.textContent = `
        .jg-controls {
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 9999;
        }
        .jg-settings {
            position: absolute;
            bottom: 50px;
            right: 0;
            background-color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: none;
            width: 200px;
        }
        .jg-btn {
            background-color: #4a9eff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .jg-btn:hover {
            background-color: #357abd;
        }
        .jg-settings-btn {
            background-color: #e2e8f0;
            position: absolute;
            bottom: 50px;
            right: 0;
            display: none;
        }
        .jg-checkbox {
            display: block;
            margin-bottom: 10px;
        }
        .blur-text {
            filter: blur(5px);
        }
        .blur-text:hover {
            filter: none;
        }
    `;
    document.head.appendChild(style);

    // Create and add controls
    const controls = document.createElement('div');
    controls.className = 'jg-controls';
    controls.innerHTML = `
        <div class="jg-settings">
            <label class="jg-checkbox">
                <input type="checkbox" checked id="jg-hide-sidebar"> 隐藏侧边栏
            </label>
            <label class="jg-checkbox">
                <input type="checkbox" checked id="jg-hide-navbar"> 隐藏导航栏
            </label>
            <label class="jg-checkbox">
                <input type="checkbox" checked id="jg-blur-content"> 模糊面试内容
            </label>
        </div>
        <button id="jg-settings-btn" class="jg-btn jg-settings-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </button>
        <button id="jg-toggle-btn" class="jg-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        </button>
    `;
    document.body.appendChild(controls);

    // Get elements
    const settingsPanel = controls.querySelector('.jg-settings');
    const toggleBtn = document.getElementById('jg-toggle-btn');
    const settingsBtn = document.getElementById('jg-settings-btn');
    const hideSidebarCheckbox = document.getElementById('jg-hide-sidebar');
    const hideNavbarCheckbox = document.getElementById('jg-hide-navbar');
    const blurContentCheckbox = document.getElementById('jg-blur-content');

    // State
    let effectsActive = false;

    // Functions
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = hideSidebarCheckbox.checked ? 'none' : '';
        }
    }

    function toggleNavbar() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.style.display = hideNavbarCheckbox.checked ? 'none' : '';
        }
    }

    function blurInterviewContent() {
        const blurWords = ['JavaGuide', '面试', '简历', '题', '面经'];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            let shouldWrap = false;
            for (const word of blurWords) {
                if (node.textContent.includes(word)) {
                    shouldWrap = true;
                    break;
                }
            }
            if (shouldWrap && !node.parentNode.classList.contains('blur-text')) {
                const span = document.createElement('span');
                span.className = 'blur-text';
                span.textContent = node.textContent;
                node.parentNode.replaceChild(span, node);
            }
        }
    }

    function unblurContent() {
        const blurredSpans = document.querySelectorAll('.blur-text');
        blurredSpans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });
    }

    function applyEffects() {
        if (hideSidebarCheckbox.checked) toggleSidebar();
        if (hideNavbarCheckbox.checked) toggleNavbar();
        if (blurContentCheckbox.checked) blurInterviewContent();
        else unblurContent();
    }

    function toggleEffects() {
        effectsActive = !effectsActive;
        if (effectsActive) {
            applyEffects();
            toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        } else {
            toggleSidebar();
            toggleNavbar();
            unblurContent();
            toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    }

    // Event listeners
    toggleBtn.addEventListener('click', toggleEffects);
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    controls.addEventListener('mouseenter', () => {
        settingsBtn.style.display = 'flex';
    });

    // Close settings panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!controls.contains(event.target)) {
            settingsPanel.style.display = 'none';
        }
    });

    // Apply effects when checkboxes are changed
    hideSidebarCheckbox.addEventListener('change', applyEffects);
    hideNavbarCheckbox.addEventListener('change', applyEffects);
    blurContentCheckbox.addEventListener('change', applyEffects);
})();