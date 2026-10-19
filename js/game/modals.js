import { state, AVAILABLE_COLORS } from '../core/state.js';
import { renderScoreboard } from './scoreboard.js';
import { renderBoard, savePlayedCell, clearPlayedCells } from './board.js';
import { updateProgressUI } from './ui.js';

// Setup Modal
export function initSetupModal() {
    const setupModal = document.getElementById('setupModal');
    if (setupModal) {
        setupModal.classList.remove('hidden');
        if(typeof gsap !== 'undefined') gsap.set(setupModal, { autoAlpha: 1 });
    }
    
    window.selectTeamColor = (teamIndex, color) => {
        state.selectedTeamColors[teamIndex] = color;
        renderTeamInputs();
    };
    renderTeamInputs();
}

export function renderTeamInputs() {
    const teamCountSelect = document.getElementById('teamCount');
    const teamInputsContainer = document.getElementById('teamInputsContainer');
    if(!teamCountSelect || !teamInputsContainer) return;
    
    const count = parseInt(teamCountSelect.value);
    teamInputsContainer.innerHTML = '';
    
    Object.keys(state.selectedTeamColors).forEach(k => {
        if(parseInt(k) > count) delete state.selectedTeamColors[k];
    });

    for (let i = 1; i <= count; i++) {
        if(!state.selectedTeamColors[i]) {
            const available = AVAILABLE_COLORS.find(c => !Object.values(state.selectedTeamColors).includes(c));
            state.selectedTeamColors[i] = available || AVAILABLE_COLORS[0];
        }

        const div = document.createElement('div');
        div.className = 'form-group box-outline';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'stretch';
        
        let swatchesHtml = '';
        AVAILABLE_COLORS.forEach(color => {
            const isSelectedByMe = state.selectedTeamColors[i] === color;
            const isTaken = Object.values(state.selectedTeamColors).includes(color) && !isSelectedByMe;
            
            swatchesHtml += `
                <div class="color-swatch ${isSelectedByMe ? 'selected' : ''} ${isTaken ? 'disabled' : ''}" 
                     style="background-color: ${color};"
                     onclick="if(!${isTaken}) window.selectTeamColor(${i}, '${color}')">
                </div>
            `;
        });

        div.innerHTML = `
            <label>Nama Tim ${i}</label>
            <input type="text" id="teamName${i}" class="input-field" placeholder="Masukkan nama tim" required style="border-left: 4px solid ${state.selectedTeamColors[i]};">
            <div class="team-color-picker">
                ${swatchesHtml}
            </div>
        `;
        teamInputsContainer.appendChild(div);
    }
}

export function handleSetupSubmit(e) {
    e.preventDefault();
    const teamCountSelect = document.getElementById('teamCount');
    const winnerCountSelect = document.getElementById('winnerCount');
    const enableTieBreakerCb = document.getElementById('enableTieBreaker');
    const setupModal = document.getElementById('setupModal');

    const count = parseInt(teamCountSelect.value);
    state.gameSettings.winnerCount = parseInt(winnerCountSelect.value);
    state.gameSettings.enableTieBreaker = enableTieBreakerCb.checked;

    state.teams = [];
    for (let i = 1; i <= count; i++) {
        const nameEl = document.getElementById(`teamName${i}`);
        const name = nameEl ? nameEl.value.trim() : `Team ${i}`;
        const color = state.selectedTeamColors[i];
        state.teams.push({ id: `t${i}`, name: name, score: 0, color: color });
    }
    
    if(typeof gsap !== 'undefined') {
        gsap.to(setupModal, { autoAlpha: 0, duration: 0.3, onComplete: () => {
            setupModal.classList.add('hidden');
            initGame();
        }});
    } else {
        setupModal.classList.add('hidden');
        initGame();
    }
}

function initGame() {
    renderScoreboard();
    renderBoard();
    updateProgressUI();
}

