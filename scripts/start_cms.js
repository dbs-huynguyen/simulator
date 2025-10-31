const { chromium } = require("playwright");
require('dotenv').config();

if (!process.env.USERNAME) {
  console.error('❌ Thiếu biến môi trường: USERNAME');
  process.exit(1);
}
if (!process.env.PASSWORD) {
  console.error('❌ Thiếu biến môi trường: PASSWORD');
  process.exit(1);
}
if (!process.env.STARTING_TEMPLATE_ID) {
  console.error('❌ Thiếu biến môi trường: STARTING_TEMPLATE_ID');
  process.exit(1);
}
console.log(process.env.USERNAME);
console.log(process.env.PASSWORD);
console.log(process.env.STARTING_TEMPLATE_ID);


const folder = `logs/cms`;
const today = new Date();
const dateString = 
  today.getFullYear() +
  String(today.getMonth() + 1).padStart(2, '0') +
  String(today.getDate()).padStart(2, '0') + '_' +
  String(today.getHours()).padStart(2, '0') +
  String(today.getMinutes()).padStart(2, '0') +
  String(today.getSeconds()).padStart(2, '0');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });
  const page = await context.newPage();

  try {
    // Login
    await page.goto("https://awx.premedi.co.jp/#/login", { waitUntil: "networkidle" });
    await page.fill("input[name='login_username']", process.env.USERNAME);
    await page.fill("input[name='login_password']", process.env.PASSWORD);
    await page.click("button#login-button");
    await page.waitForURL("https://awx.premedi.co.jp/#/home", { waitUntil: "networkidle" });

    // Go to template starting CMS
    await page.goto(`https://awx.premedi.co.jp/#/templates/job_template/${process.env.STARTING_TEMPLATE_ID}`, { waitUntil: "networkidle" });
    await page.waitForURL(`https://awx.premedi.co.jp/#/templates/job_template/${process.env.STARTING_TEMPLATE_ID}*`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.getByRole("button", { name: "Launch" }).first().click();
    await page.waitForTimeout(15000);

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${folder}/${dateString}.png`, fullPage: true });

  } catch (error) {
    console.error("[ERR]", error);
  } finally {
    await browser.close();
  }
})();
