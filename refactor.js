const fs = require('fs');
let html = fs.readFileSync('public/showcase.html', 'utf8');

// Wrap Hero and Tokens in a div
html = html.replace(/<!-- ── Hero ─+ -->\s*<section class=\"ds-hero\">[\s\S]*?<\/section>/, (match) => {
  return '<div class=\"ds-page is-active\" id=\"page-tokens\">\n' + match;
});

html = html.replace(/<section class=\"ds-section\" id=\"tokens\">([\s\S]*?)<\/section>/, (match) => {
  // We need to keep the id="tokens" intact for anchor linking? No, we rename to page-tokens
  return match.replace('<section class="ds-section" id="tokens">', '<section class="ds-section">') + '\n</div><!-- /#page-tokens -->';
});

// Update all other sections
const sections = ['colors', 'typography', 'spacing', 'components', 'badges', 'cards', 'forms', 'toggles', 'feedback', 'modals', 'skeletons', 'codeblocks'];
sections.forEach(id => {
  if (id === 'tokens') return;
  const regex = new RegExp('<section class=\"ds-section\" id=\"' + id + '\">');
  html = html.replace(regex, '<section class=\"ds-section ds-page\" id=\"page-' + id + '\">');
});

// Tooltip doesn't have an ID in current HTML
html = html.replace(/<section class=\"ds-section\">\s*<div class=\"ds-section-header\">\s*<h2>Tooltips<\/h2>/, '<section class=\"ds-section ds-page\" id=\"page-tooltips\">\n      <div class=\"ds-section-header\">\n        <h2>Tooltips</h2>');

fs.writeFileSync('public/showcase.html', html);
console.log('HTML restructured successfully.');
