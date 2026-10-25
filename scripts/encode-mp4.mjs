#!/usr/bin/env node
// Brew Production — encode sequential PNG frames as H.264/AAC MP4.
import {spawnSync} from 'node:child_process';
import {readdir,stat,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
const argv=process.argv.slice(2);
const opts={};
for(let i=0;i<argv.length;i++){const k=argv[i];if(k==='--require-audio'){opts.requireAudio=true;continue;}if(k==='--help'){console.log('Usage: node scripts/encode-mp4.mjs --frames ./frames --output video.mp4 [--fps 30] [--narration voice.wav] [--music music.mp3] [--sfx effects.wav] [--require-audio]');process.exit(0);}if(!k.startsWith('--')||!argv[i+1])throw Error('Invalid argument: '+k);opts[k.slice(2)]=argv[++i];}
function cmd(exe,args){const r=spawnSync(exe,args,{encoding:'utf8',maxBuffer:8e6});if(r.error||r.status!==0)throw Error(exe+': '+(r.error?.message||r.stderr||'failed'));return r.stdout;}
if(!opts.frames||!opts.output)throw Error('--frames and --output are required');
const fps=Number(opts.fps||30);if(!Number.isInteger(fps)||fps<1||fps>120)throw Error('FPS must be 1-120');
const frames=resolve(opts.frames),output=resolve(opts.output);
const files=(await readdir(frames)).filter(f=>/^f\d{5}\.png$/.test(f)).sort();
if(!files.length)throw Error('No PNG frames f00000.png... found');
for(let i=0;i<files.length;i++)if(files[i]!==`f${String(i).padStart(5,'0')}.png`)throw Error('Missing frame '+i);
const audio=[['narration',opts.narration||opts.audio,1],['music',opts.music,.20],['sfx',opts.sfx,.65]].filter(([,file])=>Boolean(file));
if(opts.requireAudio&&!audio.length)throw Error('Audio requested but no audio files supplied');
for(const [,f] of audio){const s=await stat(resolve(f)).catch(()=>null);if(!s?.isFile()||!s.size)throw Error('Audio file missing or empty: '+f);}
cmd('ffmpeg',['-version']);cmd('ffprobe',['-version']);
await mkdir(dirname(output),{recursive:true});
const duration=files.length/fps;
const args=['-y','-hide_banner','-loglevel','error','-framerate',String(fps),'-start_number','0','-i',join(frames,'f%05d.png')];
audio.forEach(([role,f],i)=>{if(role==='music')args.push('-stream_loop','-1');args.push('-i',resolve(f));});
args.push('-map','0:v:0','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-frames:v',String(files.length),'-movflags','+faststart');
if(audio.length){
 const filters=audio.map(([,,volume],i)=>`[${i+1}:a:0]aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=${volume},apad,atrim=duration=${duration},asetpts=PTS-STARTPTS[a${i}]`);
 filters.push((audio.map((_,i)=>`[a${i}]`).join(''))+`amix=inputs=${audio.length}:duration=longest:dropout_transition=0,alimiter=limit=0.95[outa]`);
 args.push('-filter_complex',filters.join(';'),'-map','[outa]','-c:a','aac','-b:a','192k','-ar','48000');
}else args.push('-an');
args.push('-t',String(duration),output);
cmd('ffmpeg',args);
const info=JSON.parse(cmd('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height','-of','json',output]));
const v=info.streams?.find(s=>s.codec_type==='video'),a=info.streams?.find(s=>s.codec_type==='audio');
if(v?.codec_name!=='h264'||(audio.length&&a?.codec_name!=='aac')||(opts.requireAudio&&!a)||Math.abs(Number(info.format?.duration)-duration)>Math.max(.12,2/fps))throw Error('Output verification failed');
console.log(`VERIFIED: ${output}, H.264 ${v.width}x${v.height}, audio ${a?.codec_name||'none'}, ${duration}s`);
