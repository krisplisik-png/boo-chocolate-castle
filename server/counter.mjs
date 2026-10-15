import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
export function createCounter(filename){
 if(filename!==':memory:')mkdirSync(path.dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);
 db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS visits(id TEXT PRIMARY KEY,created TEXT DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS completions(number INTEGER PRIMARY KEY AUTOINCREMENT,run_id TEXT UNIQUE NOT NULL,visitor_id TEXT NOT NULL,created TEXT DEFAULT CURRENT_TIMESTAMP);`);
 const stats=()=>({visited:db.prepare('SELECT COUNT(*) AS n FROM visits').get().n,completed:db.prepare('SELECT COUNT(*) AS n FROM completions').get().n});
 const visit=id=>{db.prepare('INSERT OR IGNORE INTO visits(id) VALUES(?)').run(id);return stats();};
 const complete=(runId,visitorId)=>{
  db.exec('BEGIN IMMEDIATE');
  try{
   visit(visitorId);
   let row=db.prepare('SELECT number FROM completions WHERE run_id=?').get(runId);
   if(!row){db.prepare('INSERT INTO completions(run_id,visitor_id) VALUES(?,?)').run(runId,visitorId);row=db.prepare('SELECT number FROM completions WHERE run_id=?').get(runId);}
   db.exec('COMMIT');
   return {number:row.number,card:`B1-${String(row.number).padStart(6,'0')}`,...stats()};
  }catch(e){db.exec('ROLLBACK');throw e;}
 };
 return {visit,complete,stats,close:()=>db.close()};
}
