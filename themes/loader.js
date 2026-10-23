/* =========================================================
   🎨 محرك الثيمات — يطبق التغييرات تلقائياً
   ========================================================= */

(function() {
    'use strict';
    
    const themeName = (window.ACTIVE_THEME || 'medical').toLowerCase();
    const themeData = window['THEME_' + themeName.toUpperCase()];
    
    if (!themeData) {
        console.error('❌ الثيم غير موجود:', themeName);
        return;
    }
    
    console.log('🎨 تحميل الثيم:', themeData.name);
    
    // 1. تطبيق الألوان كـ CSS Variables
    const root = document.documentElement;
    Object.entries(themeData.colors).forEach(([key, value]) => {
        root.style.setProperty('--theme-' + key, value);
    });
    
    // 2. إضافة كلاس للـ body
    document.body.classList.add('theme-' + themeName);
    
    // 3. تحميل ملف CSS للثيم (إن وجد)
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'css/themes/' + themeName + '.css';
    cssLink.onerror = () => console.log('ℹ️ لا يوجد CSS خاص بـ:', themeName);
    document.head.appendChild(cssLink);
    
    // 4. تطبيق النصوص عند جاهزية DOM
    function applyTheme() {
        // الترويسة
        const h2 = document.querySelector('.poster-header h2');
        if (h2) h2.textContent = themeData.department;
        
        const h3 = document.querySelector('.poster-header h3');
        if (h3) h3.textContent = themeData.nameEn;
        
        const atomIcon = document.querySelector('.poster-header .atom-icon');
        if (atomIcon) atomIcon.textContent = themeData.icon;
        
        // رسالة التهنئة (في الترويسة)
        const congratsLines = document.querySelectorAll('.congrats-message .congrats-line');
        if (congratsLines[0]) congratsLines[0].innerHTML = themeData.congratsMessage;
        if (congratsLines[1]) congratsLines[1].innerHTML = themeData.congratsBody;
        
        const congratsHigh = document.querySelector('.congrats-message .congrats-highlight');
        if (congratsHigh) congratsHigh.innerHTML = themeData.congratsHighlight;
        
        const congratsFinal = document.querySelector('.congrats-message .congrats-final');
        if (congratsFinal) congratsFinal.innerHTML = themeData.congratsFinal;
        
        // شاشة المفاجأة
        const spMsgDept = document.querySelector('.sp-msg-dept');
        if (spMsgDept) spMsgDept.textContent = themeData.department;
        
        const spMsgText = document.querySelector('.sp-msg-text');
        if (spMsgText && themeData.surpriseMessage) {
            spMsgText.innerHTML = themeData.surpriseMessage;
        }
        
        const spCertText = document.querySelector('.sp-cert-text');
        if (spCertText) {
            spCertText.innerHTML = 'قد أكمل بنجاح متطلبات<br>' + themeData.certText;
        }
        
        // شهادة في نافذة منفصلة
        const certTextModal = document.querySelector('.cert-modal-content .sp-cert-text');
        if (certTextModal) {
            certTextModal.innerHTML = 'قد أكمل بنجاح متطلبات<br>' + themeData.certText;
        }
        
        console.log('✅ تم تطبيق الثيم:', themeData.name);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
        applyTheme();
    }
})();