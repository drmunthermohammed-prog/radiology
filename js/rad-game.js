/* =========================================================
   ☢️ تأثيرات الأشعة - عظام وإشعاعات طافية
   ========================================================= */
(function() {
    const radBg = document.getElementById('radBg');
    if (!radBg) return;
    
    function createBone() {
        const icon = document.createElement('div');
        icon.className = 'bone-float';
        
        const icons = ['🦴', '☢️', '🩻', '💀', '⚡', '🔬'];
        icon.textContent = icons[Math.floor(Math.random() * icons.length)];
        
        const size = 1 + Math.random() * 1.5;
        icon.style.fontSize = size + 'rem';
        icon.style.left = (Math.random() * 100) + '%';
        icon.style.bottom = '-30px';
        icon.style.animationDuration = (10 + Math.random() * 10) + 's';
        
        radBg.appendChild(icon);
        setTimeout(() => icon.remove(), 22000);
    }
    
    setInterval(createBone, 2000);
    
    for (let i = 0; i < 3; i++) {
        setTimeout(createBone, i * 500);
    }
    
    console.log('☢️ تأثيرات الأشعة: تعمل');
})();