const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');

const slogans = require('../slogans.json');
const template = fs.readFileSync('./template.html', 'utf8');

Object.keys(slogans).map((date) => {
  const { slogan } = slogans[date];
  (async () => {
    await nodeHtmlToImage({
      html: template,
      content: [{ slogan, output: './images/' + date + '.png' }],
    });
  })();
});
