import { state } from './state.js';
import { DEFAULT_TIEBREAKER, DEFAULT_AUDIENCE_DATA } from '../../data.js';

export function ensureTiebreakerConfig(fallbackTiebreaker) {
    if (!state.quizConfig) state.quizConfig = {};
    
    if (!Array.isArray(state.quizConfig.tiebreaker) || state.quizConfig.tiebreaker.length === 0) {
        const defaultTB = fallbackTiebreaker || DEFAULT_TIEBREAKER || [];
        state.quizConfig.tiebreaker = JSON.parse(JSON.stringify(defaultTB));
    }
    
    // Ensure it always has exactly 3 categories
    while (state.quizConfig.tiebreaker.length < 3) {
        const idx = state.quizConfig.tiebreaker.length;
        state.quizConfig.tiebreaker.push({
            category: `Tiebreaker ${idx + 1}`,
            question: { id: `tb_${idx}`, points: 100, audio: "audio/", title: "", artist: "", video: "" }
        });
    }
}

export function ensureAudienceConfig(fallbackAudience) {
    if (!state.quizConfig) state.quizConfig = {};
    
    if (!Array.isArray(state.quizConfig.audience) || state.quizConfig.audience.length === 0) {
        const defaultAud = fallbackAudience || DEFAULT_AUDIENCE_DATA || [];
        state.quizConfig.audience = JSON.parse(JSON.stringify(defaultAud));
    }
    
    // Ensure it always has exactly 20 items
    while (state.quizConfig.audience.length < 20) {
        const idx = state.quizConfig.audience.length;
        state.quizConfig.audience.push({
            id: `aud_${idx + 1}`,
            number: idx + 1,
            title: `Lagu Penonton ${idx + 1}`,
            artist: `Penyanyi ${idx + 1}`,
            audio: "audio/",
            video: ""
        });
    }

    if (state.quizConfig.audience.length > 20) {
        state.quizConfig.audience = state.quizConfig.audience.slice(0, 20);
    }
}

export function loadConfig(fallbackData, fallbackTiebreaker, fallbackAudience) {
    const savedConfig = localStorage.getItem('quizConfig');
    if (savedConfig) {
        try {
            state.quizConfig = JSON.parse(savedConfig);
        } catch (e) {
            console.error("Gagal memuat saved quizConfig", e);
            state.quizConfig = { questions: [] };
        }
    } else if (fallbackData) {
        state.quizConfig = { questions: JSON.parse(JSON.stringify(fallbackData)) };
    } else {
        state.quizConfig = { questions: [] };
    }
    
    ensureTiebreakerConfig(fallbackTiebreaker);
    ensureAudienceConfig(fallbackAudience);
}

export function saveConfig() {
    localStorage.setItem('quizConfig', JSON.stringify(state.quizConfig));
}

