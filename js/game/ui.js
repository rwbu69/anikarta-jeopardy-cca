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
    if (!accentPrimary) accentPrimary = '#C25B4E';
    if (!textMain) textMain = '#2B2521';
    
    // Generate colors for points based on accentPrimary
    const pointsList = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const hsl = hexToHSL(accentPrimary);
    const root = document.documentElement;
    let dynamicStyles = document.getElementById('dynamicPointStyles');
    if (!dynamicStyles) {
        dynamicStyles = document.createElement('style');
        dynamicStyles.id = 'dynamicPointStyles';
        document.head.appendChild(dynamicStyles);
    }
    
    let styleCSS = '';
    pointsList.forEach((point, index) => {
        // Shift hue by 15 degrees per step, constrain to 360
        const newHue = (hsl[0] + (index * 15)) % 360;
        const newHex = HSLToHex(newHue, hsl[1], hsl[2]);
        const contrastText = getContrastColor(newHex, textMain);
        
        root.style.setProperty(`--color-point-${point}`, newHex);
        root.style.setProperty(`--text-point-${point}`, contrastText);
        
        styleCSS += `.point-${point} { background-color: var(--color-point-${point}); color: var(--text-point-${point}); }\n`;
    });
    
    dynamicStyles.innerHTML = styleCSS;
}

export function applyTheme() {
    let t = state.quizConfig.theme;
    const root = document.documentElement;
    
    // Fallback to computed styles if theme config is missing
    if (!t || !t.bgPage) {
        const style = getComputedStyle(root);
        t = {
            bgPage: style.getPropertyValue('--bg-page').trim() || '#F4F1E1',
            textMain: style.getPropertyValue('--text-main').trim() || '#2B2521',
            accentPrimary: style.getPropertyValue('--color-accent-primary').trim() || '#C25B4E',
            accentSecondary: style.getPropertyValue('--color-accent-secondary').trim() || '#58705F'
        };
    }
    
    const bgPage = t.bgPage;
    const textMain = t.textMain;
    const accentPrimary = t.accentPrimary;
    const accentSecondary = t.accentSecondary;
    
    root.style.setProperty('--bg-page', bgPage);
    root.style.setProperty('--text-main', textMain);
    root.style.setProperty('--color-accent-primary', accentPrimary);
    root.style.setProperty('--color-accent-secondary', accentSecondary);
    
    // Derived tokens
    root.style.setProperty('--text-on-accent-primary', getContrastColor(accentPrimary, textMain));
    root.style.setProperty('--color-divider', hexToRgbAString(textMain, 0.15));
    root.style.setProperty('--text-sub', hexToRgbAString(textMain, 0.6));
    
    const lum = getLuminance(bgPage);
    if (lum > 0.5) { 
        root.style.setProperty('--bg-surface', `color-mix(in srgb, ${bgPage}, #000 4%)`);
    } else {
        root.style.setProperty('--bg-surface', `color-mix(in srgb, ${bgPage}, #fff 6%)`);
    }
    
    // Generate point colors dynamically
    getPointColors(accentPrimary, textMain);

    const titleEl = document.getElementById('eventTitleText');
    const logoEl = document.getElementById('eventLogo');
    
    if (titleEl && t.eventTitle) {
        titleEl.innerText = t.eventTitle;
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
