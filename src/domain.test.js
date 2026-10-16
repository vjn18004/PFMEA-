import {test} from 'node:test';
import assert from 'node:assert/strict';
import {candidatesFromText,suggestFailures,isReady,csvExport,operations} from './domain.js';
test('finds and deduplicates technical requirements without title text',()=>{const found=candidatesFromText('RITNING\nØ12 ±0,05 mm\nMaterial stål\nØ12 ±0,05 mm\nRa 1,6');assert.deepEqual(found.map(x=>x.name),['Ø12 ±0,05 mm','Material stål','Ra 1,6']);assert.ok(found.every(x=>x.op===null&&x.fn===''));});
test('inverts the drilling function into the requested failure',()=>{const failures=suggestFailures('Borra produkten för att uppnå rätt diameter.','Ø12 ±0,05 mm');assert.equal(failures[0],'Borrar fel diameter på produkten.');assert.equal(failures.length,3);assert.match(failures[1],/utförs inte/);assert.match(failures[2],/ofullständigt/);});
test('cannot generate before every characteristic is assigned and described',()=>{assert.equal(isReady([]),false);assert.equal(isReady([{op:'OP10',fn:'  '}]),false);assert.equal(isReady([{op:null,fn:'Borra'}]),false);assert.equal(isReady([{op:'OP30',fn:'Borra produkten'}]),true);assert.equal(operations.length,10);assert.equal(operations.at(-1),'OP100');});
test('exports all failure rows with correct CSV escaping',()=>{const csv=csvExport([{op:'OP30',name:'Diameter "12"',fn:'Borra; produkt',failures:['Fel diameter','Uteblivet hål']}]);assert.match(csv,/"Diameter ""12"""/);assert.equal(csv.split('\r\n').length,3);assert.match(csv,/"Borra; produkt"/);});
test('exports main process and multiple 4M resources for the correct operation',()=>{
 const csv=csvExport([{op:'OP30',name:'Diameter',fn:'Borra',failures:['Fel diameter']}],'Tillverkning av axelhus',{OP30:[{category:'Maskin',description:'CNC-03'},{category:'Maskin',description:'Fixtur "F12"'},{category:'Människa',description:'Operatör'}],OP10:[{category:'Material',description:'Annan operation'}]});
 assert.match(csv,/"Huvudprocess";"Människa";"Maskin";"Material";"Metod"/);
 assert.match(csv,/"Tillverkning av axelhus";"Operatör";"CNC-03 \| Fixtur ""F12""";"";""/);
 assert.ok(!csv.includes('Annan operation'));
});
