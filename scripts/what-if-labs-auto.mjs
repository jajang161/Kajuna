#!/usr/bin/env node
// Brew Production / What If Labs — automatic EN ElevenLabs narration, SFX, subtitles, and MP4.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';

const args=process.argv.slice(2),cfg={};
for(let i=0;i<args.length;i++){
 const a=args[i];if(['--generate','--with-sfx','--skip-render'].includes(a)){cfg[a.slice(2)]=true;continue;}
 if(!a.startsWith('--')||!args[i+1])throw Error('Bad parameter '+a);
 cfg[a.slice(2)]=args[++i];
}
const input=resolve(cfg.manifest||'what-if-labs.json');
const plan=JSON.parse(await readFile(input,'utf8'));
if(!Array.isArray(plan.scenes)||plan.scenes.length!==12)throw Error('12 scenes required');
for(let i=0;i<12;i++){
 const s=plan.scenes[i],start=i*2.5;
 if(s.id!==i+1||s.clip!==Math.floor(i/4)+1||Math.abs(s.start-start)>0.00001||Math.abs(s.end-start-2.5)>0.00001)throw Error('Invalid scene timing '+(i+1));
 for(const k of ['visual','narration_en','translation_id'])if(typeof s[k]!=='string'||!s[k].trim())throw Error('Scene '+s.id+' lacks '+k);
 if(s.narration_en.length>100)throw Error('Shorten narration for scene '+s.id);
}
const out=resolve(cfg.out||join(dirname(input),'what-if-labs-output'));
await mkdir(out,{recursive:true});
const ss=n=>{let v=Math.round(n*1000);const h=Math.floor(v/3600000);v%=3600000;const m=Math.floor(v/60000);v%=60000;return [h,m,Math.floor(v/1000)].map(x=>String(x).padStart(2,'0')).join(':')+','+String(v%1000).padStart(3,'0')};
const srt=items=>items.map((v,i)=>`${i+1}\n${ss(v.start)} --> ${ss(v.end)}\n${v.text}\n`).join('\n');
await writeFile(join(out,'storyboard.json'),JSON.stringify(plan,null,2));
await writeFile(join(out,'Narration_EN.txt'),plan.scenes.map(s=>`${s.start}–${s.end}: ${s.narration_en}`).join('\n'));
await writeFile(join(out,'Translation_ID.txt'),plan.scenes.map(s=>`${s.start}–${s.end}: ${s.translation_id}`).join('\n'));
await writeFile(join(out,'Subtitles_EN.srt'),srt(plan.scenes.map(s=>({...s,text:s.narration_en}))));
await writeFile(join(out,'Subtitles_ID.srt'),srt(plan.scenes.map(s=>({...s,text:s.translation_id}))));
if(!cfg.generate){console.log('Validated 12 scenes / 30s; no API charges. Drafts: '+out);process.exit(0);}
const key=process.env.ELEVENLABS_API_KEY,voice=cfg.voice||process.env.ELEVENLABS_VOICE_ID;
if(!key)throw Error('Set ELEVENLABS_API_KEY in private environment');
if(!voice||!/^[a-zA-Z0-9]{10,80}$/.test(voice))throw Error('Set a valid ElevenLabs voice ID');
if(cfg['with-sfx']&&cfg['sfx-confirm']!=='yes')throw Error('SFX costs credits: add --sfx-confirm yes');
function cmd(exe,a){const r=spawnSync(exe,a,{encoding:'utf8',maxBuffer:3e6});if(r.error||r.status!==0)throw Error(exe+': '+(r.stderr||r.error?.message||'failed'));return r.stdout;}
cmd('ffmpeg',['-version']);cmd('ffprobe',['-version']);
async function api(url,body,binary=false){
 const r=await fetch(url,{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok)throw Error('ElevenLabs HTTP '+r.status+': '+(await r.text()).slice(0,250));
 return binary?Buffer.from(await r.arrayBuffer()):r.json();
}
const assets=join(out,'audio');await mkdir(assets,{recursive:true});
const voices=[],fx=[],cues=[];
for(let i=0;i<12;i++){
 const s=plan.scenes[i];
 const data=await api('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice)+'/with-timestamps?output_format=mp3_44100_128',{text:s.narration_en,model_id:cfg.model||'eleven_multilingual_v2'});
 if(!data.audio_base64||!data.alignment)throw Error('TTS response without alignment, scene '+s.id);
 const file=join(assets,'voice-'+String(i+1).padStart(2,'0')+'.mp3');
 await writeFile(file,Buffer.from(data.audio_base64,'base64'));
 const align=data.normalized_alignment||data.alignment;
 const ends=align.character_end_times_seconds;
 const end=Math.max(...ends);
 const duration=Number(JSON.parse(cmd('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file])).format.duration);
 if(!Number.isFinite(end)||!Number.isFinite(duration)||Math.max(end,duration)>2.5)throw Error('Voice scene '+s.id+' exceeds 2.5s; shorten and regenerate. Previously generated assets retained.');
 voices.push({file,start:s.start,volume:1});cues.push({start:s.start,end:s.start+end,text:s.narration_en});
 if(cfg['with-sfx']&&s.sfx?.trim()){
  const effect=await api('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',{text:s.sfx,duration_seconds:Math.min(2.5,Math.max(.5,Number(s.sfx_duration)||1.5))},true);
  const name=join(assets,'sfx-'+String(i+1).padStart(2,'0')+'.mp3');
  await writeFile(name,effect);fx.push({file:name,start:s.start,volume:.32});
 }
}
await writeFile(join(out,'Subtitles_EN.srt'),srt(cues));
function mix(tracks,target){
 const input=tracks.flatMap(t=>['-i',t.file]);
 const filter=tracks.map((t,i)=>`[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${t.volume},adelay=${Math.round(t.start*1000)}:all=1,apad,atrim=duration=30[a${i}]`);
 filter.push(tracks.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${tracks.length}:duration=longest:normalize=0,alimiter=limit=0.95[out]`);
 cmd('ffmpeg',['-y','-hide_banner','-loglevel','error',...input,'-filter_complex',filter.join(';'),'-map','[out]','-t','30','-c:a','pcm_s16le',target]);
}
mix(voices,join(out,'Narration_EN.wav'));
if(fx.length)mix(fx,join(out,'SFX.wav'));
if(!cfg['skip-render']){
 const p=['--project',resolve(cfg.project||dirname(input)),'--output',join(out,'WhatIfLabs_Final_EN.mp4'),'--fps','30','--width','1080','--height','1920','--duration','30','--narration',join(out,'Narration_EN.wav'),'--require-audio'];
 if(fx.length)p.push('--sfx',join(out,'SFX.wav'));
 const r=spawnSync(process.execPath,[resolve(new URL('./render-video.mjs',import.meta.url).pathname),...p],{stdio:'inherit'});
 if(r.status!==0)throw Error('MP4 render failed; assets remain in '+out);
}
await writeFile(join(out,'production-report.json'),JSON.stringify({duration:30,clips:3,scenes:12,voice_generated:true,sfx_generated:fx.length,video_generated:!cfg['skip-render']},null,2));
console.log('COMPLETE: '+out);
