// Optional local-media readiness check. No API use or paid generation.
import {stat,realpath} from 'node:fs/promises';
import {resolve,relative,sep,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
const videoExt=new Set(['.mp4','.webm','.mov']);
export async function checkHybridAssets(plan,root,{strict=false}={}){
 const errors=[],warnings=[],checked=[];
 const base=await realpath(root);
 const scenes=plan.scenes||[];
 let videoCount=0,motionCount=0;
 for(let i=0;i<scenes.length;i++){
  const s=scenes[i],kind=s.medium;
  if(!kind){(strict?errors:warnings).push('Scene '+(i+1)+': medium not declared (higgsfield or bang-motion)');continue;}
  if(kind==='bang-motion'){motionCount++;if(!s.visual)errors.push('Scene '+(i+1)+': missing motion design');continue;}
  if(kind!=='higgsfield'){errors.push('Scene '+(i+1)+': unsupported medium '+kind);continue;}
  videoCount++;
  if(!s.asset){errors.push('Scene '+(i+1)+': missing footage asset path');continue;}
  const candidate=resolve(base,s.asset),rel=relative(base,candidate);
  if(rel==='..'||rel.startsWith('..'+sep)||rel.startsWith('/')){errors.push('Scene '+(i+1)+': footage path outside project');continue;}
  const st=await stat(candidate).catch(()=>null);
  if(!st?.isFile()||!st.size){errors.push('Scene '+(i+1)+': missing footage '+s.asset);continue;}
  const real=await realpath(candidate);
  const rr=relative(base,real);
  if(rr==='..'||rr.startsWith('..'+sep)){errors.push('Scene '+(i+1)+': symlink outside project');continue;}
  if(!videoExt.has(extname(real).toLowerCase())){errors.push('Scene '+(i+1)+': unsupported footage format');continue;}
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',real],{encoding:'utf8'});
  if(probe.error||probe.status!==0){errors.push('Scene '+(i+1)+': cannot probe video');continue;}
  let data;
  try{data=JSON.parse(probe.stdout);}catch{errors.push('Scene '+(i+1)+': invalid ffprobe output');continue;}
  const duration=Number(data.format?.duration),hasVideo=(data.streams||[]).some(x=>x.codec_type==='video'&&x.width>0&&x.height>0);
  const trim=Number(s.asset_start||0);
  if(!hasVideo||!Number.isFinite(duration)||duration<trim+2.5-.05)errors.push('Scene '+(i+1)+': footage cannot cover selected 2.5-second segment');
  else checked.push({id:s.id,asset:s.asset,duration});
 }
 if(strict&&videoCount===0)warnings.push('No Higgsfield footage selected: all-motion output may be intentional');
 return {ok:errors.length===0,errors,warnings,videoScenes:videoCount,motionScenes:motionCount,checked};
}
