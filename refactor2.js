const fs = require('fs');
let html = fs.readFileSync('public/showcase.html', 'utf8');

html = html.replace(/<div class=\"ds-semantic-swatch\"/g, '<div class=\"ds-semantic-swatch\" tabindex=\"0\" role=\"button\"');

fs.writeFileSync('public/showcase.html', html);
console.log('HTML swatches updated.');
