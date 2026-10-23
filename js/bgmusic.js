/* =========================================================
   🎵 bgmusic.js - موسيقى خلفية + زر تغيير الأغنية
   ========================================================= */
(function() {
    'use strict';
    console.log('🎵 bgmusic.js: بدء التحميل...');

    const TRACKS = [
        { file: 'https://cdn.jsdelivr.net/gh/drmunthermohammed-prog/Medical-Physics-2027@main/music/welcome.mp3', name: 'ألحان الترحيب' },
        { file: 'https://cdn.jsdelivr.net/gh/drmunthermohammed-prog/Medical-Physics-2027@main/music/envelope.mp3', name: 'ألحان هادئة' },
        { file: 'https://cdn.jsdelivr.net/gh/drmunthermohammed-prog/Medical-Physics-2027@main/music/book.mp3', name: 'لحن التخرج' }
    ];

    const STORAGE_KEY = 'bgmusic_state_v2';

    // ألوان كل قسم
    const DEPT_COLORS = {
        physics:    ['#0ea5e9', '#3b82f6'],
        law:        ['#8b0000', '#c9a961'],
        radiology:  ['#0891b2', '#06b6d4'],
        dentistry:  ['#10b981', '#059669'],
        nursing:    ['#5eb8e8', '#0284c7'],
        pharmacy:   ['#10b981', '#d4af37'],
        anesthesia: ['#7c3aed', '#a855f7']
    };

    const dept = document.body.dataset.dept || 'physics';
    const [C1, C2] = DEPT_COLORS[dept] || DEPT_COLORS.physics;

    let audio = null;
    let isPlaying = false;
    let currentTrack = 0;
    let isMuted = false;
    let waitingAutoplay = false;

    // ===== حقن CSS =====
    function injectCSS() {
        if (document.getElementById('bgmusic-style')) return;
        const style = document.createElement('style');
        style.id = 'bgmusic-style';
        style.textContent = `
            #bgMusicToggle, #bgMusicChanger {
                position: fixed; left: 20px;
                width: 55px; height: 55px; border-radius: 50%;
                color: #fff; border: 3px solid rgba(255,255,255,0.7);
                font-size: 1.5rem; cursor: pointer;
                z-index: 99999; display: flex;
                align-items: center; justify-content: center;
                transition: transform 0.3s;
                -webkit-tap-highlight-color: transparent;
                background: linear-gradient(135deg, ${C1}, ${C2});
                box-shadow: 0 8px 25px ${C1}80;
            }
            #bgMusicToggle { bottom: 20px; }
            #bgMusicChanger { bottom: 85px; font-size: 1.3rem; }
            #bgMusicToggle:hover, #bgMusicChanger:hover { transform: scale(1.15); }
            #bgMusicToggle.muted {
                background: linear-gradient(135deg, #64748b, #475569);
                box-shadow: 0 8px 25px rgba(100,116,139,0.5);
            }
            #bgMusicToggle:not(.muted) {
                animation: bgmusic-pulse 2s ease-in-out infinite;
            }
            @keyframes bgmusic-pulse {
                0%, 100% { box-shadow: 0 8px 25px ${C1}99; }
                50% { box-shadow: 0 8px 35px ${C1}; }
            }
            #bgMusicPanel {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.7); backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 100000; display: none;
                align-items: center; justify-content: center;
                padding: 20px;
            }
            #bgMusicPanel.active { display: flex; }
            .bmp-inner {
                background: #fff; border-radius: 20px; padding: 25px;
                max-width: 400px; width: 100%;
                box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                border: 2px solid ${C1};
                animation: bmpSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes bmpSlide {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .bmp-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 20px; padding-bottom: 15px;
                border-bottom: 2px solid ${C1}33;
            }
            .bmp-title {
                font-family: 'Aref Ruqaa', 'Cairo', serif;
                font-size: 1.3rem; color: ${C1}; font-weight: 700;
            }
            .bmp-close {
                width: 34px; height: 34px; border-radius: 50%;
                background: rgba(239,68,68,0.1); border: 1px solid #ef4444;
                color: #ef4444; cursor: pointer; font-weight: bold;
                transition: all 0.3s;
            }
            .bmp-close:hover { background: #ef4444; color: #fff; transform: rotate(90deg); }
            .bmp-list { display: flex; flex-direction: column; gap: 10px; }
            .bmp-item {
                display: flex; align-items: center; gap: 12px;
                padding: 14px 16px; background: #f8fafc;
                border: 2px solid transparent; border-radius: 12px;
                cursor: pointer; transition: all 0.3s;
                font-family: 'Cairo', sans-serif;
            }
            .bmp-item:hover {
                background: ${C1}15; border-color: ${C1}66;
                transform: translateX(-4px);
            }
            .bmp-item.active {
                background: linear-gradient(135deg, ${C1}22, ${C2}22);
                border-color: ${C1};
                box-shadow: 0 4px 15px ${C1}33;
            }
            .bmp-icon {
                width: 32px; height: 32px; border-radius: 50%;
                background: linear-gradient(135deg, ${C1}, ${C2});
                color: #fff; display: flex;
                align-items: center; justify-content: center;
                font-size: 0.9rem; flex-shrink: 0;
            }
            .bmp-item.active .bmp-icon { animation: bmpPulse 1.5s ease-in-out infinite; }
            @keyframes bmpPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
            }
            .bmp-name {
                flex: 1; font-weight: 700;
                color: #1e293b; font-size: 0.95rem;
            }
            .bmp-item.active .bmp-name { color: ${C1}; }
        `;
        document.head.appendChild(style);
    }

    // ===== بناء الأزرار =====
    function buildButtons() {
        // زر الموسيقى
        let btn = document.getElementById('bgMusicToggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'bgMusicToggle';
            btn.type = 'button';
            btn.innerHTML = '<span id="bgMusicIcon">🔊</span>';
            document.body.appendChild(btn);
        }
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault();
            if (isPlaying) pauseMusic(); else playMusic(0);
        });

        // زر تغيير الأغنية
        let changerBtn = document.getElementById('bgMusicChanger');
        if (!changerBtn) {
            changerBtn = document.createElement('button');
            changerBtn.id = 'bgMusicChanger';
            changerBtn.type = 'button';
            changerBtn.innerHTML = '🎵';
            changerBtn.title = 'تغيير الأغنية';
            document.body.appendChild(changerBtn);
        }
        const newChanger = changerBtn.cloneNode(true);
        changerBtn.parentNode.replaceChild(newChanger, changerBtn);
        newChanger.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault();
            openTrackPanel();
        });
    }

    // ===== لوحة اختيار الأغنية =====
    function openTrackPanel() {
        let panel = document.getElementById('bgMusicPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'bgMusicPanel';
            panel.innerHTML = `
                <div class="bmp-inner">
                    <div class="bmp-header">
                        <span class="bmp-title">🎵 اختر الأغنية</span>
                        <button class="bmp-close">✕</button>
                    </div>
                    <div class="bmp-list"></div>
                </div>
            `;
            document.body.appendChild(panel);
            panel.querySelector('.bmp-close').addEventListener('click', closeTrackPanel);
            panel.addEventListener('click', (e) => {
                if (e.target === panel) closeTrackPanel();
            });
        }
        renderTrackList();
        panel.classList.add('active');
    }

    function closeTrackPanel() {
        const panel = document.getElementById('bgMusicPanel');
        if (panel) panel.classList.remove('active');
    }

    function renderTrackList() {
        const list = document.querySelector('#bgMusicPanel .bmp-list');
        if (!list) return;
        list.innerHTML = '';
        TRACKS.forEach((track, i) => {
            const isActive = i === currentTrack;
            const isPlayingNow = isActive && isPlaying;
            const item = document.createElement('div');
            item.className = 'bmp-item' + (isActive ? ' active' : '');
            item.innerHTML = `
                <span class="bmp-icon">${isPlayingNow ? '🔊' : (isActive ? '⏸' : '▶')}</span>
                <span class="bmp-name">${track.name}</span>
            `;
            item.addEventListener('click', () => {
                if (i === currentTrack) {
                    if (isPlaying) pauseMusic(); else playMusic(0);
                } else {
                    currentTrack = i;
                    loadTrack(i);
                    playMusic(0);
                }
                renderTrackList();
            });
            list.appendChild(item);
        });
    }

    // ===== حفظ واسترجاع =====
    function loadState() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null') || 
                   { time: 0, playing: false, track: 0, muted: false };
        } catch (e) {
            return { time: 0, playing: false, track: 0, muted: false };
        }
    }

    function saveState() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                track: currentTrack, playing: isPlaying,
                muted: isMuted, time: audio ? audio.currentTime : 0
            }));
        } catch (e) {}
    }

    // ===== الصوت =====
    function createAudio() {
        if (audio) return;
        audio = new Audio();
        audio.loop = false; audio.volume = 0.5; audio.preload = 'auto';
        audio.addEventListener('ended', () => {
            currentTrack = (currentTrack + 1) % TRACKS.length;
            loadTrack(currentTrack);
            if (isPlaying) audio.play().catch(() => {});
            saveState();
        });
        audio.addEventListener('error', () => {
            console.warn('⚠️ تعذر التحميل:', TRACKS[currentTrack].file);
            isPlaying = false;
            updateUI();
        });
        setInterval(() => { if (audio && isPlaying) saveState(); }, 3000);
        window.addEventListener('beforeunload', saveState);
        window.addEventListener('pagehide', saveState);
        document.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });
    }

    function loadTrack(index) {
        if (!TRACKS[index]) return;
        currentTrack = index;
        audio.src = TRACKS[index].file;
        audio.load();
    }

    function playMusic(resumeTime) {
        createAudio();
        if (!audio.src) loadTrack(currentTrack);
        audio.muted = isMuted;

        const doPlay = () => {
            if (resumeTime > 0) { try { audio.currentTime = resumeTime; } catch (e) {} }
            audio.play().then(() => {
                isPlaying = true;
                waitingAutoplay = false;
                updateUI();
                saveState();
                console.log('🎵 يعمل');
            }).catch(err => {
                console.warn('⚠️ منع التشغيل:', err.name);
                isPlaying = false;
                waitingAutoplay = true;
                updateUI();
                const resume = () => {
                    if (!waitingAutoplay) return;
                    waitingAutoplay = false;
                    audio.play().then(() => { isPlaying = true; updateUI(); saveState(); }).catch(()=>{});
                };
                document.addEventListener('click', resume, { once: true });
                document.addEventListener('touchstart', resume, { once: true });
            });
        };

        if (audio.readyState >= 2) doPlay();
        else {
            const onCanPlay = () => {
                audio.removeEventListener('canplay', onCanPlay);
                doPlay();
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.load();
        }
    }

    function pauseMusic() {
        if (audio && !audio.paused) audio.pause();
        isPlaying = false;
        waitingAutoplay = false;
        updateUI();
        saveState();
    }

    function updateUI() {
        const btn = document.getElementById('bgMusicToggle');
        const icon = document.getElementById('bgMusicIcon');
        if (btn && icon) {
            if (isPlaying && !isMuted) {
                btn.classList.remove('muted');
                icon.textContent = '🔊';
            } else {
                btn.classList.add('muted');
                icon.textContent = '🔇';
            }
        }
    }

    // ===== التهيئة =====
    function init() {
        injectCSS();
        buildButtons();
        const saved = loadState();
        currentTrack = saved.track || 0;
        isMuted = !!saved.muted;
        createAudio();
        loadTrack(currentTrack);
        updateUI();

        setTimeout(() => {
            if (!saved.playing) {
                const firstPlay = () => { playMusic(0); document.removeEventListener('click', firstPlay); };
                document.addEventListener('click', firstPlay, { once: true });
                return;
            }

            const surpriseScreen = document.getElementById('surpriseScreen');
            const isSurpriseActive = surpriseScreen && 
                                     surpriseScreen.classList.contains('active') &&
                                     surpriseScreen.offsetWidth > 0;
            
            if (isSurpriseActive) {
                const observer = new MutationObserver(() => {
                    if (!surpriseScreen.classList.contains('active') || surpriseScreen.offsetWidth === 0) {
                        playMusic(0);
                        observer.disconnect();
                    }
                });
                observer.observe(surpriseScreen, { attributes: true, attributeFilter: ['class', 'style'] });
            } else {
                playMusic(saved.time || 0);
            }
        }, 600);

        console.log('✅ bgmusic.js: جاهز');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else init();

    // API
    window.BgMusic = {
        play: () => playMusic(0),
        pause: pauseMusic,
        toggle: () => isPlaying ? pauseMusic() : playMusic(0),
        isPlaying: () => isPlaying,
        setTrack: (i) => { currentTrack = i; loadTrack(i); playMusic(0); }
    };
})();