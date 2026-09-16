const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  const form=page.locator('#kontakt');
  assert.equal(await form.evaluate(el=>getComputedStyle(el).getPropertyValue('--fc-blue').trim()),'#168ccd');
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});await form.scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow at '+width);
   await page.screenshot({path:'backups/contact-'+width+'.png',fullPage:false});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.space-option[data-space=zgrade]').click();
  assert.equal(await form.locator('[data-space="Zgrada"]').getAttribute('aria-pressed'),'true');
  await form.locator('[data-method=Poruka]').click();
  assert(await form.locator('.fc-apps').isVisible());
  await form.locator('[data-app=WhatsApp]').click();
  await form.locator('[name=location]').fill('Novi Beograd');await form.locator('textarea').fill('Pranje stepeništa');
  await form.locator('[name=phone]').fill('065 9564738');
  await form.locator('#fc-files').setInputFiles('dist/logo-black.png');
  assert.equal(await form.locator('.fc-thumb').count(),1);
  await form.locator('[type=submit]').click();
  assert.match(await form.locator('[role=status]').innerText(),/WhatsApp · \+381659564738/);
  await form.locator('.fc-thumb button').click();assert.equal(await form.locator('.fc-thumb').count(),0);
  await form.locator('[data-method=Email]').click();
  assert(await form.locator('[name=phone]').isDisabled());
  await form.locator('[name=email]').fill('test@example.com');await form.locator('[type=submit]').click();
  assert.match(await form.locator('[role=status]').innerText(),/test@example.com/);
  await form.screenshot({path:'backups/contact-final.png',style:'header,.skip{visibility:hidden!important}'});
  assert.deepEqual(errors,[]);console.log('PASS: responsive widths, service selection, messaging, phone normalization, image add/remove, email and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