// Media Player Logic
let activeMedia = null;

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function initMediaPlayer(audioSrc, videoSrc) {
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const mediaProgress = document.getElementById('mediaProgress');
    const timeCurrent = document.getElementById('timeCurrent');
    const timeTotal = document.getElementById('timeTotal');
    const mediaPlayerContainer = document.getElementById('mediaPlayerContainer');
    
    videoPlayer.pause(); audioPlayer.pause();
    videoPlayer.removeAttribute('src'); audioPlayer.removeAttribute('src');
    videoPlayer.load(); audioPlayer.load();

    function updatePlayPauseBtn(isPlaying) {
        if (btnPlayPause) {
            btnPlayPause.innerText = isPlaying ? '⏸' : '▶';
        }
    }

    updatePlayPauseBtn(false);
    mediaProgress.value = 0;
    timeCurrent.innerText = "0:00";
    timeTotal.innerText = "0:00";
    
    if (!audioSrc && !videoSrc) {
        mediaPlayerContainer.classList.add('hidden');
        return;
    }
    
    mediaPlayerContainer.classList.remove('hidden');
    
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
        if(activeMedia.duration) {
            mediaProgress.value = (activeMedia.currentTime / activeMedia.duration) * 100;
        }
    };
    
    activeMedia.onplay = () => updatePlayPauseBtn(true);
    activeMedia.onpause = () => updatePlayPauseBtn(false);
    activeMedia.onended = () => updatePlayPauseBtn(false);

    btnPlayPause.onclick = toggleActiveMedia;
    videoPlayer.onclick = toggleActiveMedia;
    
    mediaProgress.oninput = (e) => {
        if(activeMedia && activeMedia.duration) {
            activeMedia.currentTime = (e.target.value / 100) * activeMedia.duration;
        }
    };
}

export function toggleActiveMedia() {
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
    if(activeMedia) {
        activeMedia.pause();
        activeMedia.ontimeupdate = null;
        activeMedia = null;
    }
}

