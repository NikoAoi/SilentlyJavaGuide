// ==UserScript==
// @name         SilentlyJavaGuide
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  在JavaGuide网站添加隐藏/显示侧边栏和导航栏的控制按钮，以及面试内容模糊控制
// @author       NikoAoi
// @match        https://javaguide.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        #floating-eye-container {
            position: fixed;
            bottom: 150px;
            right: 15px;
            width: 48px;
            height: 48px;
            z-index: 9999;
            cursor: pointer;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            transition: filter 0.3s ease;
        }
        
        #floating-eye-container:hover {
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        #floating-eye {
            width: 32px;
            height: 32px;
            filter: saturate(1.2);
        }

        #eye-iris {
            transition: transform 0.3s ease;
            fill: url(#iris-gradient);
        }
        
        @keyframes moveIris {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(2px, 0); }
            40% { transform: translate(-2px, 0); }
            60% { transform: translate(0, -2px); }
            80% { transform: translate(0, 2px); }
        }

        @keyframes morphOutline {
            0%, 100% { d: path('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'); }
            20% { d: path('M1 12s4-8 11-8 11 8 11 8-4 7.8-11 7.8-11-7.8-11-7.8z'); }
            40% { d: path('M1 12s4-8.2 11-8.2 11 8.2 11 8.2-4 7.8-11 7.8-11-7.8-11-7.8z'); }
            60% { d: path('M1 12s4-7.8 11-7.8 11 7.8 11 7.8-4 8.2-11 8.2-11-8.2-11-8.2z'); }
            80% { d: path('M1 12s4-8 11-8 11 8 11 8-4 8.2-11 8.2-11-8.2-11-8.2z'); }
        }
        
        @keyframes blink {
            0%, 100% { d: path('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'); }
            45%, 55% { d: path('M3 14 Q12 18 21 14 M2 12 L4 13 M20 12 L22 13'); }
        }

        .iris-moving {
            animation: moveIris 4s ease-in-out infinite;
        }

        .outline-moving {
            animation: morphOutline 4s ease-in-out infinite;
        }

        .eye-blinking {
            animation: blink 0.2s ease-in-out;
        }

        .blur-text {
            filter: blur(10px);
            transition: filter 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // 创建容器
    const container = document.createElement('div');
    container.setAttribute('id', 'floating-eye-container');

    // 创建SVG图标
    const eyeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    eyeIcon.setAttribute('id', 'floating-eye');
    eyeIcon.setAttribute('viewBox', '0 0 24 24');
    eyeIcon.setAttribute('fill', 'none');
    eyeIcon.setAttribute('stroke', 'currentColor');
    eyeIcon.setAttribute('stroke-width', '0.3');

    // 添加渐变定义
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', 'iris-gradient');
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '50%');

    const stops = [
        { offset: '0%', color: '#644c95' },    // 深紫色中心
        { offset: '30%', color: '#4b6cb7' },   // 蓝紫色过渡
        { offset: '70%', color: '#354a77' },   // 深蓝色边缘
        { offset: '100%', color: '#1a1f3c' }   // 深色外圈
    ];

    stops.forEach(stop => {
        const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopEl.setAttribute('offset', stop.offset);
        stopEl.setAttribute('stop-color', stop.color);
        gradient.appendChild(stopEl);
    });

    defs.appendChild(gradient);
    eyeIcon.appendChild(defs);

    // 创建眼睛部件
    const eyeOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    eyeOutline.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
    eyeOutline.classList.add('outline-moving');
    
    const eyeIris = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eyeIris.setAttribute('id', 'eye-iris');
    eyeIris.setAttribute('cx', '12');
    eyeIris.setAttribute('cy', '12');
    eyeIris.setAttribute('r', '3');
    eyeIris.classList.add('iris-moving');

    eyeIcon.appendChild(eyeOutline);
    eyeIcon.appendChild(eyeIris);
    container.appendChild(eyeIcon);

    // 面试内容模糊功能
    let blurEnabled = false;
    const blurWords = ['JavaGuide', '面试', '简历', '题', '面经'];
    
    function wrapTextWithSpan(textContent) {
        let result = textContent;
        for (const word of blurWords) {
            const regex = new RegExp(`(${word})`, 'g');
            result = result.replace(regex, '<span class="blur-text">$1</span>');
        }
        return result;
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentNode;
            if (parent && parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE') {
                const newHtml = wrapTextWithSpan(node.textContent);
                if (newHtml !== node.textContent) {
                    const span = document.createElement('span');
                    span.innerHTML = newHtml;
                    parent.replaceChild(span, node);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.childNodes.length === 0 && node.textContent) {
                node.innerHTML = wrapTextWithSpan(node.textContent);
            } else {
                Array.from(node.childNodes).forEach(processNode);
            }
        }
    }

    function unwrapBlurredText(element) {
        const blurredSpans = element.querySelectorAll('.blur-text');
        blurredSpans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });
    }

    // 状态管理
    let isEyeClosed = false;

    // 添加一个变量来追踪眨眼动画的 timeout
    let blinkTimeout = null;

    // 修改眨眼控制函数
    const blinkEye = () => {
        if (!isEyeClosed) {
            // 移除现有的动画类
            eyeOutline.classList.remove('outline-moving');
            eyeIris.classList.remove('iris-moving');
            eyeIris.style.visibility = 'hidden';
            
            // 添加眨眼动画
            eyeOutline.classList.add('eye-blinking');
            
            // 清除之前的 timeout
            if (blinkTimeout) {
                clearTimeout(blinkTimeout);
            }
            
            // 设置新的 timeout
            blinkTimeout = setTimeout(() => {
                eyeOutline.classList.remove('eye-blinking');
                
                if (!isEyeClosed) {  // 再次检查状态
                    eyeIris.style.visibility = 'visible';
                    
                    // 如果不是悬停状态，恢复原来的动画
                    if (!container.matches(':hover')) {
                        eyeOutline.classList.add('outline-moving');
                        eyeIris.classList.add('iris-moving');
                    }
                }
            }, 100);
        }
    };

    // 设置眨眼定时器
    const startBlinkInterval = () => {
        // 每5秒眨眼两次
        setInterval(() => {
            blinkEye();
            // 100ms后进行第二次眨眼
            setTimeout(blinkEye, 400);
        }, 5000);
    };

    // 启动眨眼定时器
    startBlinkInterval();

    // 修改点击事件处理器
    container.addEventListener('click', () => {
        // 获得导航栏和侧边栏元素
        const sidebar = document.getElementById('sidebar');
        const navbar = document.getElementById('navbar');
        // 清除正在进行的眨眼动画 timeout
        if (blinkTimeout) {
            clearTimeout(blinkTimeout);
            blinkTimeout = null;
        }
        
        isEyeClosed = !isEyeClosed;
        eyeOutline.classList.remove('eye-blinking');
        
        if (isEyeClosed) {
            // 闭眼状态：下弧线 + 睫毛
            eyeOutline.setAttribute('d', 'M3 14 Q12 18 21 14 M2 12 L4 13 M20 12 L22 13');
            eyeIris.style.visibility = 'hidden';
            eyeOutline.classList.remove('outline-moving');
            eyeIris.classList.remove('iris-moving');
            if (sidebar) {
                // 隐藏侧边栏
                sidebar.style.display = 'none';
            }
            if (navbar) {
                // 隐藏导航栏
                navbar.style.display = 'none';
            }
            // 模糊面试内容
            processNode(document.body);
        } else {
            // 睁眼状态
            eyeOutline.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
            eyeIris.style.visibility = 'visible';
            if (!container.matches(':hover')) {
                eyeOutline.classList.add('outline-moving');
                eyeIris.classList.add('iris-moving');
            }
            if (sidebar) {
                // 显示侧边栏
                sidebar.style.display = '';
            }
            if (navbar) {
                // 显示导航栏
                navbar.style.display = '';
            }
            // 取消模糊面试内容
            unwrapBlurredText(document.body);
        }
    });

    // 悬停控制动画
    container.addEventListener('mouseenter', () => {
        if (!isEyeClosed) {
            eyeIris.classList.remove('iris-moving');
            eyeOutline.classList.remove('outline-moving');
        }
    });

    container.addEventListener('mouseleave', () => {
        if (!isEyeClosed) {
            eyeIris.classList.add('iris-moving');
            eyeOutline.classList.add('outline-moving');
        }
    });

    document.body.appendChild(container);
})();
