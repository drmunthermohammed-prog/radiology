/* =========================================================
   X-Ray Wall - Personal Journey (Mandatory Welcome Path)
   ========================================================= */
(function() {
    'use strict';

    const $ = id => document.getElementById(id);

    const wall = $('xwWall');
    const narrative = $('xwNarrative');
    const startWrap = $('xwStartWrap');
    const startBtn = $('xwStartBtn');
    const endActions = $('xwEndActions');
    const replayBtn = $('xwReplayBtn');
    const counterEl = $('xwCounter');

    if (!wall || !startBtn) return;
    if (typeof students === 'undefined' || !students.length) {
        console.error('❌ students.js غير محمّلة');
        return;
    }

    const STORAGE_KEY = 'selected_student_v1';

function getUser() {
    let raw = null;
    let source = '';
    
    // 1. جرب localStorage أولاً
    try {
        raw = localStorage.getItem(STORAGE_KEY);
        if (raw) source = 'localStorage';
    } catch (e) {}
    
    // 2. إذا فشل، جرب sessionStorage
    if (!raw) {
        try {
            raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) source = 'sessionStorage';
        } catch (e) {}
    }
    
    if (!raw) {
        console.warn('❌ لا يوجد اسم محفوظ في أي مكان');
        return null;
    }
    
    console.log(`✅ وُجد الاسم في ${source}`);
    
    try {
        const saved = JSON.parse(raw);
        if (saved && saved.id) {
            const s = students.find(x => x.id === saved.id);
            if (s) {
                console.log(`✅ المستخدم: ${s.name} (id=${saved.id})`);
                return s;
            }
        }
    } catch (e) {
        console.error('⚠️ JSON خاطئ');
    }
    
    return null;
}

    // ===== شاشة "لم تختار اسمك بعد" =====
    function showAccessDenied() {
        // إخفاء كل عناصر التجربة
        wall.style.display = 'none';
        startWrap.style.display = 'none';
        document.querySelector('.xw-header').style.display = 'none';
        document.querySelector('.xw-narrative-wrap').style.display = 'none';
        if (counterEl) counterEl.style.display = 'none';

        // إنشاء رسالة
        const denied = document.createElement('div');
        denied.className = 'xw-denied';
        denied.innerHTML = `
            <div class="xw-denied-icon">🔒</div>
            <div class="xw-denied-title">التجربة محمية</div>
            <div class="xw-denied-sub">
                يجب عليك اختيار اسمك من الصفحة الرئيسية أولاً
            </div>
            <a href="index.html" class="xw-denied-btn">
                <span>🏠</span>
                <span>اذهب للرئيسية</span>
            </a>
            <div class="xw-denied-hint">
                اختر اسمك، أكمل المفاجأة، ثم عد إلى جدار الأشعة
            </div>
        `;
        document.body.appendChild(denied);
    }

    // ===== التشغيل =====
    const currentUser = getUser();

    if (!currentUser) {
        console.log('🔒 لا يوجد مستخدم — التجربة محمية');
        showAccessDenied();
        return;
    }

    console.log(`👤 المستخدم: ${currentUser.name}`);

    // بقية الكود كما هو...
    // (friends, buildNarrative, buildWall, createCard, showNarrative, revealCard, 
    //  playRevealSound, startMusic, fadeOutMusic, startExperience, resetExperience, 
    //  الأحداث، التشغيل)

    function getFriends(userId) {
        if (typeof friendships !== 'undefined' && friendships[userId]) {
            return friendships[userId]
                .map(id => students.find(s => s.id === id))
                .filter(Boolean);
        }
        const others = students.filter(s => s.id !== userId);
        return [...others].sort(() => Math.random() - 0.5).slice(0, 5);
    }

    function shortName(fullName) {
        const parts = fullName.trim().split(/\s+/);
        return parts.length <= 2 ? fullName : parts.slice(0, 2).join(' ');
    }

    const friends = getFriends(currentUser.id);

    function buildNarrative() {
        const items = [
            { time: 800,  text: 'كنتُ وحيداً...' },
            { time: 3800, text: 'كنتُ أخاف أن أبقى وحدي' },
            { time: 6800, text: 'ثم دخلتُ قسم الأشعة...' }
        ];
        const friendStart = 8800;
        const friendStep = 3000;
        friends.forEach((friend, i) => {
            const name = shortName(friend.name);
            let text;
            if (i === 0)      text = `وهناك... التقيتُ بـ ${name}`;
            else if (i === 1) text = `ثم ${name}`;
            else if (i === 2) text = `و${name}`;
            else if (i === 3) text = `و${name}`;
            else              text = `وأخيراً... ${name}`;
            items.push({ time: friendStart + i * friendStep, text, revealId: friend.id });
        });
        const end = friendStart + friends.length * friendStep;
        items.push({ time: end + 200,  text: 'معاً... كوّنا عائلة' });
        items.push({ time: end + 3200, text: 'ضحكنا، تعبنا، سهرنا، ونجحنا... معاً' });
        items.push({ time: end + 6200, text: 'كنّا زملاء... وأصبحنا عائلة', big: true });
        return items;
    }

    const NARRATIVE = buildNarrative();
    const SHOW_ACTIONS_AT = NARRATIVE[NARRATIVE.length - 1].time + 2500;

    function buildWall() {
        wall.innerHTML = '';
        const userCard = createCard(currentUser, true);
        userCard.style.animationDelay = '0s';
        wall.appendChild(userCard);
        friends.forEach((friend, i) => {
            const card = createCard(friend, false);
            card.style.animationDelay = ((i + 1) * 0.08) + 's';
            wall.appendChild(card);
        });
        counterEl.textContent = `0 / ${friends.length + 1}`;
    }

    function createCard(student, isUser) {
        const card = document.createElement('div');
        card.className = 'xw-card' + (isUser ? ' is-user' : '');
        card.dataset.studentId = student.id;
        card.innerHTML = `
            <div class="xw-card-inner">
                <div class="xw-card-face xw-card-cover">☢</div>
                <div class="xw-card-face xw-card-photo">
                    <img src="${student.adultImg || student.childImg  || ''}" 
                         alt="${student.name}" 
                         loading="lazy"
                         onerror="this.style.display='none'">
                    <div class="xw-card-name">${isUser ? 'أنت' : shortName(student.name)}</div>
                </div>
            </div>
        `;
        return card;
    }

    let textTimer = null;
    function showNarrative(text, big = false) {
        if (textTimer) clearTimeout(textTimer);
        narrative.classList.add('fade-out');
        textTimer = setTimeout(() => {
            narrative.textContent = text;
            narrative.classList.toggle('big', big);
            narrative.classList.remove('fade-out', 'visible');
            void narrative.offsetWidth;
            narrative.classList.add('visible');
        }, 400);
    }

    function revealCard(studentId) {
        const card = wall.querySelector(`[data-student-id="${studentId}"]`);
        if (!card || card.classList.contains('revealed')) return;
        card.classList.add('revealed');
        card.style.animation = 'revealPulse 0.6s ease-out';
        setTimeout(() => { card.style.animation = ''; }, 700);
        const revealed = wall.querySelectorAll('.xw-card.revealed').length;
        counterEl.textContent = `${revealed} / ${friends.length + 1}`;
        if (revealed === friends.length + 1) counterEl.classList.add('complete');
        playRevealSound();
    }

    let audioCtx = null;
    function playRevealSound() {
        try {
            if (!audioCtx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                audioCtx = new AC();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } catch (e) {}
    }

    let bgMusic = null;
    function startMusic() {
        const sources = [
            'https://cdn.jsdelivr.net/gh/drmunthermohammed-prog/Medical-Physics-2027@main/music/envelope.mp3',
            'music/envelope.mp3',
            'https://cdn.jsdelivr.net/gh/drmunthermohammed-prog/Medical-Physics-2027@main/music/track1.mp3'
        ];
        bgMusic = new Audio();
        bgMusic.volume = 0;
        bgMusic.loop = true;
        let idx = 0;
        function tryNext() {
            if (idx >= sources.length) return;
            bgMusic.src = sources[idx++];
            bgMusic.play().then(() => {
                let vol = 0;
                const fade = setInterval(() => {
                    vol += 0.02;
                    if (vol >= 0.35) { vol = 0.35; clearInterval(fade); }
                    bgMusic.volume = vol;
                }, 80);
            }).catch(() => tryNext());
        }
        bgMusic.addEventListener('error', tryNext);
        tryNext();
    }

    function fadeOutMusic(duration = 2500) {
        if (!bgMusic) return;
        const startVol = bgMusic.volume;
        const startTime = Date.now();
        const fade = setInterval(() => {
            const p = Math.min((Date.now() - startTime) / duration, 1);
            bgMusic.volume = Math.max(0, startVol * (1 - p));
            if (p >= 1) { clearInterval(fade); bgMusic.pause(); }
        }, 60);
    }

    let timers = [];
    let started = false;

    function startExperience() {
        if (started) return;
        started = true;
        startWrap.classList.add('hidden');
        startMusic();
        counterEl.classList.add('visible');
        setTimeout(() => revealCard(currentUser.id), 400);
        NARRATIVE.forEach(item => {
            timers.push(setTimeout(() => {
                showNarrative(item.text, item.big || false);
                if (item.revealId) revealCard(item.revealId);
            }, item.time));
        });
        timers.push(setTimeout(() => {
            endActions.classList.add('visible');
            fadeOutMusic(3000);
        }, SHOW_ACTIONS_AT));
    }

    function resetExperience() {
        timers.forEach(t => clearTimeout(t));
        timers = [];
        started = false;
        if (bgMusic) { bgMusic.pause(); bgMusic.currentTime = 0; }
        endActions.classList.remove('visible');
        counterEl.classList.remove('visible', 'complete');
        narrative.classList.remove('visible', 'big');
        narrative.textContent = '';
        buildWall();
        startWrap.classList.remove('hidden');
    }

    startBtn.addEventListener('click', startExperience);
    if (replayBtn) replayBtn.addEventListener('click', resetExperience);

    buildWall();
    console.log(`✅ xray-wall: ${currentUser.name} + ${friends.length} صديق`);
})();