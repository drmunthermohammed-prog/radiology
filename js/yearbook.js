/* =========================================================
   Digital Yearbook - دفتر التوقيعات
   ========================================================= */
(function() {
    'use strict';

    const $ = id => document.getElementById(id);

    const commentsArea = $('ybComments');
    const counterEl = $('ybCounter');
    const userNameEl = $('ybUserName');
    const userImgEl = $('ybUserImg');

    if (!commentsArea) {
        console.error('❌ ybComments غير موجود');
        return;
    }

    // ===== المستخدم =====
    function getUser() {
        try {
            const saved = JSON.parse(localStorage.getItem('selected_student_v1') || 'null');
            if (saved && typeof students !== 'undefined') {
                const s = students.find(x => x.id === saved.id);
                if (s) return s;
            }
        } catch (e) {}
        return (typeof students !== 'undefined' && students.length) ? students[0] : null;
    }

    const user = getUser();
    if (!user) {
        console.error('❌ لا يوجد طلاب');
        return;
    }

    userNameEl.textContent = user.name;
    userImgEl.src = user.adultImg || user.childImg || '';
    userImgEl.onerror = () => {
        userImgEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%230a1428" width="100" height="100"/><text x="50" y="65" font-size="40" fill="%2300d9e1" text-anchor="middle">☢</text></svg>';
    };

    // ===== التوقيعات =====
    const allSignatures = (typeof signatures !== 'undefined' && signatures.length) ? signatures : [];
    if (allSignatures.length === 0) {
        console.warn('⚠️ لا توجد توقيعات');
        return;
    }

    // ===== Shuffle Bag (لا تكرار حتى تنتهي الكل) =====
    let bag = [];
    function nextSignature() {
        if (bag.length === 0) {
            bag = [...allSignatures].sort(() => Math.random() - 0.5);
        }
        return bag.pop();
    }

    // ===== العداد =====
    let count = 0;
    function incrementCount() {
        count++;
        counterEl.textContent = count;
        counterEl.classList.remove('pop');
        void counterEl.offsetWidth; // trigger reflow
        counterEl.classList.add('pop');
    }

    // ===== إنشاء تعليق =====
    function spawnComment() {
        const sig = nextSignature();
        if (!sig) return;

        // 10% فرصة لتوقيع المطور
        const isDev = sig.fromDeveloper === true || Math.random() < 0.08;

        const variants = ['', 'gold', 'green'];
        const variant = isDev ? 'developer' : variants[Math.floor(Math.random() * variants.length)];

        const el = document.createElement('div');
        el.className = 'sign-comment ' + variant;

        // موقع أفقي عشوائي (يمين أو يسار)
        const offset = 2 + Math.random() * 20;
        if (Math.random() > 0.5) {
            el.style.right = offset + '%';
        } else {
            el.style.left = offset + '%';
        }

        // مدة عشوائية
        const duration = 9 + Math.random() * 4;
        el.style.animationDuration = duration + 's';

        // الحرف الأول
        const initial = (sig.name || '?').trim().charAt(0);

        el.innerHTML = `
            <div class="sign-avatar">${initial}</div>
            <div class="sign-content">
                <span class="sign-name">${sig.name}</span>
                <div class="sign-message">${sig.message}</div>
            </div>
        `;

        commentsArea.appendChild(el);
        incrementCount();

        // إزالة بعد انتهاء الحركة
        el.addEventListener('animationend', () => el.remove(), { once: true });

        // احتياطي
        setTimeout(() => el.remove(), duration * 1000 + 1500);
    }

    // ===== البدء =====
    // دفعة أولى (4 تعليقات متتالية بسرعة)
    for (let i = 0; i < 4; i++) {
        setTimeout(spawnComment, i * 500);
    }

    // التدفق المستمر
    setInterval(spawnComment, 1800);

    console.log(`✅ yearbook.js: ${user.name} — ${allSignatures.length} توقيع`);
})();