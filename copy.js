const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let newHtml = html.replace(/<a href="#home">BLACKPINE CAPITAL<\/a>/g, 'REPLACED LOGO');
fs.writeFileSync('index-new.html', newHtml);
