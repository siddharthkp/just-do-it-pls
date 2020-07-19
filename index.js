require('dotenv').config();
const fs = require('fs');
const twitter = require('twitter');
const nodeHtmlToImage = require('node-html-to-image');

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

(async () => {
  const photoBuffer = await nodeHtmlToImage({
    html: template,
    content: [{ slogan: todaysSlogan.slogan }],
    puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

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
        return true;
      });
  } catch (error) {
    console.error(error);
    return;
  }
})();
