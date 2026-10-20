import { GAME_DATA } from '../../data.js';
import { loadConfig } from '../core/storage.js';
import { initThemeEditor, setupColorHexSync, handleSaveTheme } from './theme.js';
import { renderAdminBoard, handleAddCategory, handleSaveQuestion, renderTieBreakerAdmin, handleSaveTieBreaker, renderAudienceAdmin, handleSaveAudience } from './questions.js';
import { handleExport, handleImport, handleReset } from './export-import.js';

document.addEventListener('DOMContentLoaded', () => {
    loadConfig(GAME_DATA);
    
    initThemeEditor();
    renderAdminBoard();
    renderTieBreakerAdmin();
    renderAudienceAdmin();
    
    const formCategory = document.getElementById('formCategory');
    const formQuestion = document.getElementById('formQuestion');
    const formTieBreaker = document.getElementById('formTieBreaker');
    const formAudience = document.getElementById('formAudience');
    const btnSaveTheme = document.getElementById('btnSaveTheme');
    
    if (formCategory) formCategory.addEventListener('submit', handleAddCategory);
    if (formQuestion) formQuestion.addEventListener('submit', handleSaveQuestion);
    if (formTieBreaker) formTieBreaker.addEventListener('submit', handleSaveTieBreaker);
    if (formAudience) formAudience.addEventListener('submit', handleSaveAudience);
    if (btnSaveTheme) btnSaveTheme.addEventListener('click', handleSaveTheme);
    
    const btnExport = document.getElementById('btnExport');
    if (btnExport) btnExport.addEventListener('click', handleExport);
    
    const fileImport = document.getElementById('fileImport');
    if (fileImport) fileImport.addEventListener('change', handleImport);
    
    const btnReset = document.getElementById('btnReset');
    if (btnReset) btnReset.addEventListener('click', handleReset);
    
    // Live hex updates for color inputs
    setupColorHexSync('themeBgPage', 'hexBgPage');
    setupColorHexSync('themeTextMain', 'hexTextMain');
    setupColorHexSync('themeAccentPrimary', 'hexAccentPrimary');
    setupColorHexSync('themeAccentSecondary', 'hexAccentSecondary');
});
