#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const md = require('markdown-it')();
const markdownItAttrs = require('markdown-it-attrs');
const markdownItLinkAttributes = require('markdown-it-link-attributes');

if (process.argv.length <= 3) {
    console.error(`${process.argv[0]} src out`);
    process.exit(1);
}

md.use(markdownItAttrs);
md.use(markdownItLinkAttributes, {
    attrs: {
        target: '_blank',
        rel: 'noopener'
    }
});

const sourcePath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);

const content = fs.readFileSync(sourcePath).toString();

// Add the different classes to the markdown structure to be able to style them in the HTML.
const contentWithClasses = content
    .replace(/^# (.*)/gm, '# $1 {.version}')
    .replace(/^## Fixed$/gm, '## Fixed {.group .bugs}')
    .replace(/^## Added$/gm, '## Added {.group .features}')
    .replace(/^## Changed$/gm, '## Changed {.group .others}')
    .replace(/^- (.*)/gm, '- $1 {.change}');

const data = md.render(contentWithClasses);

const out = `<div>
${data}
</div>`;

fs.writeFileSync(outputPath, out);
