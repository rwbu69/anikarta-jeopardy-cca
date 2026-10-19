import { state } from '../core/state.js';
import { saveConfig } from '../core/storage.js';

export function renderAdminBoard() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if(!categoriesContainer) return;
    categoriesContainer.innerHTML = '';
    
    state.quizConfig.questions.forEach((cat, catIndex) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        let qHtml = '';
        cat.questions.sort((a, b) => a.points - b.points);
        
        cat.questions.forEach((q, qIndex) => {
            qHtml += `
                <div class="question-item">
                    <div>
                        <strong class="text-accent">${q.points}</strong> - 
                        <span class="fw-bold text-main" style="font-size: 1.1rem;">${q.title}</span> 
                        <span class="text-sub">• ${q.artist || 'Tanpa Artis'}</span> <br>
                        <small class="text-sub">Audio: ${q.audio}</small>
                        ${q.video ? `<br><small class="text-sub fw-bold">Video: ${q.video}</small>` : ''}
                    </div>
                    <div class="flex-row" style="gap: 5px;">
                        <button class="btn btn-outline" style="padding: 5px 15px; font-size: 0.9rem;" onclick="window.openEditQuestion(${catIndex}, ${qIndex})">Edit</button>
                        <button class="btn btn-danger" style="padding: 5px 15px; font-size: 0.9rem;" onclick="window.deleteQuestion(${catIndex}, ${qIndex})">Hapus</button>
                    </div>
                </div>
            `;
        });
        
        if (cat.questions.length === 0) {
            qHtml = '<p class="text-sub mb-md">Belum ada soal.</p>';
        }

        card.innerHTML = `
            <div class="category-header">
                <span>${cat.category}</span>
                <div class="flex-row" style="gap: 10px;">
                    <button class="btn btn-primary" style="padding: 8px 15px; font-size: 0.9rem;" onclick="window.openAddQuestion(${catIndex})">+ Tambah Soal</button>
                    <button class="btn btn-danger" style="padding: 8px 15px; font-size: 0.9rem;" onclick="window.deleteCategory(${catIndex})">Hapus Kategori</button>
                </div>
            </div>
            <div class="question-list">
                ${qHtml}
            </div>
        `;
        categoriesContainer.appendChild(card);
    });
}

export function handleAddCategory(e) {
    e.preventDefault();
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();
    if (name) {
        state.quizConfig.questions.push({ category: name, questions: [] });
        nameInput.value = '';
        saveConfig();
        renderAdminBoard();
    }
}

export function deleteCategory(catIndex) {
    if (confirm("Hapus kategori ini beserta seluruh soalnya?")) {
        state.quizConfig.questions.splice(catIndex, 1);
        saveConfig();
        renderAdminBoard();
    }
}

export function deleteQuestion(catIndex, qIndex) {
    if (confirm("Hapus soal ini?")) {
        state.quizConfig.questions[catIndex].questions.splice(qIndex, 1);
        saveConfig();
        renderAdminBoard();
    }
}

export function openAddQuestion(catIndex) {
    document.getElementById('formQuestion').reset();
    document.getElementById('qCategoryIndex').value = catIndex;
    document.getElementById('qIndex').value = '';
    
    const cat = state.quizConfig.questions[catIndex];
    let nextPoint = 100;
    if (cat.questions.length > 0) {
        const maxPoint = Math.max(...cat.questions.map(q => q.points));
        nextPoint = maxPoint + 100;
    }
    document.getElementById('qPoint').value = nextPoint > 500 ? 500 : nextPoint;
    
    document.getElementById('modalQuestionTitle').innerText = 'Tambah Soal - ' + cat.category;
    document.getElementById('modalQuestion').classList.remove('hidden');
}

