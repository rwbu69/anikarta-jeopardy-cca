import { GAME_DATA } from '../../data.js';
import { loadConfig } from '../core/storage.js';
import { applyTheme } from './ui.js';
import { initSetupModal, renderTeamInputs, handleSetupSubmit, handleReveal, closeHostModal, finishTieBreaker, openLeaderboardModal, resetGameProgress, closeLeaderboardModal, toggleActiveMedia, toggleActiveTbMedia, closeTieBreakerActiveQuestion } from './modals.js';

document.addEventListener('DOMContentLoaded', () => {
    // Accessibility check for GSAP
    if (typeof gsap !== 'undefined') {
        if (typeof Flip !== 'undefined') {
            gsap.registerPlugin(Flip);
        }
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.globalTimeline.timeScale(1000); // Instantly finish all animations
        }
    }

    loadConfig(GAME_DATA);
    applyTheme();
    initSetupModal();
    
    const teamCountSelect = document.getElementById('teamCount');
    const setupForm = document.getElementById('setupForm');
    const btnReveal = document.getElementById('btnReveal');
    const btnCloseHost = document.getElementById('btnCloseHost');
    const btnHostCloseX = document.getElementById('btnHostCloseX');
    const btnFinishTieBreaker = document.getElementById('btnFinishTieBreaker');
    const btnOpenLeaderboard = document.getElementById('btnOpenLeaderboard');
    const btnResetProgress = document.getElementById('btnResetProgress');
    const btnResetGameLeaderboard = document.getElementById('btnResetGameLeaderboard');
    const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');
    const btnLeaderboardCloseX = document.getElementById('btnLeaderboardCloseX');
    const btnTbActiveCloseX = document.getElementById('btnTbActiveCloseX');

    if(teamCountSelect) teamCountSelect.addEventListener('change', renderTeamInputs);
    if(setupForm) setupForm.addEventListener('submit', handleSetupSubmit);
    if(btnReveal) btnReveal.addEventListener('click', handleReveal);
    if(btnCloseHost) btnCloseHost.addEventListener('click', () => closeHostModal(true));
    if(btnHostCloseX) btnHostCloseX.addEventListener('click', () => closeHostModal(false));
    if(btnFinishTieBreaker) btnFinishTieBreaker.addEventListener('click', finishTieBreaker);

    if (btnOpenLeaderboard) btnOpenLeaderboard.addEventListener('click', () => openLeaderboardModal(false));
    if (btnResetProgress) btnResetProgress.addEventListener('click', resetGameProgress);
    
    if (btnResetGameLeaderboard) {
        btnResetGameLeaderboard.addEventListener('click', () => {
            if (confirm("Apakah Anda yakin ingin memulai ulang papan permainan?")) {
                resetGameProgress(true); // pass true flag to skip duplicate confirm
            }
        });
    }
    
    if (btnCloseLeaderboard) btnCloseLeaderboard.addEventListener('click', closeLeaderboardModal);
    if (btnLeaderboardCloseX) btnLeaderboardCloseX.addEventListener('click', closeLeaderboardModal);
    if (btnTbActiveCloseX) btnTbActiveCloseX.addEventListener('click', closeTieBreakerActiveQuestion);

    // Global keyboard listener: Escape to close modal, Spacebar to toggle play/pause song
    window.addEventListener('keydown', (e) => {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.key === 'Escape') {
            const hostModal = document.getElementById('hostModal');
            if (hostModal && !hostModal.classList.contains('hidden')) {
                e.preventDefault();
                closeHostModal(false);
                return;
            }

            const tieBreakerModal = document.getElementById('tieBreakerModal');
            if (tieBreakerModal && !tieBreakerModal.classList.contains('hidden')) {
                const tbActiveArea = document.getElementById('tieBreakerActiveQuestionArea');
                if (tbActiveArea && !tbActiveArea.classList.contains('hidden')) {
                    e.preventDefault();
                    closeTieBreakerActiveQuestion();
                    return;
                }
            }

            const leaderboardModal = document.getElementById('leaderboardModal');
            if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
                e.preventDefault();
                closeLeaderboardModal();
                return;
            }
        }

        if (e.code === 'Space') {
            const hostModal = document.getElementById('hostModal');
            const tieBreakerModal = document.getElementById('tieBreakerModal');
            
            const isHostOpen = hostModal && !hostModal.classList.contains('hidden');
            const isTbOpen = tieBreakerModal && !tieBreakerModal.classList.contains('hidden');
            
            if (isHostOpen) {
                e.preventDefault();
                toggleActiveMedia();
            } else if (isTbOpen) {
                e.preventDefault();
                toggleActiveTbMedia();
            }
        }
    });
});
