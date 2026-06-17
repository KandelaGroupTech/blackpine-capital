const fs = require('fs');

function replaceExact(file, searchStr, replaceStr) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(searchStr)) {
        content = content.split(searchStr).join(replaceStr);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Replaced string in ${file}`);
    } else {
        console.log(`Could not find target string in ${file}`);
    }
}

let idx = fs.readFileSync('index.html', 'utf8');
idx = idx.replace('<a href="#home">BLACKPINE CAPITAL</a>', `<a href="#home" class="brand-link" style="display: flex; align-items: center; text-decoration: none; gap: 15px;">
                    <svg class="brand-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 45px; height: 55px; color: #c5a059;">
                        <polygon points="50,15 20,60 80,60" fill="none" stroke="currentColor" stroke-width="4"/>
                        <polygon points="50,35 15,80 85,80" fill="none" stroke="currentColor" stroke-width="4"/>
                        <rect x="47" y="80" width="6" height="15" fill="currentColor"/>
                    </svg>
                    <div class="brand-text" style="display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 3px;">
                        <span class="brand-title" style="font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 600; color: #f8f5f0; letter-spacing: 3px; line-height: 1.1;">BLACKPINE</span>
                        <span class="brand-subtitle" style="font-family: 'Montserrat', sans-serif; font-size: 0.65rem; font-weight: 400; color: #c5a059; letter-spacing: 5px; line-height: 1; margin-top: 5px;">CAPITAL</span>
                    </div>
                </a>`);
idx = idx.replace('<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">', '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">');
idx = idx.replace('style="background-color: #fff; color: #222; border: 2px solid #fff;">CONTACT US', 'style="background-color: transparent; color: #f8f5f0; border: 1px solid #c5a059;">CONTACT US');
idx = idx.replace(/href="styles\.css\?v=[0-9]+"/, 'href="styles.css?v=' + Date.now() + '"');
fs.writeFileSync('index.html', idx);

let sjs = fs.readFileSync('script.js', 'utf8');
sjs = sjs.replace("navbar.style.backgroundColor = '#111';", "navbar.style.backgroundColor = '#08090b';");
sjs = sjs.replace("navbar.style.backgroundColor = '#222';", "navbar.style.backgroundColor = '#0d0e12';");
sjs = sjs.replace("link.style.color = '#ccc';", "link.style.color = '#a0a2a8';");
sjs = sjs.replace("link.style.color = '#fff';", "link.style.color = '#f8f5f0';");
fs.writeFileSync('script.js', sjs);

let bjs = fs.readFileSync('background.js', 'utf8');
bjs = bjs.replace('const spacing = 65;', 'const spacing = 110;');
bjs = bjs.replace("this.color = 'rgba(0, 0, 0, 0.3)';", "this.color = 'rgba(197, 160, 89, 0.15)';");
fs.writeFileSync('background.js', bjs);

let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('--bg-charcoal')) {
    css = `/* ========================================
   CSS Variables for Premium Aesthetic
   ======================================== */
:root {
    --bg-charcoal: #0d0e12;
    --bg-charcoal-light: #15161a;
    --bg-charcoal-lighter: #1e1f24;
    --accent-gold: #c5a059;
    --accent-gold-hover: #e0b666;
    --text-cream: #f8f5f0;
    --text-muted: #a0a2a8;
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Montserrat', sans-serif;
}

` + css;
}
// Robust regexes that ignore line endings and exact spaces
css = css.replace(/color:\s*#333/g, 'color: var(--text-cream)');
css = css.replace(/color:\s*#555/g, 'color: var(--text-muted)');
css = css.replace(/color:\s*#222/g, 'color: var(--text-cream)');
css = css.replace(/color:\s*#fff/g, 'color: var(--text-cream)');
css = css.replace(/color:\s*#ccc/g, 'color: var(--text-muted)');
css = css.replace(/color:\s*#444/g, 'color: var(--text-cream)');
css = css.replace(/background-color:\s*#222/g, 'background-color: var(--bg-charcoal)');
css = css.replace(/background-color:\s*#f8f8f8/g, 'background-color: var(--bg-charcoal)');
css = css.replace(/background-color:\s*#fafafa/g, 'background-color: var(--bg-charcoal-lighter)');
css = css.replace(/background-color:\s*#fff/g, 'background-color: var(--bg-charcoal-light)');
css = css.replace(/background-color:\s*#333/g, 'background-color: var(--accent-gold)');
css = css.replace(/background-color:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.85\s*\)/g, 'background-color: rgba(21, 22, 26, 0.85)');
css = css.replace(/background-color:\s*rgba\(\s*248\s*,\s*248\s*,\s*248\s*,\s*0\.85\s*\)/g, 'background-color: rgba(30, 31, 36, 0.85)');
css = css.replace(/background-color:\s*rgba\(\s*244\s*,\s*244\s*,\s*244\s*,\s*0\.85\s*\)/g, 'background-color: rgba(13, 14, 18, 0.85)');
css = css.replace(/border:\s*2px\s+solid\s+#333/g, 'border: 1px solid var(--accent-gold)');
css = css.replace(/border:\s*2px\s+solid\s+#fff/g, 'border: 1px solid var(--accent-gold)');
css = css.replace(/border:\s*2px\s+solid\s+#eee/g, 'border: 1px solid rgba(197, 160, 89, 0.2)');
css = css.replace(/border-color:\s*#08ac9b/g, 'border-color: var(--accent-gold)');
css = css.replace(/background-color:\s*#08ac9b/g, 'background-color: var(--accent-gold-hover)');
css = css.replace(/box-shadow:\s*0\s+0\s+0\s+4px\s+rgba\(\s*8\s*,\s*172\s*,\s*155\s*,\s*0\.1\s*\)/g, 'box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.1)');
css = css.replace(/font-family:\s*'Montserrat',\s*Arial,\s*Helvetica,\s*sans-serif/g, 'font-family: var(--font-body)');
css = css.replace(/font-weight:\s*700/g, 'font-weight: 600');

if (!css.includes('.brand-link')) {
    css += `\n.brand-link { display: flex; align-items: center; text-decoration: none; gap: 15px; }\n.brand-logo { width: 45px; height: 55px; color: var(--accent-gold); }\n.brand-text { display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 3px; }\n.brand-title { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; color: var(--text-cream); letter-spacing: 3px; line-height: 1.1; }\n.brand-subtitle { font-family: var(--font-body); font-size: 0.65rem; font-weight: 400; color: var(--accent-gold); letter-spacing: 5px; line-height: 1; margin-top: 5px; }\nh1, h2, h3 { font-family: var(--font-heading); }\n`;
}

fs.writeFileSync('styles.css', css);
console.log('Execute complete');
