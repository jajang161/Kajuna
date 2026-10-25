import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkHybridAssets} from '../scripts/what-if-labs-hybrid-preflight.mjs';
const build=()=>({scenes:Array.from({length:12},(_,i)=>({id:i+1,medium:'bang-motion',visual:'Scientifically grounded diagram '+i}))});
test('all-motion scenes pass hybrid asset checks with no paid service',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'hybrid-'));
 try{const r=await checkHybridAssets(build(),dir,{strict:true});assert.equal(r.ok,true);assert.equal(r.motionScenes,12);}finally{await rm(dir,{recursive:true,force:true});}
});
test('missing AI footage stops generation',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'hybrid-'));
 try{let p=build();p.scenes[0].medium='higgsfield';p.scenes[0].asset='assets/clip.mp4';let r=await checkHybridAssets(p,dir,{strict:true});assert.equal(r.ok,false);assert.match(r.errors.join(' '),/missing footage/i);}finally{await rm(dir,{recursive:true,force:true});}
});
test('prevent footage path traversal',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'hybrid-'));
 try{let p=build();p.scenes[0].medium='higgsfield';p.scenes[0].asset='../private.mp4';let r=await checkHybridAssets(p,dir,{strict:true});assert.equal(r.ok,false);assert.match(r.errors.join(' '),/outside project/i);}finally{await rm(dir,{recursive:true,force:true});}
});
