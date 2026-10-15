import {COUNTER_API} from './config.js';
let visitorId;
try{visitorId=localStorage.getItem('boo-visitor-id');if(!visitorId){visitorId=crypto.randomUUID();localStorage.setItem('boo-visitor-id',visitorId);}}catch{visitorId=crypto.randomUUID();}
async function post(endpoint,data){
 const response=await fetch(`${COUNTER_API}/api/${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId,...data}),signal:AbortSignal.timeout(7000)});
 if(!response.ok)throw Error('Counter unavailable');
 return response.json();
}
export const registerVisit=()=>post('visit',{});
export const registerCompletion=state=>post('complete',{runId:state.runId,earned:state.earned});
