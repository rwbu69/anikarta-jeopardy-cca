export const state = {
    quizConfig: null,
    teams: [],
    gameSettings: {
        winnerCount: 3,
        enableTieBreaker: true
    },
    activeQuestion: null,
    activeCellElement: null,
    selectedTeamColors: {},
    playedCells: [], // Track played cells by ID string e.g. "c0p100"
    playedTieBreakers: [] // Track played tiebreaker categories by index
};

export const AVAILABLE_COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', 
    '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'
];
