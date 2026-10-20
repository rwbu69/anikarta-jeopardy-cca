import { state } from '../core/state.js';

function getLuminance(hex) {
    let rgb = hex.replace('#', '');
    if (rgb.length === 3) rgb = rgb.split('').map(c => c + c).join('');
    let r = parseInt(rgb.substr(0, 2), 16) / 255;
    let g = parseInt(rgb.substr(2, 2), 16) / 255;
    let b = parseInt(rgb.substr(4, 2), 16) / 255;
    let a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastColor(hexBg, hexTextDark) {
    const lumBg = getLuminance(hexBg);
    const lumWhite = getLuminance('#FFFFFF');
    const lumDark = getLuminance(hexTextDark);
    
    const ratioWhite = (Math.max(lumBg, lumWhite) + 0.05) / (Math.min(lumBg, lumWhite) + 0.05);
    const ratioDark = (Math.max(lumBg, lumDark) + 0.05) / (Math.min(lumBg, lumDark) + 0.05);
    
    return ratioWhite > ratioDark ? '#FFFFFF' : hexTextDark;
}

function hexToRgbAString(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Simple HSL conversion for hue shifting
function hexToHSL(hex) {
    let rgb = hex.replace('#', '');
    if (rgb.length === 3) rgb = rgb.split('').map(c => c + c).join('');
    let r = parseInt(rgb.substr(0, 2), 16) / 255;
    let g = parseInt(rgb.substr(2, 2), 16) / 255;
    let b = parseInt(rgb.substr(4, 2), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; 
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

function getPointColors(accentPrimary, textMain) {
    if (!accentPrimary) accentPrimary = '#3D312A';
    if (!textMain) textMain = '#3D312A';
    
    const root = document.documentElement;
    let dynamicStyles = document.getElementById('dynamicPointStyles');
    if (!dynamicStyles) {
        dynamicStyles = document.createElement('style');
        dynamicStyles.id = 'dynamicPointStyles';
        document.head.appendChild(dynamicStyles);
    }

    const defaultOmbre = {
        100: { bg: '#EFA3B8', shadow: '#D48198' },
        200: { bg: '#EB9E9F', shadow: '#CE7E7F' },
        300: { bg: '#E7A994', shadow: '#C98973' },
        400: { bg: '#E5BA93', shadow: '#C79A72' },
        500: { bg: '#E6CE97', shadow: '#C8AF75' }
    };
    
    let styleCSS = '';
    const isDefaultTheme = accentPrimary === '#3D312A' || accentPrimary === '#C25B4E';

    [100, 200, 300, 400, 500].forEach((point) => {
        if (isDefaultTheme && defaultOmbre[point]) {
            root.style.setProperty(`--tier-${point}-bg`, defaultOmbre[point].bg);
            root.style.setProperty(`--tier-${point}-shadow`, defaultOmbre[point].shadow);
            styleCSS += `.point-${point}, .tier-${point} { background-color: ${defaultOmbre[point].bg}; box-shadow: 0 4px 0 ${defaultOmbre[point].shadow}; color: #3D312A; }\n`;
        } else {
            const hsl = hexToHSL(accentPrimary);
            const newHue = (hsl[0] + ((point / 100 - 1) * 15)) % 360;
            const newHex = HSLToHex(newHue, hsl[1], hsl[2]);
            const shadowHex = HSLToHex(newHue, hsl[1], Math.max(0, hsl[2] - 15));
            const contrastText = getContrastColor(newHex, textMain);
            
            root.style.setProperty(`--tier-${point}-bg`, newHex);
            root.style.setProperty(`--tier-${point}-shadow`, shadowHex);
            styleCSS += `.point-${point}, .tier-${point} { background-color: ${newHex}; box-shadow: 0 4px 0 ${shadowHex}; color: ${contrastText}; }\n`;
        }
    });
    
    dynamicStyles.innerHTML = styleCSS;
}

export function applyTheme() {
    let t = state.quizConfig ? state.quizConfig.theme : null;
    const root = document.documentElement;
    
    // Fallback to computed styles if theme config is missing
    if (!t || !t.bgPage || t.bgPage === '#F4F1E1') {
        const style = getComputedStyle(root);
        t = {
            bgPage: style.getPropertyValue('--bg-page').trim() || '#FAF6F0',
            textMain: style.getPropertyValue('--text-main').trim() || '#3D312A',
            accentPrimary: '#3D312A',
            accentSecondary: '#E57A93',
            eventTitle: t?.eventTitle || 'CCA ANIKARTA',
            logoPath: t?.logoPath || ''
        };
        if (state.quizConfig) state.quizConfig.theme = t;
    }
    
    const bgPage = t.bgPage;
    const textMain = t.textMain;
    const accentPrimary = t.accentPrimary || '#3D312A';
    const accentSecondary = t.accentSecondary || '#E57A93';
    
    root.style.setProperty('--bg-page', bgPage);
    root.style.setProperty('--text-main', textMain);
    root.style.setProperty('--color-accent-primary', accentPrimary);
    root.style.setProperty('--color-accent-secondary', accentSecondary);
    
    // Derived tokens
    root.style.setProperty('--text-on-accent-primary', getContrastColor(accentPrimary, textMain));
    root.style.setProperty('--color-divider', '#E2D9CE');
    root.style.setProperty('--text-sub', '#8C7D72');
    root.style.setProperty('--bg-surface', '#FFFFFF');
    
    // Generate point colors dynamically
    getPointColors(accentPrimary, textMain);

    const titleEl = document.getElementById('eventTitleText');
    const logoEl = document.getElementById('eventLogo');
    
    if (titleEl) {
        titleEl.innerText = t.eventTitle || 'CCA ANIKARTA';
    }
    
    if (logoEl && t.logoPath) {
        logoEl.src = t.logoPath;
        logoEl.classList.remove('hidden');
        if(titleEl) titleEl.classList.add('hidden');
    } else {
        if(logoEl) logoEl.classList.add('hidden');
        if(titleEl) titleEl.classList.remove('hidden');
    }
}

export function updateProgressUI() {
    const progressEl = document.getElementById('progressBadge');
    if (!progressEl) return;
    
    const totalCells = document.querySelectorAll('.board-cell').length;
    const playedCells = document.querySelectorAll('.board-cell.played').length;
    
    if (totalCells === 0) {
        progressEl.innerText = `Daftar Lagu: 0 / 0`;
        return;
    }
    
    progressEl.innerText = `Daftar Lagu: ${playedCells} / ${totalCells}`;
    if (playedCells > 0 && typeof gsap !== 'undefined') {
        gsap.from(progressEl, { backgroundColor: 'var(--color-accent-primary)', color: 'var(--text-on-accent-primary)', duration: 0.5 });
    }
}
