const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function build() {

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Minify JavaScript
execSync('npx terser script.js -o dist/script.min.js -c -m');
console.log('✓ JavaScript minified');

// Minify CSS
execSync('npx csso styles.css -o dist/styles.min.css');
console.log('✓ CSS minified');

// Minify HTML and update resource links
const htmlMinifier = require('html-minifier-terser');
let html = fs.readFileSync('index.html', 'utf8');
// Replace file references before minification
html = html.replace('styles.css', 'styles.min.css')
           .replace('script.js', 'script.min.js');

const minifiedHtml = await htmlMinifier.minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
});

fs.writeFileSync('dist/index.html', minifiedHtml);
console.log('✓ HTML minified');

console.log('\nBuild completed! Files are ready in the dist folder.');
}

build().catch(console.error);
