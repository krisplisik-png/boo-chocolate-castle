import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createCounter} from '../server/counter.mjs';
const root=path.resolve(process.env.SERVE_DIST?'dist':'.');
const counter=createCounter(process.env.COUNTER_DB||'data/players.sqlite');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg'};
const idOK=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{16,80}$/.test(id);
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'Origin rejected'});
   if(req.method==='GET'&&url.pathname==='/api/stats')return json(res,200,counter.stats());
   if(req.method!=='POST')return json(res,405,{error:'POST required'});
   let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json(res,413,{error:'Too large'});}
   let body;try{body=JSON.parse(raw);}catch{return json(res,400,{error:'Invalid JSON'});}
   if(!idOK(body.visitorId))return json(res,400,{error:'Invalid visitor ID'});
   if(url.pathname==='/api/visit')return json(res,200,counter.visit(body.visitorId));
   if(url.pathname==='/api/complete'){
    const medals=body.earned;
    if(!idOK(body.runId)||!Array.isArray(medals)||medals.length!==15||new Set(medals).size!==15||!medals.every(k=>/^[0-2]:[0-4]$/.test(k)))return json(res,400,{error:'All 15 medals required'});
    return json(res,200,counter.complete(body.runId,body.visitorId));
   }
   return json(res,404,{error:'Unknown endpoint'});
  }
  const relative=decodeURIComponent(url.pathname);
  if(relative!=='/'&&relative!=='/index.html'&&!relative.startsWith('/src/')&&!relative.startsWith('/public/'))throw Error();
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(file!==path.join(root,'index.html')&&!file.startsWith(path.join(root,'src')+path.sep)&&!file.startsWith(path.join(root,'public')+path.sep))throw Error();
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');
  res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),process.env.HOST||'127.0.0.1',()=>console.log(`http://127.0.0.1:${process.env.PORT||4173}`));