// Host Modal
export function openHostModal(question, categoryName, cellElement) {
    if (cellElement.classList.contains('played')) return;
    
    state.activeQuestion = question;
    state.activeCellElement = cellElement;
    
    const hostModal = document.getElementById('hostModal');
    document.getElementById('hostModalTitle').innerText = `${categoryName} - ${question.points}`;
    
    const btnReveal = document.getElementById('btnReveal');
    const stageControls = document.getElementById('stageControls');
    const revealSection = document.getElementById('revealSection');
    const awardSection = document.getElementById('awardSection');
    
    btnReveal.classList.remove('hidden');
    stageControls.classList.remove('hidden');
    revealSection.classList.add('hidden');
    awardSection.classList.add('hidden');
    
    // Init Media without autoplay
    initMediaPlayer(question.audio, question.video);
    
    hostModal.classList.remove('hidden');
    if(typeof gsap !== 'undefined') {
        gsap.set(hostModal, { autoAlpha: 1 });
        gsap.fromTo(hostModal.querySelector('.modal-content'), 
            { scale: 0.95, opacity: 0, x: 0, y: 0 }, 
            { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
        );
    }
    
    // Ensure close buttons work
    const btnCloseHostAward = document.getElementById('btnCloseHostAward');
    if (btnCloseHostAward) btnCloseHostAward.onclick = () => closeHostModal(true); // Always marks as played when finished
}

export function handleReveal() {
    const btnReveal = document.getElementById('btnReveal');
    const stageControls = document.getElementById('stageControls');
    const revealSection = document.getElementById('revealSection');
    const awardSection = document.getElementById('awardSection');
    const revealTitle = document.getElementById('revealTitle');
    const revealArtist = document.getElementById('revealArtist');

    stageControls.classList.add('hidden');
    
    revealTitle.innerText = state.activeQuestion.title;
    revealArtist.innerText = state.activeQuestion.artist || 'Tanpa Artis';
    
    // Prepare Award Buttons
    const awardButtonsContainer = document.getElementById('awardButtonsContainer');
    awardButtonsContainer.innerHTML = '';
    
    let pointAwarded = false;
    state.teams.forEach((team) => {
        const btn = document.createElement('button');
        btn.className = `btn btn-team-award`;
        btn.style.setProperty('--team-color', team.color);
        btn.innerText = `+${state.activeQuestion.points} ${team.name}`;
        btn.onclick = () => {
            if (pointAwarded) return; // Prevent double award
            pointAwarded = true;
            awardPoints(team.id, state.activeQuestion.points);
        };
        awardButtonsContainer.appendChild(btn);
    });

    revealSection.classList.remove('hidden');
    awardSection.classList.remove('hidden');
    if(typeof gsap !== 'undefined') {
        gsap.from([revealSection, awardSection], { opacity: 0, y: 10, duration: 0.3, stagger: 0.1, ease: "power2.out" });
    }
}

export function awardPoints(teamId, points) {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;
    
    const startScore = team.score;
    team.score += points;
    
    const scoreEl = document.getElementById(`score-${teamId}`);
    if (scoreEl) {
        if(typeof gsap !== 'undefined') {
            gsap.to(scoreEl, {
                innerHTML: team.score,
                duration: 0.5,
                snap: { innerHTML: 1 },
                onUpdate: function() {
                    scoreEl.innerText = Math.round(scoreEl.innerHTML);
                }
            });
            gsap.fromTo(scoreEl, { scale: 1.5, color: 'var(--color-accent-primary)' }, { scale: 1, color: 'var(--text-main)', duration: 0.4, ease: "power2.out" });
        } else {
            scoreEl.innerText = team.score;
        }
    }
    // Re-render scoreboard will be triggered from closeHostModal -> renderScoreboard -> Flip
    setTimeout(() => closeHostModal(true), 600); // Wait for animations before closing
}

export function closeHostModal(markPlayed = false) {
    cleanupMediaPlayer();
    
    const hostModal = document.getElementById('hostModal');
    
    if (markPlayed && state.activeCellElement && state.activeQuestion) {
        savePlayedCell(state.activeQuestion.id);
        state.activeCellElement.classList.remove('active');
        state.activeCellElement.classList.add('played');
    } else if (state.activeCellElement) {
        state.activeCellElement.classList.remove('active');
    }
    
    if(typeof gsap !== 'undefined') {
        gsap.to(hostModal.querySelector('.modal-content'), { scale: 0.95, opacity: 0, duration: 0.2, ease: "power2.in" });
        gsap.to(hostModal, { 
            autoAlpha: 0, duration: 0.2, delay: 0.1,
            onComplete: () => {
                hostModal.classList.add('hidden');
                state.activeQuestion = null;
                state.activeCellElement = null;
                renderScoreboard();
                updateProgressUI();
                checkGameCompletion();
            }
        });
    } else {
        hostModal.classList.add('hidden');
        state.activeQuestion = null;
        state.activeCellElement = null;
        renderScoreboard();
        updateProgressUI();
        checkGameCompletion();
    }
}

// Tie Breaker & Leaderboard
function checkGameCompletion() {
    const totalCells = document.querySelectorAll('.board-cell').length;
    const playedCells = document.querySelectorAll('.board-cell.played').length;
    
    if (totalCells > 0 && playedCells === totalCells) {
        setTimeout(() => { evaluateTieBreaker(); }, 300);
    }
}

function evaluateTieBreaker() {
    if (!state.gameSettings.enableTieBreaker) {
        openLeaderboardModal(true);
        return;
    }

    const sortedTeams = [...state.teams].sort((a, b) => b.score - a.score);
    let isTied = false;
    let teamsInTie = [];
    const cutoffIndex = state.gameSettings.winnerCount - 1; 

    if (sortedTeams.length > cutoffIndex + 1) {
        const cutoffScore = sortedTeams[cutoffIndex].score;
        const nextScore = sortedTeams[cutoffIndex + 1].score;
        if (cutoffScore === nextScore) {
            isTied = true;
            teamsInTie = sortedTeams.filter(t => t.score === cutoffScore);
        }
    }
    
    for(let i=0; i < Math.min(state.gameSettings.winnerCount, sortedTeams.length - 1); i++) {
        if(sortedTeams[i].score === sortedTeams[i+1].score) {
            isTied = true;
            teamsInTie.push(...sortedTeams.filter(t => t.score === sortedTeams[i].score));
        }
    }

    teamsInTie = [...new Set(teamsInTie)];

    if (isTied && teamsInTie.length > 1) {
        openTieBreakerModal(teamsInTie);
    } else {
        openLeaderboardModal(true);
    }
}

let activeTbMedia = null;
let currentTiedTeams = [];
let activeTbIndex = null;

function cleanupTbMediaPlayer() {
    if (activeTbMedia) {
        activeTbMedia.pause();
        activeTbMedia.ontimeupdate = null;
        activeTbMedia = null;
    }
}

function initTbMediaPlayer(audioSrc, videoSrc) {
    cleanupTbMediaPlayer();

    const videoPlayer = document.getElementById('tbVideoPlayer');
    const audioPlayer = document.getElementById('tbAudioPlayer');
    const btnPlayPause = document.getElementById('tbBtnPlayPause');
    const mediaProgress = document.getElementById('tbMediaProgress');
    const timeCurrent = document.getElementById('tbTimeCurrent');
    const timeTotal = document.getElementById('tbTimeTotal');
    const playerControls = document.getElementById('tbPlayerControls');

    if (!videoPlayer || !audioPlayer) return;

    videoPlayer.pause(); audioPlayer.pause();
    videoPlayer.src = ""; audioPlayer.src = "";
    videoPlayer.load(); audioPlayer.load();

    function updateTbPlayPauseBtn(isPlaying) {
        if (btnPlayPause) {
            btnPlayPause.innerText = isPlaying ? '⏸' : '▶';
        }
    }

    updateTbPlayPauseBtn(false);
    mediaProgress.value = 0;
    timeCurrent.innerText = "0:00";
    timeTotal.innerText = "0:00";

    if (!audioSrc && !videoSrc) {
        if (playerControls) playerControls.classList.add('hidden');
        return;
    }

    if (playerControls) playerControls.classList.remove('hidden');

    if (videoSrc) {
        activeTbMedia = videoPlayer;
        videoPlayer.src = videoSrc;
        videoPlayer.classList.remove('hidden');
        audioPlayer.classList.add('hidden');
    } else {
        activeTbMedia = audioPlayer;
        audioPlayer.src = audioSrc;
        audioPlayer.classList.remove('hidden');
        videoPlayer.classList.add('hidden');
    }

    activeTbMedia.onloadedmetadata = () => {
        timeTotal.innerText = formatTime(activeTbMedia.duration);
    };

    activeTbMedia.ontimeupdate = () => {
        timeCurrent.innerText = formatTime(activeTbMedia.currentTime);
        if (activeTbMedia.duration) {
            mediaProgress.value = (activeTbMedia.currentTime / activeTbMedia.duration) * 100;
        }
    };

    activeTbMedia.onplay = () => updateTbPlayPauseBtn(true);
    activeTbMedia.onpause = () => updateTbPlayPauseBtn(false);
    activeTbMedia.onended = () => updateTbPlayPauseBtn(false);

    btnPlayPause.onclick = toggleActiveTbMedia;
    videoPlayer.onclick = toggleActiveTbMedia;

    mediaProgress.oninput = (e) => {
        if (activeTbMedia && activeTbMedia.duration) {
            activeTbMedia.currentTime = (e.target.value / 100) * activeTbMedia.duration;
        }
    };
}

export function toggleActiveTbMedia() {
    if (!activeTbMedia) return;
    if (activeTbMedia.paused) {
        const p = activeTbMedia.play();
        if (p !== undefined) {
            p.catch(e => console.log('TB Playback error:', e));
        }
    } else {
        activeTbMedia.pause();
    }
}

function renderTieBreakerTeams(tiedTeams) {
    const tieBreakerTeamsContainer = document.getElementById('tieBreakerTeams');
    if (!tieBreakerTeamsContainer) return;
    tieBreakerTeamsContainer.innerHTML = '';

    tiedTeams.forEach(team => {
        const div = document.createElement('div');
        div.className = 'team-score flex-col align-center p-md';
        div.style.flex = '1';
        div.style.minWidth = '140px';
        div.style.borderTop = `4px solid ${team.color}`;
        
        div.innerHTML = `
            <div class="team-name text-center w-full mb-md">${team.name}</div>
            <div class="team-points text-center w-full" id="tie-score-${team.id}">${team.score}</div>
            <div class="flex-row justify-center mt-md w-full" style="gap: 5px;">
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.85rem;" onclick="window.updateTieScore('${team.id}', -100)">-100</button>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.85rem;" onclick="window.updateTieScore('${team.id}', 100)">+100</button>
            </div>
        `;
        tieBreakerTeamsContainer.appendChild(div);
    });
}

function renderTieBreakerCategoriesGrid() {
    const gridContainer = document.getElementById('tieBreakerCategoriesGrid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const tiebreakerList = state.quizConfig?.tiebreaker || [];

    tiebreakerList.forEach((item, index) => {
        const isPlayed = state.playedTieBreakers.includes(index);
        const isActive = activeTbIndex === index;

        const btn = document.createElement('div');
        btn.className = `tb-category-btn ${isPlayed ? 'played' : ''} ${isActive ? 'active' : ''}`;
        
        btn.innerHTML = `
            <span class="tb-category-title">${item.category || `Kategori ${index + 1}`}</span>
        `;

        if (!isPlayed) {
            btn.onclick = () => selectTieBreakerCategory(index);
        }

        gridContainer.appendChild(btn);
    });
}

function selectTieBreakerCategory(index) {
    activeTbIndex = index;
    renderTieBreakerCategoriesGrid();

    const item = state.quizConfig?.tiebreaker?.[index];
    if (!item) return;
    const q = item.question || {};

    const activeArea = document.getElementById('tieBreakerActiveQuestionArea');
    const categoryTitleEl = document.getElementById('tbActiveCategoryTitle');
    const pointsBadgeEl = document.getElementById('tbActivePointsBadge');
    const stageControls = document.getElementById('tbStageControls');
    const revealSection = document.getElementById('tbRevealSection');
    const awardSection = document.getElementById('tbAwardSection');
    const revealTitle = document.getElementById('tbRevealTitle');
    const revealArtist = document.getElementById('tbRevealArtist');
    const btnReveal = document.getElementById('tbBtnReveal');

    if (!activeArea) return;

    activeArea.classList.remove('hidden');
    categoryTitleEl.innerText = item.category || `Kategori ${index + 1}`;
    pointsBadgeEl.innerText = `${q.points || 100} Poin`;

    stageControls.classList.remove('hidden');
    revealSection.classList.add('hidden');
    awardSection.classList.add('hidden');

    initTbMediaPlayer(q.audio, q.video);

    btnReveal.onclick = () => {
        stageControls.classList.add('hidden');
        revealTitle.innerText = q.title || 'Tanpa Judul';
        revealArtist.innerText = q.artist || 'Tanpa Artis';

        const awardContainer = document.getElementById('tbAwardButtonsContainer');
        awardContainer.innerHTML = '';
        
        let pointAwarded = false;
        currentTiedTeams.forEach(team => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-team-award';
            btn.style.setProperty('--team-color', team.color);
            btn.innerText = `+${q.points || 100} ${team.name}`;
            
            btn.onclick = () => {
                if (pointAwarded) return;
                pointAwarded = true;
                
                team.score += (q.points || 100);
                const scoreEl = document.getElementById(`tie-score-${team.id}`);
                if (scoreEl) {
                    scoreEl.innerText = team.score;
                    if (typeof gsap !== 'undefined') gsap.from(scoreEl, { scale: 1.3, color: 'var(--color-accent-primary)', duration: 0.3 });
                }
                renderScoreboard();

                cleanupTbMediaPlayer();
                state.playedTieBreakers.push(index);
                activeTbIndex = null;
                activeArea.classList.add('hidden');
                renderTieBreakerCategoriesGrid();
            };
            awardContainer.appendChild(btn);
        });

        revealSection.classList.remove('hidden');
        awardSection.classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
            gsap.from([revealSection, awardSection], { opacity: 0, y: 10, duration: 0.3, stagger: 0.1, ease: "power2.out" });
        }
    };

    if (typeof gsap !== 'undefined') {
        gsap.from(activeArea, { opacity: 0, y: 15, duration: 0.25, ease: "power2.out" });
    }
}

