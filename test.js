const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
console.log("Original HTML length: ", html.length);

let newHtml = html.replace(/<a href="#home">BLACKPINE CAPITAL<\/a>/g, "REPLACED LOGO");
console.log("New HTML length: ", newHtml.length);
if (html === newHtml) {
    console.log("NO REPLACEMENT MADE IN HTML!");
}

fs.writeFileSync('index.html', newHtml);
