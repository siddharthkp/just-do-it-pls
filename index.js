require('dotenv').config();
const fs = require('fs');
const twitter = require('twitter');
const puppeteer = require('puppeteer');

// get today's slogan from file
const slogans = require('./slogans.json');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const todaysSlogan = slogans[today];
const template = fs.readFileSync('./template.html', 'utf8');

/** create twitter client */
const client = new twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

// start server
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response);
});

server.listen(5000);

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 896, height: 504, deviceScaleFactor: 1 });
  await page.goto(
    'http://localhost:5000/template?slogan=' + todaysSlogan.slogan
  );

  const photoBuffer = await page.screenshot();

  await browser.close();

  try {
    // upload photo first
    await client
      .post('media/upload', { media: photoBuffer })
      .then((screenshot) =>
        client.post('statuses/update', {
          media_ids: screenshot.media_id_string,
          status: todaysSlogan.via ? 'via ' + todaysSlogan.via : '',
        })
      )
      .then((tweet) => {
        // then tweet!
        console.info('done');
        process.exit(1);
        return true;
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
    return;
  }
})();
