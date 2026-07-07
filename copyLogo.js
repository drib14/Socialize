const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\jhond\\.gemini\\antigravity-ide\\brain\\17ecf8f0-f1ff-4c9d-b759-db63cbcfe379\\socialize_green_logo_1783448933173.png';
const targets = [
    'client/public/favicon.ico',
    'client/public/icon-web-01.png',
    'client/public/logo192.png',
    'client/public/logo512.png'
];

if (fs.existsSync(src)) {
    targets.forEach(target => {
        const dest = path.join(__dirname, target);
        fs.copyFileSync(src, dest);
        console.log(`Copied logo to ${target}`);
    });
} else {
    console.error(`Source logo not found at ${src}`);
}
