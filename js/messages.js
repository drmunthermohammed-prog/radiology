document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('holoGrid');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const randomBtn = document.getElementById('randomMsgBtn');
    
    const modal = document.getElementById('messageModal');
    const modalText = document.getElementById('modalText');
    const modalSender = document.getElementById('modalSender');
    const modalId = document.getElementById('modalId');
    const closeModal = document.getElementById('closeModal');

    if (!grid || typeof familyMessages === 'undefined') return;

    const messagesPerPage = 12;
    let currentPage = 1;
    let allMessages = [...familyMessages]; // ترتيب ثابت بدون خلط عشوائي

    // ================= الجزيئات =================
    const particlesContainer = document.getElementById('holoParticles');
    if (particlesContainer) {
        setInterval(() => {
            const p = document.createElement('div');
            p.className = 'holo-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (8 + Math.random() * 6) + 's';
            particlesContainer.appendChild(p);
            setTimeout(() => p.remove(), 14000);
        }, 300);
    }

// محاولة استئناف الموسيقى بعد أول تفاعل
document.addEventListener('click', function resumeOnce() {
    if (window.BgMusic && !window.BgMusic.isPlaying()) {
        window.BgMusic.play();
    }
    document.removeEventListener('click', resumeOnce);
}, { once: true });

    // ================= العرض =================
    function renderMessages() {
        const totalPages = Math.ceil(allMessages.length / messagesPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * messagesPerPage;
        const endIndex = startIndex + messagesPerPage;
        const pageMessages = allMessages.slice(startIndex, endIndex);

        grid.innerHTML = '';
        
        if (pageMessages.length === 0) {
            grid.innerHTML = '<p style="color: #00d9e1; text-align: center; width: 100%; grid-column: 1/-1; font-family: Orbitron;">NO DATA FOUND</p>';
        }

        pageMessages.forEach((msg, idx) => {
            const card = document.createElement('div');
            card.className = 'holo-card';
            
            // تلوين البطاقات بالتناوب (سيان / أخضر) لتعويض الفلاتر المحذوفة
            const isEven = (startIndex + idx) % 2 === 0;
            card.dataset.type = isEven ? 'friend' : 'family';

            const globalIndex = startIndex + idx + 1;
            const scanId = `SCAN-${String(globalIndex).padStart(3, '0')}`;
            const typeLabel = isEven ? 'FRIENDS' : 'FAMILY';
            const icon = isEven ? '🤝' : '👨‍👩‍👧‍👦';

            card.innerHTML = `
                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>
                <div class="card-scan-id">${scanId}</div>
                <div class="card-icon">${icon}</div>
                <div>
                    <div class="card-name">${msg.sender}</div>
                    <div class="card-type">${typeLabel}</div>
                </div>
            `;

            // تأثير 3D Tilt
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });

            // فتح النافذة
            card.addEventListener('click', () => {
                modalText.textContent = `"${msg.text}"`;
                modalSender.textContent = msg.sender;
                modalId.textContent = scanId;
                modal.classList.add('active');
            });

            grid.appendChild(card);
        });

        pageInfo.textContent = `SCAN ${String(currentPage).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    // ================= الإغلاق =================
    if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // ================= زر الرسالة العشوائية =================
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * allMessages.length);
            const randomMsg = allMessages[randomIndex];
            
            // لتوليد رقم SCAN عشوائي للرسالة العشوائية
            const randomScanNum = String(randomIndex + 1).padStart(3, '0'); 
            
            modalText.textContent = `"${randomMsg.text}"`;
            modalSender.textContent = randomMsg.sender;
            modalId.textContent = `SCAN-${randomScanNum}`;
            modal.classList.add('active');
        });
    }

    // ================= الترقيم =================
    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderMessages(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allMessages.length / messagesPerPage);
        if (currentPage < totalPages) { currentPage++; renderMessages(); }
    });

    renderMessages();
});