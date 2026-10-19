import { state } from '../core/state.js';
import { openHostModal } from './modals.js';

function getPlayedCellsFromStorage() {
    try {
        const stored = localStorage.getItem('jeopardyPlayedCells');
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

export function savePlayedCell(id) {
    if (!state.playedCells.includes(id)) {
        state.playedCells.push(id);
        localStorage.setItem('jeopardyPlayedCells', JSON.stringify(state.playedCells));
    }
}

export function clearPlayedCells() {
    state.playedCells = [];
    localStorage.removeItem('jeopardyPlayedCells');
}

export function renderBoard() {
    const jeopardyBoard = document.getElementById('jeopardyBoard');
    if (!jeopardyBoard || !state.quizConfig) return;

    state.playedCells = getPlayedCellsFromStorage();

    const activeGameData = state.quizConfig.questions.filter(c => c.questions.length > 0);
    if (activeGameData.length === 0) {
        jeopardyBoard.innerHTML = '<div style="color:var(--text-sub); text-align:center; padding: 20px;">Belum ada soal. Konfigurasi melalui halaman Admin.</div>';
        return;
    }

    jeopardyBoard.innerHTML = '';
    jeopardyBoard.style.gridTemplateColumns = `repeat(${activeGameData.length}, 1fr)`;
    
    // Render Headers
    activeGameData.forEach(cat => {
        const header = document.createElement('div');
        header.className = 'board-header';
        header.innerText = cat.category;
        jeopardyBoard.appendChild(header);
    });

    // Find max rows
    let maxRows = 0;
    activeGameData.forEach(cat => {
        if(cat.questions.length > maxRows) maxRows = cat.questions.length;
    });

    // Render cells row by row
    for(let r=0; r < maxRows; r++) {
        activeGameData.forEach(cat => {
            const q = cat.questions[r];
            const cell = document.createElement('div');
            
            if (q) {
                cell.className = `board-cell point-${q.points}`;
                cell.innerText = q.points;
                cell.dataset.id = q.id;
                
                if (state.playedCells.includes(q.id)) {
                    cell.classList.add('played');
                }
                
                cell.onclick = () => {
                    if(!cell.classList.contains('played') && !cell.classList.contains('active')) {
                        cell.classList.add('active');
                        openHostModal(q, cat.category, cell);
                    }
                };
            } else {
                cell.className = 'board-cell played';
                cell.style.visibility = 'hidden';
            }
            jeopardyBoard.appendChild(cell);
        });
    }

    if(typeof gsap !== 'undefined') {
        const cells = document.querySelectorAll('.board-cell');
        gsap.from(cells, {
            y: 20, opacity: 0, duration: 0.4, stagger: 0.02, ease: "power2.out"
        });
    }
}
