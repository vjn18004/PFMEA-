import {mkdir,copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
const require=createRequire(import.meta.url);
const target=new URL('../public/ocr/',import.meta.url);
await mkdir(target,{recursive:true});
const worker=dirname(require.resolve('tesseract.js/package.json'));
await copyFile(join(worker,'dist/worker.min.js'),new URL('worker.min.js',target));
const core=dirname(require.resolve('tesseract.js-core/package.json'));
for(const variant of ['lstm','simd-lstm'])for(const ext of ['wasm','wasm.js'])await copyFile(join(core,`tesseract-core-${variant}.${ext}`),new URL(`tesseract-core-${variant}.${ext}`,target));
for(const lang of ['swe','eng']){const dir=dirname(require.resolve(`@tesseract.js-data/${lang}/package.json`));await copyFile(join(dir,`4.0.0_best_int/${lang}.traineddata.gz`),new URL(`${lang}.traineddata.gz`,target));}
console.log('OCR-motor och svenska/engelska språkfiler förberedda lokalt.');
