import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {createWorker} from 'tesseract.js';
GlobalWorkerOptions.workerSrc=workerUrl;
async function ocr(input,onProgress){
 const assetRoot=new URL('ocr/',document.baseURI).href;
 const worker=await createWorker('swe+eng',1,{workerPath:assetRoot+'worker.min.js',corePath:assetRoot,langPath:assetRoot,errorHandler:e=>console.error('OCR:',e.message),logger:m=>{if(m.status==='recognizing text') onProgress(`Läser bildtext … ${Math.round(m.progress*100)} %`);}});
 try{return (await worker.recognize(input)).data.text;}finally{await worker.terminate();}
}
export async function readDocument(file,onProgress){
 if(file.size>25*1024*1024) throw new Error('Filen får vara högst 25 MB.');
 if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){
  const pdf=await getDocument({data:await file.arrayBuffer()}).promise;
  try{
   if(pdf.numPages>30) throw new Error('Välj ett underlag med högst 30 sidor.');
   const pages=[];
   for(let i=1;i<=pdf.numPages;i++){
    onProgress(`Läser PDF, sida ${i} av ${pdf.numPages} …`);
    const page=await pdf.getPage(i);const content=await page.getTextContent();
    let text='',lastY=null;
    for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==null&&Math.abs(y-lastY)>3)text+='\n';text+=item.str+' ';lastY=y;if(item.hasEOL)text+='\n';}
    if(text.trim().length<20){const viewport=page.getViewport({scale:1.5});const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;text=await ocr(canvas,onProgress);}
    pages.push(text);
   }return pages.join('\n');
  }finally{await pdf.destroy();}
 }
 if(/^image\/(png|jpeg|webp|bmp)$/.test(file.type)||/\.(png|jpe?g|webp|bmp)$/i.test(file.name))return ocr(file,onProgress);
 if(/\.(txt|csv)$/i.test(file.name)||file.type==='text/plain')return file.text();
 throw new Error('Välj PDF, PNG, JPG, WebP, BMP, TXT eller CSV.');
}