export function openEditQuestion(catIndex, qIndex) {
    const q = state.quizConfig.questions[catIndex].questions[qIndex];
    
    document.getElementById('qCategoryIndex').value = catIndex;
    document.getElementById('qIndex').value = qIndex;
    
    document.getElementById('qPoint').value = q.points;
    document.getElementById('qTitle').value = q.title;
    document.getElementById('qArtist').value = q.artist || '';
    document.getElementById('qAudio').value = q.audio;
    document.getElementById('qVideo').value = q.video || '';
    
    document.getElementById('modalQuestionTitle').innerText = 'Edit Soal';
    document.getElementById('modalQuestion').classList.remove('hidden');
}

export function closeQuestionModal() {
    document.getElementById('modalQuestion').classList.add('hidden');
}

export function handleSaveQuestion(e) {
    e.preventDefault();
    
    const catIndex = parseInt(document.getElementById('qCategoryIndex').value);
    const qIndexStr = document.getElementById('qIndex').value;
    
    const points = parseInt(document.getElementById('qPoint').value);
    const title = document.getElementById('qTitle').value.trim();
    const artist = document.getElementById('qArtist').value.trim();
    const audio = document.getElementById('qAudio').value.trim();
    const video = document.getElementById('qVideo').value.trim();
    
    const qData = {
        id: `c${catIndex}p${points}`,
        points,
        title,
        artist,
        audio,
        video
    };
    
    if (qIndexStr === '') {
        state.quizConfig.questions[catIndex].questions.push(qData);
    } else {
        const qIndex = parseInt(qIndexStr);
        state.quizConfig.questions[catIndex].questions[qIndex] = qData;
    }
    
    saveConfig();
    closeQuestionModal();
    renderAdminBoard();
}

export function renderTieBreakerAdmin() {
    const container = document.getElementById('tieBreakerCategoriesContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const tiebreakerList = state.quizConfig.tiebreaker || [];
    
    tiebreakerList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'tb-card';
        
        const q = item.question || {};
        const hasQuestion = q.title && q.title.trim().length > 0;
        
        card.innerHTML = `
            <div class="tb-card-top mb-sm">
                <span class="tb-slot-badge">Slot ${index + 1}</span>
                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.openEditTieBreaker(${index})">
                    ${hasQuestion ? 'Edit Soal' : '+ Atur Soal'}
                </button>
            </div>
            <div class="tb-category-title mb-md">
                ${item.category || `Kategori ${index + 1}`}
            </div>
            <div class="tb-question-box">
                ${hasQuestion ? `
                    <div class="flex-row align-center mb-xs" style="gap: 8px;">
                        <span class="tb-points-tag">${q.points || 100} POIN</span>
                        <span class="tb-question-name fw-bold">${q.title}</span>
                    </div>
                    <div class="tb-question-sub text-sub">
                        ${q.artist ? `Artis: <strong>${q.artist}</strong> • ` : ''}Audio: <code>${q.audio || '-'}</code>
                        ${q.video ? `<br>Video: <code>${q.video}</code>` : ''}
                    </div>
                ` : `
                    <div class="tb-empty-state text-sub">
                        Belum ada pertanyaan penentu. Klik tombol di atas untuk mengisi.
                    </div>
                `}
            </div>
        `;
        container.appendChild(card);
    });
}

export function openEditTieBreaker(index) {
    const item = state.quizConfig.tiebreaker[index] || {
        category: `Tiebreaker ${index + 1}`,
        question: { id: `tb_${index}`, points: 100, title: '', artist: '', audio: 'audio/', video: '' }
    };
    const q = item.question || {};
    
    document.getElementById('tbIndex').value = index;
    document.getElementById('tbCategory').value = item.category || `Tiebreaker ${index + 1}`;
    document.getElementById('tbPoints').value = q.points || 100;
    document.getElementById('tbTitle').value = q.title || '';
    document.getElementById('tbArtist').value = q.artist || '';
    document.getElementById('tbAudio').value = q.audio || 'audio/';
    document.getElementById('tbVideo').value = q.video || '';
    
    document.getElementById('modalTieBreakerTitle').innerText = `Edit Soal Tie-Breaker - Slot ${index + 1}`;
    document.getElementById('modalTieBreaker').classList.remove('hidden');
}

