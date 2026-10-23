/* =========================================================
   Memory File - Compact
   ========================================================= */
(function() {
    'use strict';

    const DATA = {
        1: {
            findings: [
                { icon: "❤️", label: "قلب", text: "ينبض بسرعة عند رؤية الأصدقاء", sev: "normal" },
                { icon: "🧠", label: "ذاكرة", text: "ممتلئة 99.7% — سهر، ضحك، محاضرات", sev: "critical" },
                { icon: "💛", label: "أمل", text: "مرتفع جداً — يحتاج متابعة", sev: "elevated" },
                { icon: "🎓", label: "طموح", text: "غير قابل للقياس", sev: "overflow" }
            ],
            rx: [
                { med: "حب الطموح", dose: "3× يومياً" },
                { med: "كبسولة ابتسام", dose: "صباحاً" },
                { med: "شراب حنين", dose: "عند اللزوم" },
                { med: "أقراص صدق", dose: "مع كل قرار" }
            ],
            diagnosis: "✅ خريج ناجح — لا يوجد علاج",
            doctor: "د. الحنين"
        },
        default: {
            findings: [
                { icon: "❤️", label: "قلب", text: "ينبض بسرعة عند رؤية الأصدقاء", sev: "normal" },
                { icon: "🧠", label: "ذاكرة", text: "ممتلئة 99.7% — سهر، ضحك، محاضرات", sev: "critical" },
                { icon: "💛", label: "أمل", text: "مرتفع جداً — يحتاج متابعة", sev: "elevated" },
                { icon: "🎓", label: "طموح", text: "غير قابل للقياس", sev: "overflow" }
            ],
            rx: [
                { med: "حب الطموح", dose: "3× يومياً" },
                { med: "كبسولة ابتسام", dose: "صباحاً" },
                { med: "شراب حنين", dose: "عند اللزوم" },
                { med: "أقراص صدق", dose: "مع كل قرار" }
            ],
            diagnosis: "✅ خريج ناجح — لا يوجد علاج",
            doctor: "د. الحنين"
        }
    };

    const $ = id => document.getElementById(id);
    const folder = $('mfFolder');
    const cover = $('mfCover');
    const card = $('mfCard');
    if (!folder || !cover) return;

    function getStudent() {
        try {
            const saved = JSON.parse(localStorage.getItem('selected_student_v1') || 'null');
            if (saved && typeof students !== 'undefined') {
                const s = students.find(x => x.id === saved.id);
                if (s) return s;
            }
        } catch (e) {}
        return (typeof students !== 'undefined' && students.length) ? students[0] : null;
    }

    function render(student) {
        if (!student) return;
        const data = DATA[student.id] || DATA.default;

        $('mfName').textContent = student.name;
        $('mfId').textContent = `RAD-2027-${String(student.id).padStart(3, '0')}`;
        $('mfDoctor').textContent = data.doctor;

        $('mfFindings').innerHTML = data.findings.map(f => `
            <div class="mf-finding ${f.sev}">
                <span class="mf-finding-icon">${f.icon}</span>
                <span class="mf-finding-text">
                    <strong>${f.label}</strong>
                    ${f.text}
                </span>
            </div>
        `).join('');

        $('mfRx').innerHTML = data.rx.map(r => `
            <div class="mf-rx-item">
                <span class="mf-rx-med">${r.med}</span>
                <span class="mf-rx-dose">${r.dose}</span>
            </div>
        `).join('');

        $('mfDiagnosis').textContent = data.diagnosis;
    }

    // فتح / إغلاق
    cover.addEventListener('click', () => folder.classList.add('open'));
    $('mfClose')?.addEventListener('click', () => folder.classList.remove('open'));

    // حفظ
    $('mfDownload')?.addEventListener('click', async () => {
        if (typeof html2canvas !== 'function') return alert('⚠️ التحميل غير متوفر');
        const btn = $('mfDownload');
        btn.disabled = true; btn.textContent = '⏳';
        try {
            const canvas = await html2canvas(card, {
                scale: 2, backgroundColor: '#faf5e6', useCORS: true, logging: false
            });
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `memory-${$('mfName').textContent.replace(/\s+/g, '-')}.png`;
                a.click();
                URL.revokeObjectURL(url);
                btn.disabled = false; btn.textContent = '📥 حفظ';
            }, 'image/png');
        } catch (e) {
            alert('⚠️ فشل الحفظ');
            btn.disabled = false; btn.textContent = '📥 حفظ';
        }
    });

    // مشاركة
    $('mfShare')?.addEventListener('click', async () => {
        const text = `📋 الملف الطبي للذكريات\n👤 ${$('mfName').textContent}\n🔬 ${$('mfId').textContent}\n\n${$('mfDiagnosis').textContent}\n\n— قسم تقنيات الأشعة · جامعة الهادي 2027`;
        if (navigator.share) {
            try { await navigator.share({ title: 'الملف الطبي للذكريات', text, url: location.href }); return; } catch (e) {}
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => alert('✅ تم النسخ'));
        }
    });

    // تشغيل
    const student = getStudent();
    if (student) {
        render(student);
        console.log(`✅ memory-file.js: جاهز (${student.name})`);
    }
})();