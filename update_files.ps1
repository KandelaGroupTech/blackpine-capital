$html = Get-Content index.html -Raw
$html = $html.Replace('<a href="#home">BLACKPINE CAPITAL</a>', '<a href="#home" class="brand-link" style="display: flex; align-items: center; text-decoration: none; gap: 15px;">
                    <svg class="brand-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 45px; height: 55px; color: #c5a059;">
                        <polygon points="50,15 20,60 80,60" fill="none" stroke="currentColor" stroke-width="4"/>
                        <polygon points="50,35 15,80 85,80" fill="none" stroke="currentColor" stroke-width="4"/>
                        <rect x="47" y="80" width="6" height="15" fill="currentColor"/>
                    </svg>
                    <div class="brand-text" style="display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 3px;">
                        <span class="brand-title" style="font-family: ''Playfair Display'', serif; font-size: 1.6rem; font-weight: 600; color: #f8f5f0; letter-spacing: 3px; line-height: 1.1;">BLACKPINE</span>
                        <span class="brand-subtitle" style="font-family: ''Montserrat'', sans-serif; font-size: 0.65rem; font-weight: 400; color: #c5a059; letter-spacing: 5px; line-height: 1; margin-top: 5px;">CAPITAL</span>
                    </div>
                </a>')
$html = $html.Replace('<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">', '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">')
$html = $html.Replace('style="background-color: #fff; color: #222; border: 2px solid #fff;">CONTACT US', 'style="background-color: transparent; color: #f8f5f0; border: 1px solid #c5a059;">CONTACT US')
$html = $html.Replace('href="styles.css?v=3"', 'href="styles.css?v=11"')

Set-Content index.html -Value $html -Encoding UTF8

$js = Get-Content background.js -Raw
$js = $js.Replace('const spacing = 65; // Increased spacing for ~60% fewer particles', 'const spacing = 110; // Increased spacing for ~60% fewer particles')
$js = $js.Replace('this.color = ''rgba(0, 0, 0, 0.3)'';', 'this.color = ''rgba(197, 160, 89, 0.15)'';')
Set-Content background.js -Value $js -Encoding UTF8

$sjs = Get-Content script.js -Raw
$sjs = $sjs.Replace('navbar.style.backgroundColor = ''#111'';', 'navbar.style.backgroundColor = ''#08090b'';')
$sjs = $sjs.Replace('navbar.style.backgroundColor = ''#222'';', 'navbar.style.backgroundColor = ''#0d0e12'';')
$sjs = $sjs.Replace('link.style.color = ''#ccc'';', 'link.style.color = ''#a0a2a8'';')
$sjs = $sjs.Replace('link.style.color = ''#fff'';', 'link.style.color = ''#f8f5f0'';')
Set-Content script.js -Value $sjs -Encoding UTF8
