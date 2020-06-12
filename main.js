const puppeteer = require('puppeteer');
const urlnode = require('url');

let browser;

const MainDownloader = async (url) => {

  try {
    if (!browser) {
      browser = await puppeteer.launch();
      console.log('[main] Browser Not Found. Created New Instance');
    }
    const page = await browser.newPage();
    const pageGoto = await page.goto(url, {waitUntil: ['load', 'domcontentloaded', 'networkidle2']});

    let pageOptions

    if (pageGoto.ok) {
      pageOptions = await page.evaluate(() => {
        const vid = document.querySelector('video');
        if (vid) {
          return {
            src: vid.src,
            poster: vid.poster,
          };
        } else {
          return false;
        }
      });

      // console.log('pageOptions: ', pageOptions);

      if (pageOptions == false) {
        const file = urlnode.parse(url).pathname.replace(/\//g, '-');
        await page.screenshot({path: `screenshots/failed${file}-${Date.now()}.png`});
      }

      if (pageOptions) {
        pageOptions.url = await page.url();
      }
    
    } else {
      console.error('[main] pageGoto error: ', pageGoto);
      const status = (pageGoto && pageGoto.statusText)? pageGoto.statusText : 'Error with page';
      throw Error(status);
    }

    // await browser.close();
    await page.close();
    return pageOptions;

  } catch (error) {
    console.error('[main] script error: ', error);
    throw error;
  }
}

module.exports = MainDownloader;
