import { state } from '../core/state.js';
import { saveConfig } from '../core/storage.js';
import { applyTheme } from '../game/ui.js';

export function setupColorHexSync(inputId, spanId) {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    if(input && span) {
        input.addEventListener('input', (e) => {
            span.innerText = e.target.value.toUpperCase();
        });
    }
}

export function initThemeEditor() {
    const t = state.quizConfig.theme || {};
    
    const bgPage = (t.bgPage && t.bgPage !== '#F4F1E1') ? t.bgPage : '#FAF6F0';
    const textMain = (t.textMain && t.textMain !== '#2B2521') ? t.textMain : '#3D312A';
    const accentPrimary = (t.accentPrimary && t.accentPrimary !== '#C25B4E') ? t.accentPrimary : '#3D312A';
    const accentSecondary = t.accentSecondary || '#E57A93';
    
    const tBgPage = document.getElementById('themeBgPage');
    const tTextMain = document.getElementById('themeTextMain');
    const tAccentPrimary = document.getElementById('themeAccentPrimary');
    const tAccentSecondary = document.getElementById('themeAccentSecondary');
    
    if(tBgPage) { tBgPage.value = bgPage; document.getElementById('hexBgPage').innerText = bgPage.toUpperCase(); }
    if(tTextMain) { tTextMain.value = textMain; document.getElementById('hexTextMain').innerText = textMain.toUpperCase(); }
    if(tAccentPrimary) { tAccentPrimary.value = accentPrimary; document.getElementById('hexAccentPrimary').innerText = accentPrimary.toUpperCase(); }
    if(tAccentSecondary) { tAccentSecondary.value = accentSecondary; document.getElementById('hexAccentSecondary').innerText = accentSecondary.toUpperCase(); }

    const themeEventTitle = document.getElementById('themeEventTitle');
    const themeLogoPath = document.getElementById('themeLogoPath');
    if(themeEventTitle) themeEventTitle.value = t.eventTitle || "CCA ANIKARTA";
    if(themeLogoPath) themeLogoPath.value = t.logoPath || "";
    
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    themeLogoPath.value = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    applyTheme();
}

export function handleSaveTheme() {
    const bgPage = document.getElementById('themeBgPage').value;
    const textMain = document.getElementById('themeTextMain').value;
    const accentPrimary = document.getElementById('themeAccentPrimary').value;
    const accentSecondary = document.getElementById('themeAccentSecondary').value;

    state.quizConfig.theme = {
        eventTitle: document.getElementById('themeEventTitle').value.trim() || 'CCA ANIKARTA',
        logoPath: document.getElementById('themeLogoPath').value.trim(),
        bgPage,
        textMain,
        accentPrimary,
        accentSecondary
    };
    saveConfig();
    applyTheme();
    alert("Tema berhasil disimpan!");
}

export function applyPreset(presetIndex) {
    const presets = [
        { bgPage: '#FAF6F0', textMain: '#3D312A', accentPrimary: '#3D312A', accentSecondary: '#E57A93' },
        { bgPage: '#FFFFFF', textMain: '#2B2521', accentPrimary: '#E57A93', accentSecondary: '#1BBF61' },
        { bgPage: '#1E1B18', textMain: '#FAF6F0', accentPrimary: '#F6C967', accentSecondary: '#E57A93' }
    ];
    const p = presets[presetIndex];
    document.getElementById('themeBgPage').value = p.bgPage;
    document.getElementById('themeTextMain').value = p.textMain;
    document.getElementById('themeAccentPrimary').value = p.accentPrimary;
    document.getElementById('themeAccentSecondary').value = p.accentSecondary;
    
    document.getElementById('themeBgPage').dispatchEvent(new Event('input'));
    document.getElementById('themeTextMain').dispatchEvent(new Event('input'));
    document.getElementById('themeAccentPrimary').dispatchEvent(new Event('input'));
    document.getElementById('themeAccentSecondary').dispatchEvent(new Event('input'));
}

window.applyPreset = applyPreset;
