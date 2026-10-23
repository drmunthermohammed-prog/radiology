/* =========================================================
   🎬 Preloader - يحمّل كل الصور والأصوات قبل عرض الموقع
   ========================================================= */
(function() {
    'use strict';
    
    const DEPT_THEMES = {
        physics:     { bg: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)', accent: '#fbbf24', icon: '⚛️', name: 'الفيزياء الطبية' },
        law:         { bg: 'linear-gradient(135deg, #1a0a0a, #8b0000)', accent: '#c9a961', icon: '⚖️', name: 'كلية القانون' },
        radiology:   { bg: 'linear-gradient(135deg, #051426, #0891b2)', accent: '#00d9e1', icon: '☢️', name: 'تقنيات الأشعة' },
        dentistry:   { bg: 'linear-gradient(135deg, #064e3b, #10b981)', accent: '#fbbf24', icon: '🦷', name: 'طب الأسنان' },
        nursing:     { bg: 'linear-gradient(135deg, #1e3a5f, #5eb8e8)', accent: '#ff8fa3', icon: '🩺', name: 'علوم التمريض' },
        pharmacy:    { bg: 'linear-gradient(135deg, #064e3b, #10b981)', accent: '#d4af37', icon: '💊', name: 'علوم الصيدلة' },
        anesthesia:  { bg: 'linear-gradient(135deg, #0f0a1f, #7c3aed)', accent: '#fbbf24', icon: '💉', name: 'تقنيات التخدير' }
    };
    
    const dept = document.body.dataset.dept || 'physics';
    const theme = DEPT_THEMES[dept] || DEPT_THEMES.physics;
    
    function buildPreloader() {
        const html = `
            <div id="site-preloader" style="
                position: fixed; inset: 0; z-index: 2147483647;
                background: ${theme.bg};
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 20px; transition: opacity 0.8s ease;
            ">
                <div style="font-size: 5rem; margin-bottom: 20px;
                    filter: drop-shadow(0 0 30px ${theme.accent});
                    animation: preloaderFloat 2.5s ease-in-out infinite;">${theme.icon}</div>
                
                <h1 style="font-family: 'Aref Ruqaa', serif; font-size: 2.2rem;
                    color: ${theme.accent}; margin-bottom: 8px;
                    text-shadow: 0 0 25px ${theme.accent};">جامعة الهادي</h1>
                
                <h2 style="font-family: 'Cairo', sans-serif; font-size: 1.1rem;
                    color: rgba(255,255,255,0.9); margin-bottom: 30px;
                    letter-spacing: 2px;">${theme.name} — دفعة 2027</h2>
                
                <p style="font-family: 'Amiri', serif; font-size: 1.15rem;
                    color: rgba(255,255,255,0.85); margin-bottom: 25px;
                    text-align: center; font-style: italic; max-width: 400px;">
                    🎓 مبروك التخرج... هذه اللحظة تستحق الانتظار 🎓
                </p>
                
                <div style="width: 85%; max-width: 400px; height: 8px;
                    background: rgba(255,255,255,0.15); border-radius: 10px;
                    overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
                    <div id="site-preloader-bar" style="
                        height: 100%; width: 0%;
                        background: linear-gradient(90deg, ${theme.accent}, #fff, ${theme.accent});
                        background-size: 200% 100%; border-radius: 10px;
                        transition: width 0.2s ease;
                        box-shadow: 0 0 15px ${theme.accent};
                        animation: preloaderShimmer 2s linear infinite;"></div>
                </div>
                
                <p id="site-preloader-text" style="font-family: 'Cairo', sans-serif;
                    font-size: 0.9rem; color: rgba(255,255,255,0.8);
                    margin-top: 18px; text-align: center;">
                    جاري تحميل المواد المطلوبة...
                </p>
                
                <p id="site-preloader-count" style="font-family: 'Cairo', sans-serif;
                    font-size: 0.75rem; color: rgba(255,255,255,0.5);
                    margin-top: 8px;">0 / 0</p>
            </div>
            
            <style>
                @keyframes preloaderFloat {
                    0%, 100% { transform: translateY(0) rotate(-3deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @keyframes preloaderShimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                body.preloading { overflow: hidden !important; }
            </style>
        `;
        document.body.insertAdjacentHTML('afterbegin', html);
        document.body.classList.add('preloading');
    }
    
    function updateProgress(loaded, total) {
        const bar = document.getElementById('site-preloader-bar');
        const count = document.getElementById('site-preloader-count');
        const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
        if (bar) bar.style.width = percent + '%';
        if (count) count.textContent = `${loaded} / ${total} (${percent}%)`;
    }
    
    function finishPreloader() {
        const preloader = document.getElementById('site-preloader');
        if (!preloader) return;
        
        setTimeout(() => {
            preloader.style.opacity = '0';
            document.body.classList.remove('preloading');
            setTimeout(() => {
                preloader.remove();
                document.dispatchEvent(new CustomEvent('preloaderDone'));
                console.log('✅ Preloader: انتهى');
            }, 800);
        }, 300);
    }
    
    function startLoading() {
        buildPreloader();
        
        // ⬇️ قائمة الصور المطلوب تحميلها
        const imagesToLoad = new Set();
        
        // 1. صور من data/students.js
        if (typeof students !== 'undefined' && Array.isArray(students)) {
            students.forEach(s => {
                if (s.childImg) imagesToLoad.add(s.childImg);
                if (s.adultImg) imagesToLoad.add(s.adultImg);
            });
        }
        
        // 2. ⬅️ الصور الخاصة بقسم الأشعة (chest-photo.png وغيرها)
        if (dept === 'radiology') {
            imagesToLoad.add('images/xray/chest-photo.png');
            imagesToLoad.add('images/xray/chest-xray.png'); // إن وجدت
        }
        
        // 3. صور welcome (شاشة المفاجأة) - الشعارات
        imagesToLoad.add('images/logo.png');
        imagesToLoad.add('images/graduation-photo.jpg');
        
        // ⬇️ الأصوات
        const audiosToLoad = [
            'music/welcome.mp3',
            'music/envelope.mp3',
            'music/zaghareet.mp3',
            'music/book.mp3',
            'music/track1.mp3'
        ];
        
        const totalItems = imagesToLoad.size + audiosToLoad.length;
        let loadedItems = 0;
        
        updateProgress(0, totalItems);
        
        function onItemDone() {
            loadedItems++;
            updateProgress(loadedItems, totalItems);
            if (loadedItems >= totalItems) finishPreloader();
        }
        
        if (totalItems === 0) {
            finishPreloader();
            return;
        }
        
        // تحميل الصور
        imagesToLoad.forEach(src => {
            const img = new Image();
            img.onload = onItemDone;
            img.onerror = () => {
                console.warn(`⚠️ صورة مفقودة: ${src}`);
                onItemDone();
            };
            img.src = src;
        });
        
        // تحميل الأصوات
        audiosToLoad.forEach(src => {
            const audio = new Audio();
            audio.oncanplaythrough = () => { 
                audio.oncanplaythrough = null; 
                onItemDone(); 
            };
            audio.onerror = () => {
                console.warn(`⚠️ صوت مفقود: ${src}`);
                onItemDone();
            };
            audio.preload = 'auto';
            audio.src = src;
            audio.load();
        });
        
        // مهلة أمان (دقيقتان)
        setTimeout(() => {
            if (document.getElementById('site-preloader')) {
                console.warn('⚠️ التحميل تأخر، تخطي...');
                finishPreloader();
            }
        }, 120000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startLoading);
    } else {
        startLoading();
    }
})();