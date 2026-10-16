import {operations,suggestFailures} from './domain.js';
export const emptyFunction=()=>({id:crypto.randomUUID(),text:'',failures:[]});
function normalizeFunction(value){return {id:typeof value?.id==='string'?value.id:crypto.randomUUID(),text:typeof value?.text==='string'?value.text:'',failures:Array.isArray(value?.failures)?value.failures.filter(x=>typeof x==='string'):[]};}
export function normalizeFunctionFields(state){
 return {
  mainProcessFunction:normalizeFunction(state.mainProcessFunction),
  operationResources:Object.fromEntries(operations.map(op=>[op,Array.isArray(state.operationResources?.[op])?state.operationResources[op].filter(x=>x&&typeof x.id==='string'&&['Människa','Maskin','Material','Metod'].includes(x.category)&&typeof x.description==='string').map(x=>({...x,functions:Array.isArray(x.functions)&&x.functions.length?x.functions.map(normalizeFunction):[emptyFunction()]})):[]]))
 };
}
export function analysisTargets(state){
 const targets=[];
 if(state.mainProcessFunction)targets.push({kind:'main',id:state.mainProcessFunction.id,title:state.mainProcessName,level:'Huvudprocess',op:'',text:state.mainProcessFunction.text,failures:state.mainProcessFunction.failures});
 for(const op of operations){
  for(const item of state.items.filter(x=>x.op===op))targets.push({kind:'property',id:item.id,title:item.name,level:'Produktegenskap',op,text:item.fn,failures:item.failures});
  for(const resource of state.operationResources?.[op]||[])for(const fn of resource.functions||[])targets.push({kind:'resource',id:fn.id,resourceId:resource.id,title:resource.description||resource.category,category:resource.category,level:'4M',op,text:fn.text,failures:fn.failures});
 }
 return targets;
}
export function functionsReady(state){
 return !!state.mainProcessName.trim()&&state.items.length>0&&state.items.every(x=>x.op&&x.fn.trim())&&!!state.mainProcessFunction?.text.trim()&&Object.values(state.operationResources||{}).flat().every(r=>r.functions?.length>0&&r.functions.every(f=>f.text.trim()));
}
export function updateFunctionTarget(state,target,patch){
 const withPatch=fn=>({...fn,...patch,...(patch.text!==undefined?{failures:[]}: {})});
 if(target.kind==='main')return {...state,mainProcessFunction:withPatch(state.mainProcessFunction)};
 if(target.kind==='property')return {...state,items:state.items.map(x=>x.id===target.id?{...x,...(patch.text!==undefined?{fn:patch.text,failures:[]}:{}),...(patch.failures!==undefined?{failures:patch.failures}:{})}:x)};
 return {...state,operationResources:{...state.operationResources,[target.op]:(state.operationResources[target.op]||[]).map(r=>r.id===target.resourceId?{...r,functions:r.functions.map(f=>f.id===target.id?withPatch(f):f)}:r)}};
}
export function generateFunctionFailures(state){
 let next=state;
 for(const target of analysisTargets(state))if(!target.failures.length)next=updateFunctionTarget(next,target,{failures:suggestFailures(target.text,target.title)});
 return {...next,step:3};
}
