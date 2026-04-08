import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  const content = await page.content();
  console.log("PAGE HTML HEAD:", content.substring(0, 300));
  console.log("PAGE HTML TAIL:", content.substring(content.length - 300));
  
  // Check what tabs are visible or what text is visible
  const dashboardText = await page.locator('text=Where money goes').count();
  console.log("Dashboard text count:", dashboardText);
  
  const appContent = await page.locator('#root').innerHTML();
  console.log("App Content length:", appContent.length);
  
  await browser.close();
})();
