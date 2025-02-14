// ==UserScript==
// @name         JavaGuide Toggle Controls
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在JavaGuide网站添加隐藏/显示侧边栏和导航栏的控制按钮，以及面试内容模糊控制
// @author       Your name
// @match        https://javaguide.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建控制按钮的样式
    const style = document.createElement('style');
    style.textContent = `
        .toggle-controls {
            position: fixed;
            right: 20px;
            bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
        }
        
        .toggle-btn {
            padding: 10px;
            border: none;
            border-radius: 5px;
            background-color: #4a9eff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .toggle-btn:hover {
            background-color: #357abd;
        }
        
        .toggle-btn.active {
            background-color: #dc3545;
        }

        .blur-text {
            filter: blur(4px);
            transition: filter 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // 创建控制按钮
    const controls = document.createElement('div');
    controls.className = 'toggle-controls';

    const sidebarBtn = document.createElement('button');
    sidebarBtn.className = 'toggle-btn';
    sidebarBtn.textContent = '隐藏侧边栏';
    
    const navbarBtn = document.createElement('button');
    navbarBtn.className = 'toggle-btn';
    navbarBtn.textContent = '隐藏导航栏';

    const blurBtn = document.createElement('button');
    blurBtn.className = 'toggle-btn';
    blurBtn.textContent = '模糊面试内容';

    controls.appendChild(sidebarBtn);
    controls.appendChild(navbarBtn);
    controls.appendChild(blurBtn);
    document.body.appendChild(controls);

    // 侧边栏切换功能
    let sidebarVisible = true;
    sidebarBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (sidebarVisible) {
                sidebar.style.display = 'none';
                sidebarBtn.textContent = '显示侧边栏';
                sidebarBtn.classList.add('active');
            } else {
                sidebar.style.display = '';
                sidebarBtn.textContent = '隐藏侧边栏';
                sidebarBtn.classList.remove('active');
            }
            sidebarVisible = !sidebarVisible;
        }
    });

    // 导航栏切换功能
    let navbarVisible = true;
    navbarBtn.addEventListener('click', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (navbarVisible) {
                navbar.style.display = 'none';
                navbarBtn.textContent = '显示导航栏';
                navbarBtn.classList.add('active');
            } else {
                navbar.style.display = '';
                navbarBtn.textContent = '隐藏导航栏';
                navbarBtn.classList.remove('active');
            }
            navbarVisible = !navbarVisible;
        }
    });

    // 面试内容模糊功能
    let blurEnabled = false;
    const blurWords = ['面试', '面试题'];
    
    function wrapTextWithSpan(node, word) {
        const regex = new RegExp(`(${word})`, 'g');
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.textContent)) !== null) {
            const beforeText = node.textContent.slice(lastIndex, match.index);
            fragment.appendChild(document.createTextNode(beforeText));

            const span = document.createElement('span');
            span.textContent = match[0];
            span.className = 'blur-text';
            fragment.appendChild(span);

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < node.textContent.length) {
            fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
        }

        return fragment;
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let needsReplacement = false;
            for (const word of blurWords) {
                if (node.textContent.includes(word)) {
                    needsReplacement = true;
                    break;
                }
            }
            if (needsReplacement) {
                let fragment = document.createDocumentFragment();
                for (const word of blurWords) {
                    fragment = wrapTextWithSpan(node, word);
                }
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    function unwrapBlurredText(element) {
        const blurredSpans = element.querySelectorAll('.blur-text');
        blurredSpans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });
    }

    blurBtn.addEventListener('click', () => {
        if (!blurEnabled) {
            processNode(document.body);
            blurBtn.textContent = '取消模糊';
            blurBtn.classList.add('active');
        } else {
            unwrapBlurredText(document.body);
            blurBtn.textContent = '模糊面试内容';
            blurBtn.classList.remove('active');
        }
        blurEnabled = !blurEnabled;
    });
})();