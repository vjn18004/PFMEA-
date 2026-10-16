const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/');
  await page.screenshot({path:'/tmp/pfmea-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Prova med ett exempel'}).click();
  await page.getByRole('button',{name:'Fortsätt till processflöde'}).click();
  const operation=page.locator('[data-operation="OP30"]');
  const boxes=await page.locator('.hierarchy-operation').evaluateAll(xs=>xs.map(x=>({x:x.getBoundingClientRect().x,y:x.getBoundingClientRect().y})));
  assert.equal(boxes.length,10);
  assert.ok(boxes.every((b,i)=>b.x===boxes[0].x&&(!i||b.y>boxes[i-1].y)),'Operations must be vertical');
  const root=await page.locator('.main-process-card').boundingBox();
  const palette=await page.locator('.four-m-palette').boundingBox();
  assert.ok(root.x<boxes[0].x&&palette.x>boxes[0].x,'Parent left, palette right');
  await page.locator('.drag-card').first().dragTo(operation);
  for(let i=0;i<3;i++){
   await page.locator('.drag-card').first().click();
   await page.getByRole('button',{name:'Tilldela vald egenskap till OP30',exact:true}).click();
  }
  assert.equal(await operation.locator('.assigned-card').count(),4);
  assert.equal(await page.getByRole('button',{name:'Beskriv funktioner',exact:true}).isDisabled(),true,'Main process required');
  assert.equal(await page.getByRole('button',{name:'3 Funktioner',exact:true}).isDisabled(),true,'Sidebar cannot bypass required name');
  await page.getByLabel('Namn på huvudprocessen').fill('   ');
  assert.equal(await page.getByRole('button',{name:'Beskriv funktioner',exact:true}).isDisabled(),true);
  await page.getByLabel('Namn på huvudprocessen').fill('Tillverkning av axelhus');
  for(const category of ['Människa','Maskin','Material','Metod']){
   await page.locator('.four-m-card').filter({hasText:category}).dragTo(operation.locator('.operation-resources'));
  }
  assert.equal(await operation.locator('.resource-box').count(),4);
  await page.getByRole('textbox',{name:'Maskin i OP30',exact:true}).fill('Borrmaskin CNC-03');
  await page.getByRole('textbox',{name:'Människa i OP30',exact:true}).fill('CNC-operatör');
  // A category can be reused; removal must affect only the chosen instance.
  await page.locator('.four-m-card').filter({hasText:'Maskin'}).click();
  await operation.getByRole('button',{name:'Lägg till Maskin',exact:true}).click();
  await page.getByRole('textbox',{name:'Maskin i OP30',exact:true}).nth(1).fill('Fixtur F-12');
  await operation.getByRole('button',{name:'Ta bort Maskin från OP30',exact:true}).nth(1).click();
  assert.equal(await page.getByRole('textbox',{name:'Maskin i OP30',exact:true}).inputValue(),'Borrmaskin CNC-03');
  await page.screenshot({path:'/tmp/pfmea-process-desktop.png',fullPage:true});
  for(const width of [768,390]){
   await page.setViewportSize({width,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Process overflow at ${width}px`);
  }
  await page.screenshot({path:'/tmp/pfmea-process-mobile.png',fullPage:true});
  await page.reload();
  await page.getByRole('button',{name:'2 Processflöde',exact:true}).click();
  assert.equal(await page.getByLabel('Namn på huvudprocessen').inputValue(),'Tillverkning av axelhus');
  assert.equal(await page.getByRole('textbox',{name:'Maskin i OP30',exact:true}).inputValue(),'Borrmaskin CNC-03');
  await page.getByRole('button',{name:'Beskriv funktioner',exact:true}).click();
  const text=page.locator('textarea');for(let i=0;i<4;i++)await text.nth(i).fill('Borra produkten för att uppnå rätt diameter.');
  await page.getByRole('button',{name:'Föreslå felsätt'}).click();
  assert.equal(await page.locator('.failure-item').count(),12);
  assert.equal(await page.locator('.failure-item textarea').first().inputValue(),'Borrar fel diameter på produkten.');
  await page.locator('.failure-item textarea').first().fill('Eget granskat felsätt');
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportera CSV'}).click()]);
  await download.saveAs('/tmp/pfmea-export.csv');
  const csv=await fs.readFile('/tmp/pfmea-export.csv','utf8');
  assert.ok(csv.includes('Tillverkning av axelhus')&&csv.includes('Borrmaskin CNC-03'));
  const [jsonDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportera projekt'}).click()]);
  await jsonDownload.saveAs('/tmp/pfmea-export.json');
  const project=JSON.parse(await fs.readFile('/tmp/pfmea-export.json','utf8'));
  assert.equal(project.mainProcessName,'Tillverkning av axelhus');assert.equal(project.operationResources.OP30.length,4);
  await page.reload();await page.getByRole('button',{name:'4 Felsätt'}).click();
  assert.equal(await page.locator('.failure-item textarea').first().inputValue(),'Eget granskat felsätt');
  await page.screenshot({path:'/tmp/pfmea-mobile.png',fullPage:true});
  // Older projects retain their characteristics and receive empty new fields.
  await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('pfmea-studio-v1'));delete data.mainProcessName;delete data.operationResources;localStorage.setItem('pfmea-studio-v1',JSON.stringify(data));});
  await page.reload();await page.getByRole('button',{name:'2 Processflöde',exact:true}).click();
  assert.equal(await page.getByLabel('Namn på huvudprocessen').inputValue(),'');
  assert.equal(await page.locator('.assigned-card').count(),4);
  assert.equal(await page.getByRole('button',{name:'Beskriv funktioner',exact:true}).isDisabled(),true);
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.locator('input[type=file]').setInputFiles({name:'underlag.txt',mimeType:'text/plain',buffer:Buffer.from('RITNING\nHåldiameter Ø12 ±0,05 mm\nMaterial stål')});
  await page.getByRole('status').waitFor();assert.equal(await page.locator('.property-row').count(),2);
  assert.deepEqual(errors,[]);
  console.log('PASS: vertical hierarchy, required process name, property drag/drop, all 4M categories, click assignment, duplicate/remove, persistence/migration, mobile/tablet layout, functions, failures, CSV/JSON export, upload; no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
