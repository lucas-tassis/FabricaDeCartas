const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('error', err => console.log('ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174');
  
  // wait for it to load
  await page.waitForSelector('.card-canvas');
  
  const delay = ms => new Promise(res => setTimeout(res, ms));
  
  // Set grid to 2.5
  const gridInput = await page.$('input[step="0.5"]');
  await gridInput.click();
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('2.5');
  await delay(500);

  console.log('Selecting squares...');
  const canvas = await page.$('.card-canvas');
  const box = await canvas.boundingBox();
  
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 50);
  await page.mouse.up();
  await delay(500);
  
  console.log('Right clicking...');
  await page.mouse.click(box.x + 20, box.y + 20, { button: 'right' });
  await delay(500);
  
  console.log('Clicking create section...');
  const menuItems = await page.$$('.menu-item');
  if (menuItems.length > 0) {
    await menuItems[0].click();
    await delay(1000);
    const bodyText = await page.evaluate(() => document.body.innerHTML);
    if (!bodyText.includes('card-canvas')) {
      console.log('APP CRASHED! Canvas not found in DOM.');
    } else {
      console.log('App is still alive.');
    }
  } else {
    console.log('Context menu not found!');
  }
  
  await browser.close();
})();
