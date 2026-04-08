import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log("Page loaded successfully.");
    
    // Check if SVG is rendered
    const svgs = await page.$$eval('svg', svgs => svgs.length);
    console.log(`Found ${svgs} SVGs overall`);

    const rechartsSvgs = await page.$$eval('svg.recharts-surface', svgs => svgs.length);
    console.log(`Found ${rechartsSvgs} recharts SVGs`);
    
    // Check if any Paths exist in recharts
    const paths = await page.$$eval('svg.recharts-surface path', paths => paths.length);
    console.log(`Found ${paths} recharts paths`);
    
    const boundingBox1 = await page.evaluate(() => {
        const el = document.querySelector('.recharts-wrapper');
        return el ? JSON.stringify(el.getBoundingClientRect()) : 'null';
    });
    console.log('Recharts wrapper bounds:', boundingBox1);

  } catch (err) {
    console.error("Navigation error:", err);
  }
  await browser.close();
})();
