import { state } from '../core/state.js';

export function renderScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    if (!scoreboard) return;
    
    // Sort teams by score descending, then by ID (alphabetically/numerically to resolve ties)
    state.teams.sort((a, b) => {
        if (b.score === a.score) {
            return a.id.localeCompare(b.id);
        }
        return b.score - a.score;
    });

    let flipState = null;
    if (typeof gsap !== 'undefined' && gsap.Flip && scoreboard.children.length > 0) {
        flipState = gsap.Flip.getState('.team-score');
    }
    
    scoreboard.innerHTML = '';
    
    state.teams.forEach(team => {
        const div = document.createElement('div');
        div.className = 'team-score';
        div.dataset.flipId = team.id;
        
        div.innerHTML = `
            <div class="team-color-dot" style="background-color: ${team.color};"></div>
            <div class="team-name">${team.name}</div>
            <div class="team-points" id="score-${team.id}">${team.score}</div>
        `;
        scoreboard.appendChild(div);
    });

    if (flipState) {
        gsap.Flip.from(flipState, {
            duration: 0.4,
            ease: "power2.out",
            absolute: true,
            stagger: 0.05
        });
    }
}
