import { state } from '../core/state.js';
import { loadConfig } from '../core/storage.js';
import { GAME_DATA, DEFAULT_AUDIENCE_DATA } from '../../data.js';
import { applyTheme } from '../game/ui.js';

let activeMedia = null;
let activeQuestionIndex = null;

const STORAGE_KEY = 'playedAudienceQuestions';

function getPlayedQuestions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function savePlayedQuestion(number) {
    const played = getPlayedQuestions();
    if (!played.includes(number)) {
        played.push(number);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(played));
    }
}

function clearPlayedQuestions() {
    localStorage.removeItem(STORAGE_KEY);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateProgressBadge() {
    const badge = document.getElementById('progressBadge');
    if (!badge) return;
    const played = getPlayedQuestions();
    badge.innerText = `Kuis Penonton: ${played.length} / 20`;
}

function renderAudienceGrid() {
    const grid = document.getElementById('audienceGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const questions = state.quizConfig.audience || [];
    const played = getPlayedQuestions();

    for (let i = 0; i < 20; i++) {
        const q = questions[i] || {
            number: i + 1,
            title: `Lagu Penonton ${i + 1}`,
            artist: `Penyanyi ${i + 1}`,
            audio: 'audio/',
            video: ''
        };

        const card = document.createElement('div');
        const isPlayed = played.includes(q.number || (i + 1));
        card.className = `audience-card ${isPlayed ? 'played' : ''}`;
        card.id = `audCard-${i + 1}`;

        card.innerHTML = `
            <div class="audience-card-number">${q.number || (i + 1)}</div>
            <div class="audience-card-tag">${isPlayed ? 'Selesai' : 'Pilih'}</div>
        `;

        if (!isPlayed) {
            card.onclick = () => openAudienceModal(i);
        }

        grid.appendChild(card);
    }

    updateProgressBadge();
}

function initMediaPlayer(audioSrc, videoSrc) {
    const audioPlayer = document.getElementById('audAudioPlayer');
    const videoPlayer = document.getElementById('audVideoPlayer');
    const btnPlayPause = document.getElementById('btnAudPlayPause');
    const mediaProgress = document.getElementById('audMediaProgress');
    const timeCurrent = document.getElementById('audTimeCurrent');
    const timeTotal = document.getElementById('audTimeTotal');
    const container = document.getElementById('audMediaPlayerContainer');

    videoPlayer.pause();
    audioPlayer.pause();
    videoPlayer.removeAttribute('src');
    audioPlayer.removeAttribute('src');
    videoPlayer.load();
    audioPlayer.load();

    function updatePlayPauseBtn(isPlaying) {
        if (btnPlayPause) {
            const playSvg = btnPlayPause.querySelector('.media-icon-play');
            const pauseSvg = btnPlayPause.querySelector('.media-icon-pause');
            if (playSvg && pauseSvg) {
                playSvg.classList.toggle('hidden', isPlaying);
                pauseSvg.classList.toggle('hidden', !isPlaying);
            }
        }
    }

    updatePlayPauseBtn(false);
    mediaProgress.value = 0;
    timeCurrent.innerText = "0:00";
    timeTotal.innerText = "0:00";

    if (!audioSrc && !videoSrc) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    if (videoSrc) {
        activeMedia = videoPlayer;
        videoPlayer.src = videoSrc;
        videoPlayer.classList.remove('hidden');
        audioPlayer.classList.add('hidden');
    } else {
        activeMedia = audioPlayer;
        audioPlayer.src = audioSrc;
        audioPlayer.classList.remove('hidden');
        videoPlayer.classList.add('hidden');
    }

    activeMedia.onloadedmetadata = () => {
        timeTotal.innerText = formatTime(activeMedia.duration);
    };

    activeMedia.ontimeupdate = () => {
        timeCurrent.innerText = formatTime(activeMedia.currentTime);
        if (activeMedia.duration) {
            mediaProgress.value = (activeMedia.currentTime / activeMedia.duration) * 100;
        }
    };

    activeMedia.onplay = () => updatePlayPauseBtn(true);
    activeMedia.onpause = () => updatePlayPauseBtn(false);
    activeMedia.onended = () => updatePlayPauseBtn(false);

    btnPlayPause.onclick = toggleActiveMedia;
    videoPlayer.onclick = toggleActiveMedia;

    mediaProgress.oninput = (e) => {
        if (activeMedia && activeMedia.duration) {
            activeMedia.currentTime = (e.target.value / 100) * activeMedia.duration;
        }
    };
}

function toggleActiveMedia() {
    if (!activeMedia) return;
    if (activeMedia.paused) {
        const p = activeMedia.play();
        if (p !== undefined) {
            p.catch(e => console.log('Playback error:', e));
        }
    } else {
        activeMedia.pause();
    }
}

function cleanupMediaPlayer() {
    if (activeMedia) {
        activeMedia.pause();
        activeMedia.ontimeupdate = null;
        activeMedia.onplay = null;
        activeMedia.onpause = null;
        activeMedia.onended = null;
        activeMedia = null;
    }
}

function openAudienceModal(index) {
    activeQuestionIndex = index;
    const questions = state.quizConfig.audience || [];
    const q = questions[index] || {
        number: index + 1,
        title: `Lagu Penonton ${index + 1}`,
        artist: `Penyanyi ${index + 1}`,
        audio: 'audio/',
        video: ''
    };

    const modal = document.getElementById('audienceModal');
    const plate = document.getElementById('audModalNumberPlate');
    const stageControls = document.getElementById('audStageControls');
    const revealSection = document.getElementById('audRevealSection');
    const modalFooter = document.getElementById('audModalFooter');

    plate.innerText = `Nomor ${q.number || (index + 1)}`;
    stageControls.classList.remove('hidden');
    revealSection.classList.add('hidden');
    modalFooter.classList.remove('hidden');

    initMediaPlayer(q.audio, q.video);

    modal.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
        gsap.set(modal, { autoAlpha: 1 });
        gsap.fromTo(modal.querySelector('.modal-content'), 
            { scale: 0.95, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
        );
    }
}

function handleReveal() {
    if (activeQuestionIndex === null) return;
    const questions = state.quizConfig.audience || [];
    const q = questions[activeQuestionIndex];
    if (!q) return;

    const stageControls = document.getElementById('audStageControls');
    const revealSection = document.getElementById('audRevealSection');
    const modalFooter = document.getElementById('audModalFooter');
    const revealTitle = document.getElementById('audRevealTitle');
    const revealArtist = document.getElementById('audRevealArtist');

    stageControls.classList.add('hidden');
    modalFooter.classList.add('hidden');

    revealTitle.innerText = q.title || 'Tanpa Judul';
    revealArtist.innerText = q.artist || 'Tanpa Artis';

    revealSection.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
        gsap.from(revealSection, { opacity: 0, y: 10, duration: 0.3, ease: "power2.out" });
    }
}

function closeAudienceModal(markAsPlayed = false) {
    cleanupMediaPlayer();
    const modal = document.getElementById('audienceModal');

    if (markAsPlayed && activeQuestionIndex !== null) {
        const questions = state.quizConfig.audience || [];
        const q = questions[activeQuestionIndex];
        const num = q ? (q.number || (activeQuestionIndex + 1)) : (activeQuestionIndex + 1);
        savePlayedQuestion(num);
        renderAudienceGrid();
    }

    if (typeof gsap !== 'undefined') {
        gsap.to(modal, { 
            autoAlpha: 0, 
            duration: 0.2, 
            onComplete: () => {
                modal.classList.add('hidden');
                activeQuestionIndex = null;
            }
        });
    } else {
        modal.classList.add('hidden');
        activeQuestionIndex = null;
    }
}

function handleReset() {
    if (confirm("Mulai ulang semua kartu kuis penonton?")) {
        clearPlayedQuestions();
        renderAudienceGrid();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig(GAME_DATA, null, DEFAULT_AUDIENCE_DATA);
    applyTheme();
    renderAudienceGrid();

    // Event listeners
    const btnReveal = document.getElementById('btnAudReveal');
    if (btnReveal) btnReveal.addEventListener('click', handleReveal);

    const btnFinish = document.getElementById('btnAudFinish');
    if (btnFinish) btnFinish.addEventListener('click', () => closeAudienceModal(true));

    const btnCloseRevealed = document.getElementById('btnAudCloseRevealed');
    if (btnCloseRevealed) btnCloseRevealed.addEventListener('click', () => closeAudienceModal(true));

    const btnCancel = document.getElementById('btnAudCancel');
    if (btnCancel) btnCancel.addEventListener('click', () => closeAudienceModal(false));

    const btnCloseX = document.getElementById('btnAudCloseX');
    if (btnCloseX) btnCloseX.addEventListener('click', () => closeAudienceModal(false));

    const btnResetProgress = document.getElementById('btnResetProgress');
    if (btnResetProgress) btnResetProgress.addEventListener('click', handleReset);

    // Global keyboard shortcut: Spacebar to toggle Play/Pause, Escape to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('audienceModal');
            if (modal && !modal.classList.contains('hidden')) {
                e.preventDefault();
                closeAudienceModal(false);
                return;
            }
        }

        if (e.code === 'Space' || e.key === ' ') {
            const target = e.target;
            const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
            if (isEditing) return;

            const modal = document.getElementById('audienceModal');
            if (modal && !modal.classList.contains('hidden') && activeMedia) {
                e.preventDefault();
                toggleActiveMedia();
            }
        }
    });
});
