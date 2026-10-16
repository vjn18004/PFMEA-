export const operations = Array.from({length:10},(_,i)=>`OP${(i+1)*10}`);
export const operationNames = ['Materialberedning','Svarvning','Borrning','Fräsning','Gradning','Ytbehandling','Rengöring','Montering','Kontroll','Packning'];
export function candidatesFromText(text) {
  const lines = text.split(/\n|;/).map(s=>s.trim()).filter(Boolean);
  const signals = /[Øø⌀±]|\b(?:mm|diameter|tolerans|radie|ytjämnhet|hårdhet|material|gänga|tjocklek|längd|bredd|höjd|vinkel|Ra|Rz|HRC|HV|ISO|DIN)\b|\bM\d|\d\s*°/i;
  return [...new Set(lines.filter(s=>signals.test(s) && s.length > 2))].slice(0,80).map((name,i)=>({id:crypto.randomUUID(),name,op:null,fn:'',failures:[],source:'Underlag'}));
}
export function suggestFailures(fn, characteristic) {
  const clean=fn.trim().replace(/[.!]+$/,'');
  if(!clean) return [];
  const match=clean.match(/^(.+?)\s+för att\s+(.+)$/i);
  const action=match?match[1]:clean;
  const target=match?match[2].replace(/^uppnå\s+/i,'').replace(/\brätt\b/ig,'fel'):characteristic;
  const verbs={borra:'Borrar',svarva:'Svarvar',fräsa:'Fräser',slipa:'Slipar',kapa:'Kapar',montera:'Monterar',rengöra:'Rengör',avgrada:'Avgradar',härda:'Härdar',belägga:'Belägger',kontrollera:'Kontrollerar'};
  const parts=action.match(/^(\S+)\s+(.+)$/);
  const wrong=parts && verbs[parts[1].toLowerCase()] && match ? `${verbs[parts[1].toLowerCase()]} ${/\bfel\b/i.test(target)?target:'fel '+target} på ${parts[2]}.` : `${action} — ${target}${match?'':' uppnås inte'}.`;
  return [...new Set([wrong,`${action} utförs inte; ${characteristic} uppnås inte.`,`${action} utförs ofullständigt; ${characteristic} uppnås endast delvis.`])];
}
export function isReady(items) {return items.length>0 && items.every(x=>x.op && x.fn.trim());}
export function csvExport(items, mainProcessName = '', operationResources = {}, mainProcessFunction = null) {
 const header=['Operation','Produktegenskap','Funktion','Felsätt','Huvudprocess','Människa','Maskin','Material','Metod','Nivå','4M-kategori','Resurs','Funktions-ID'];
 const resourcesFor=op=>['Människa','Maskin','Material','Metod'].map(category=>(operationResources[op]||[]).filter(r=>r.category===category).map(r=>r.description||r.category).join(' | '));
 const rows=[header];
 if(mainProcessFunction)for(const failure of mainProcessFunction.failures.length?mainProcessFunction.failures:[''])rows.push(['','',mainProcessFunction.text,failure,mainProcessName,'','','','','Huvudprocess','','',mainProcessFunction.id]);
 for(const item of items)for(const failure of item.failures.length?item.failures:[''])rows.push([item.op||'',item.name,item.fn,failure,mainProcessName,...resourcesFor(item.op),'Produktegenskap','','',item.id||'']);
 for(const op of operations)for(const resource of operationResources[op]||[])for(const fn of resource.functions||[])for(const failure of fn.failures.length?fn.failures:[''])rows.push([op,'',fn.text,failure,mainProcessName,...resourcesFor(op),'4M',resource.category,resource.description,fn.id]);
 return '\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');
}
