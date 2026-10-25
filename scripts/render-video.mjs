#!/usr/bin/env node
// Brew Production — render HTML timeline into verified MP4.
import {createServer} from 'node:http';
import {readFile,stat,mkdtemp,rm,realpath} from 'node:fs/promises';
import {join,resolve,relative,extname,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const argv=process.argv.slice(2),o={};
for(let i=0;i<argv.length;i++){let k=argv[i];if(k==='--require-audio'){o['require-audio']=true;continue;}if(k==='--help'){console.log('node scripts/render-video.mjs --project ./animation --output ./video.mp4 --fps 30 --width 1920 --height 1080 --narration voice.wav --require-audio');process.exit(0);}if(!['--project','--entry','--output','--fps','--width','--height','--duration','--narration','--music','--sfx'].includes(k)||!argv[i+1])throw Error('Invalid argument: '+k);o[k.slice(2)]=argv[++i];}
const root=await realpath(resolve(o.project||'.')),entry=o.entry||'index.html',output=resolve(o.output||join(root,'video.mp4'));
const fps=Number(o.fps||30),width=Number(o.width||1920),height=Number(o.height||1080);
if(!Number.isInteger(fps)||fps<1||fps>120||![width,height].every(n=>Number.isInteger(n)&&n>0&&n%2===0))throw Error('Invalid FPS or output dimensions');
const dest=resolve(root,entry),rel=relative(root,dest);if(rel==='..'||rel.startsWith('..'+sep)||rel.startsWith('/'))throw Error('Entry path outside project');
if(!(await stat(dest).catch(()=>null))?.isFile())throw Error('Missing HTML entry: '+dest);
if(o['require-audio']&&![o.narration,o.music,o.sfx].some(Boolean))throw Error('Audio required but no file was supplied');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try{const name=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';const target=resolve(root,name),relation=relative(root,target);if(relation==='..'||relation.startsWith('..'+sep))throw Error('Outside root');const real=await realpath(target),again=relative(root,real);if(again==='..'||again.startsWith('..'+sep))throw Error('Symlink outside root');const data=await readFile(real);res.writeHead(200,{'Content-Type':types[extname(real)]||'application/octet-stream'});res.end(data);}catch(e){res.writeHead(404);res.end('Not found');}});
function run(file,args,env){return new Promise((resolveRun,reject)=>{const p=spawn(file,args,{stdio:'inherit',env:{...process.env,...env}});p.once('error',reject);p.once('exit',(code)=>code===0?resolveRun():reject(Error(file+' failed with '+code)));});}
const work=await mkdtemp(join(tmpdir(),'brew-render-'));
try{
 await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok)});
 const url=`http://127.0.0.1:${server.address().port}/${rel.split(sep).map(encodeURIComponent).join('/')}?clean=1`;
 const env={URL:url,FPS:String(fps),WIDTH:String(width),HEIGHT:String(height),SCALE:'1',OUT:join(work,'frames')};
 if(o.duration)env.DURATION=String(Number(o.duration));
 await run(process.execPath,[fileURLToPath(new URL('./export-frames.mjs',import.meta.url))],env);
 const params=['--frames',join(work,'frames'),'--output',output,'--fps',String(fps)];
 for(const k of ['narration','music','sfx'])if(o[k])params.push('--'+k,o[k]);
 if(o['require-audio'])params.push('--require-audio');
 await run(process.execPath,[fileURLToPath(new URL('./encode-mp4.mjs',import.meta.url)),...params]);
 console.log('DOWNLOADABLE MP4: '+output);
}finally{
 if(server.listening)await new Promise(ok=>server.close(ok));
 await rm(work,{recursive:true,force:true});
}