export function closeTieBreakerActiveQuestion() {
    cleanupTbMediaPlayer();
    activeTbIndex = null;
    const activeArea = document.getElementById('tieBreakerActiveQuestionArea');
    if (activeArea) {
        if (typeof gsap !== 'undefined') {
            gsap.to(activeArea, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                onComplete: () => {
                    activeArea.classList.add('hidden');
                    renderTieBreakerCategoriesGrid();
                }
            });
        } else {
            activeArea.classList.add('hidden');
            renderTieBreakerCategoriesGrid();
        }
    }
}

function openTieBreakerModal(tiedTeams) {
    currentTiedTeams = tiedTeams;
    activeTbIndex = null;

    const tieBreakerModal = document.getElementById('tieBreakerModal');
    const activeArea = document.getElementById('tieBreakerActiveQuestionArea');
    if (activeArea) activeArea.classList.add('hidden');

    window.updateTieScore = (teamId, points) => {
        const team = state.teams.find(t => t.id === teamId);
        if (!team) return;
        team.score += points;
        const scoreEl = document.getElementById(`tie-score-${teamId}`);
        if (scoreEl) {
            scoreEl.innerText = team.score;
            if(typeof gsap !== 'undefined') gsap.from(scoreEl, { scale: 1.2, color: 'var(--color-accent-primary)', duration: 0.2 });
        }
        renderScoreboard();
    };

    renderTieBreakerTeams(tiedTeams);
    renderTieBreakerCategoriesGrid();

    tieBreakerModal.classList.remove('hidden');
    if(typeof gsap !== 'undefined') {
        gsap.set(tieBreakerModal, { autoAlpha: 1 });
        gsap.fromTo(tieBreakerModal.querySelector('.modal-content'), 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
    }
}

export function finishTieBreaker() {
    cleanupTbMediaPlayer();
    const tieBreakerModal = document.getElementById('tieBreakerModal');
    if(typeof gsap !== 'undefined') {
        gsap.to(tieBreakerModal.querySelector('.modal-content'), { y: 20, opacity: 0, duration: 0.2 });
        gsap.to(tieBreakerModal, { 
            autoAlpha: 0, duration: 0.2, delay: 0.1,
            onComplete: () => { 
                tieBreakerModal.classList.add('hidden');
                openLeaderboardModal(true); 
            }
        });
    } else {
        tieBreakerModal.classList.add('hidden');
        openLeaderboardModal(true);
    }
}


export function openLeaderboardModal(isGameOver = false) {
    const leaderboardPodium = document.getElementById('leaderboardPodium');
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (!leaderboardPodium || !leaderboardModal) return;
    leaderboardPodium.innerHTML = '';
    
    // Sort exactly the same way as scoreboard!
    const sortedTeams = [...state.teams].sort((a, b) => {
        if (b.score === a.score) return a.id.localeCompare(b.id);
        return b.score - a.score;
    });
    
    const limit = isGameOver ? state.gameSettings.winnerCount : sortedTeams.length;

    for(let index = 0; index < limit && index < sortedTeams.length; index++) {
        const team = sortedTeams[index];
        const item = document.createElement('div');
        item.className = `leaderboard-item rank-${index + 1}`;
        
        item.innerHTML = `
            <div class="flex-row align-center" style="gap: 12px;">
                <span class="rank-badge">${index + 1}</span>
                <span class="lb-team-name">${team.name}</span>
                <div class="team-color-dot" style="background-color: ${team.color};"></div>
            </div>
            <div class="lb-team-score">${team.score}</div>
        `;
        leaderboardPodium.appendChild(item);
    }
    
    leaderboardModal.classList.remove('hidden');
    if(typeof gsap !== 'undefined') {
        gsap.set(leaderboardModal, { autoAlpha: 1 });
        gsap.fromTo(leaderboardModal.querySelector('.modal-content'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
    }
}

export function closeLeaderboardModal() {
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (!leaderboardModal) return;
    if(typeof gsap !== 'undefined') {
        gsap.to(leaderboardModal.querySelector('.modal-content'), { y: 20, opacity: 0, duration: 0.2 });
        gsap.to(leaderboardModal, {
            autoAlpha: 0, duration: 0.2, delay: 0.1,
            onComplete: () => { 
                leaderboardModal.classList.add('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
        });
    } else {
        leaderboardModal.classList.add('hidden');
    }
}

export function resetGameProgress(skipConfirm = false) {
    if (typeof skipConfirm !== 'boolean') skipConfirm = false; // Prevent MouseEvent from being treated as true
    if (!skipConfirm && !confirm('Apakah Anda yakin ingin memulai ulang papan permainan?')) return;
    
    state.teams.forEach(team => { team.score = 0; });
    state.playedTieBreakers = [];
    
    clearPlayedCells();
    renderBoard();
    renderScoreboard();
    updateProgressUI();
    
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (leaderboardModal && typeof gsap !== 'undefined' && gsap.getProperty(leaderboardModal, 'opacity') > 0) {
        closeLeaderboardModal();
    } else if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
        closeLeaderboardModal();
    }
}
