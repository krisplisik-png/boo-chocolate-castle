import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});for(const f of ['index.html'])await copyFile(f,`dist/${f}`);for(const d of ['src','public'])await cp(d,`dist/${d}`,{recursive:true});await copyFile('.nojekyll','dist/.nojekyll');console.log('Static build ready: dist/');
