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
    
    const bgPage = t.bgPage || '#F4F1E1';
    const textMain = t.textMain || '#2B2521';
    const accentPrimary = t.accentPrimary || '#C25B4E';
    const accentSecondary = t.accentSecondary || '#58705F';
    
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
    if(themeEventTitle) themeEventTitle.value = t.eventTitle || "";
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
        eventTitle: document.getElementById('themeEventTitle').value.trim(),
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
        { bgPage: '#F4F1E1', textMain: '#2B2521', accentPrimary: '#C25B4E', accentSecondary: '#58705F' },
        { bgPage: '#0F172A', textMain: '#F8FAFC', accentPrimary: '#38BDF8', accentSecondary: '#818CF8' },
        { bgPage: '#FFFFFF', textMain: '#1E293B', accentPrimary: '#E58BA9', accentSecondary: '#1BBF61' }
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