export function closeTieBreakerModal() {
    document.getElementById('modalTieBreaker').classList.add('hidden');
}

export function handleSaveTieBreaker(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('tbIndex').value);
    const category = document.getElementById('tbCategory').value.trim();
    const points = parseInt(document.getElementById('tbPoints').value) || 100;
    const title = document.getElementById('tbTitle').value.trim();
    const artist = document.getElementById('tbArtist').value.trim();
    const audio = document.getElementById('tbAudio').value.trim();
    const video = document.getElementById('tbVideo').value.trim();
    
    state.quizConfig.tiebreaker[index] = {
        category,
        question: {
            id: `tb_${index}`,
            points,
            title,
            artist,
            audio,
            video
        }
    };
    
    saveConfig();
    closeTieBreakerModal();
    renderTieBreakerAdmin();
}

export function renderAudienceAdmin() {
    const container = document.getElementById('audienceCardsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const audienceList = state.quizConfig.audience || [];
    
    audienceList.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'aud-admin-card';
        
        const hasTitle = q.title && q.title.trim().length > 0;
        
        card.innerHTML = `
            <div class="aud-admin-card-header">
                <span class="aud-number-badge">Nomor ${q.number || (index + 1)}</span>
                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.openEditAudience(${index})">
                    Edit
                </button>
            </div>
            <div class="aud-admin-info">
                <div class="aud-admin-title">${hasTitle ? q.title : '<em class="text-sub">Belum ada judul</em>'}</div>
                <div class="aud-admin-meta">
                    ${q.artist ? `Artis: <strong>${q.artist}</strong><br>` : ''}
                    Audio: <code>${q.audio || '-'}</code>
                    ${q.video ? `<br>Video: <code>${q.video}</code>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function openEditAudience(index) {
    const q = (state.quizConfig.audience && state.quizConfig.audience[index]) || {
        id: `aud_${index + 1}`,
        number: index + 1,
        title: '',
        artist: '',
        audio: 'audio/',
        video: ''
    };
    
    document.getElementById('audIndex').value = index;
    document.getElementById('audNumber').value = `Nomor ${q.number || (index + 1)}`;
    document.getElementById('audTitle').value = q.title || '';
    document.getElementById('audArtist').value = q.artist || '';
    document.getElementById('audAudio').value = q.audio || 'audio/';
    document.getElementById('audVideo').value = q.video || '';
    
    document.getElementById('modalAudienceTitle').innerText = `Edit Kuis Penonton - Nomor ${q.number || (index + 1)}`;
    document.getElementById('modalAudience').classList.remove('hidden');
}

export function closeAudienceModal() {
    document.getElementById('modalAudience').classList.add('hidden');
}

export function handleSaveAudience(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('audIndex').value);
    const title = document.getElementById('audTitle').value.trim();
    const artist = document.getElementById('audArtist').value.trim();
    const audio = document.getElementById('audAudio').value.trim();
    const video = document.getElementById('audVideo').value.trim();
    
    if (!state.quizConfig.audience) {
        state.quizConfig.audience = [];
    }
    
    state.quizConfig.audience[index] = {
        id: `aud_${index + 1}`,
        number: index + 1,
        title,
        artist,
        audio,
        video
    };
    
    saveConfig();
    closeAudienceModal();
    renderAudienceAdmin();
}

// Bind to window for inline HTML onclicks
window.deleteCategory = deleteCategory;
window.deleteQuestion = deleteQuestion;
window.openAddQuestion = openAddQuestion;
window.openEditQuestion = openEditQuestion;
window.closeQuestionModal = closeQuestionModal;
window.openEditTieBreaker = openEditTieBreaker;
window.closeTieBreakerModal = closeTieBreakerModal;
window.openEditAudience = openEditAudience;
window.closeAudienceModal = closeAudienceModal;

