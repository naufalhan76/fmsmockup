const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT || 3000);
const HOST = '127.0.0.1';
const MOCK = path.join(__dirname, 'mock');
const DIST = path.join(__dirname, 'web-dist');
let board = JSON.parse(fs.readFileSync(path.join(MOCK, 'board.json'), 'utf8'));
const history = JSON.parse(fs.readFileSync(path.join(MOCK, 'history.json'), 'utf8'));
const incidents = JSON.parse(fs.readFileSync(path.join(MOCK, 'incidents.json'), 'utf8'));
const overrides = {};
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
function json(res,s,d){res.writeHead(s,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(d));}
function body(req){return new Promise(r=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{r(JSON.parse(b))}catch{r({})}});});}
function stat(res,p){let f=path.join(DIST,p==='/'?'index.html':p);if(!fs.existsSync(f))f=path.join(DIST,'index.html');if(!fs.existsSync(f)){res.writeHead(404);res.end('Not found');return;}const e=path.extname(f);res.writeHead(200,{'Content-Type':MIME[e]||'application/octet-stream'});res.end(fs.readFileSync(f));}
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://l');const p=u.pathname;const m=req.method;
  if(m==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});res.end();return;}
  if(p==='/api/tms/board'&&m==='GET')return json(res,200,{ok:true,rows:board.rows.filter(r=>r.boardStatus!=='closed'),total:board.rows.length,day:board.day});
  if(p==='/api/tms/board/detail'&&m==='GET'){const id=u.searchParams.get('rowId')||'';const row=board.rows.find(r=>r.rowId===id);if(!row)return json(res,404,{ok:false,error:'Not found'});return json(res,200,{ok:true,detail:{...row,incidentHistory:incidents.incidents}});}
  if(p==='/api/unit-history'&&m==='GET')return json(res,200,history);
  if(p.startsWith('/api/tms/overrides/')&&p.endsWith('/audit')&&m==='GET')return json(res,200,{ok:true,audit:[]});
  if(p.startsWith('/api/tms/overrides/')&&m==='POST'){const id=decodeURIComponent(p.split('/')[4]||'');const b=await body(req);overrides[id]={...b,at:new Date().toISOString()};if(b.shippingStatus){const row=board.rows.find(r=>r.jobOrderId===id);if(row&&row.metadata){row.metadata.shippingStatus=b.shippingStatus;if(b.shippingStatus.key==='selesai-pengiriman')row.boardStatus='closed';}}return json(res,200,{ok:true,override:overrides[id]});}
  if(p.startsWith('/api/tms/overrides/')&&m==='DELETE'){const id=decodeURIComponent(p.split('/')[4]||'');delete overrides[id];return json(res,200,{ok:true});}
  if(p==='/api/tms/crew-phone'&&m==='GET')return json(res,200,{ok:true,phone:'081234567890',name:'BUDI SANTOSO'});
  if(p==='/api/config'&&m==='GET')return json(res,200,{ok:true,config:{autoStart:false,pollIntervalMs:60000,accounts:[{id:'demo',label:'Demo'}]}});
  if(p==='/api/status'&&m==='GET')return json(res,200,{ok:true,status:{runtime:{isPolling:true,nextRunAt:Date.now()+60000},accounts:{demo:{units:{}}}}});
  if(p==='/api/web-session'&&m==='GET')return json(res,200,{ok:true,session:{user:{username:'demo',id:'demo'}}});
  if(p==='/api/save-config'&&m==='POST')return json(res,200,{ok:true});
  stat(res,p);
}).listen(PORT,HOST,()=>console.log('GPS Tracker Demo running at http://'+HOST+':'+PORT));
