import { state } from '../core/state.js';
import { saveConfig, ensureTiebreakerConfig, ensureAudienceConfig } from '../core/storage.js';
import { initThemeEditor } from './theme.js';
import { renderAdminBoard, renderTieBreakerAdmin, renderAudienceAdmin } from './questions.js';

export function handleExport() {
    const jsString = JSON.stringify(state.quizConfig, null, 4);
    const blob = new Blob([jsString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-config.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

export function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedConfig = JSON.parse(evt.target.result);
            if (importedConfig.questions) {
                state.quizConfig = importedConfig;
                ensureTiebreakerConfig();
                ensureAudienceConfig();
                saveConfig();
                initThemeEditor();
                renderAdminBoard();
                renderTieBreakerAdmin();
                renderAudienceAdmin();
                alert("Konfigurasi berhasil diimpor!");
            } else {
                alert("Format JSON tidak valid. Pastikan file adalah event-config.json yang valid.");
            }
        } catch (error) {
            alert("Gagal membaca file JSON.");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
}

export function handleReset() {
    if (confirm("Apakah Anda yakin ingin menghapus semua perubahan tema & soal dan kembali ke bawaan?")) {
        localStorage.removeItem('quizConfig');
        localStorage.removeItem('jeopardyData'); // clean legacy data
        localStorage.removeItem('playedAudienceQuestions');
        location.reload();
    }
}
