// Static editorial quality gate; checks intent only, never certifies rendered pixels/audio.
const forbidden=/\b(?:SCENE\s*\d+\s*\/\s*12|CLIP\s*\d+\s*\/\s*3|ENGLISH\s+VOICEOVER|DEBUG\s+MODE)\b/i;
const amateur=/\b(?:children'?s?\s+(?:flash)?cards?|cartoon\s+cards?|flat\s+educational\s+cards?|powerpoint\s+slides?|flashcards?|static\s+slideshow)\b/i;
const robotic=/\b(?:espeak|robotic\s+(?:tts|voice)|offline\s+robot\s+voice)\b/i;
export function auditCinematicPlan(plan){
 const errors=[],warnings=[];
 if(!plan||!Array.isArray(plan.scenes)||plan.scenes.length!==12)return {ok:false,errors:['Cinematic review requires 12 scenes'],warnings};
 if(plan.visual_quality_profile!=='cinematic-3d')errors.push('Set visual_quality_profile to cinematic-3d and plan real 3D depth');
 if(!plan.narration_delivery||plan.narration_delivery!=='natural-conversational')errors.push('Narration delivery must be natural-conversational');
 if(plan.final_voice_engine&&robotic.test(plan.final_voice_engine))errors.push('Robotic/offline test TTS cannot be the final voice');
 const distinct=new Set();
 for(let i=0;i<12;i++){
  const scene=plan.scenes[i]||{};
  const visual=String(scene.visual||'');
  if(forbidden.test(visual)||forbidden.test(String(scene.on_screen_text||'')))errors.push('Scene '+(i+1)+': leaked production text');
  if(amateur.test(visual))errors.push('Scene '+(i+1)+': juvenile/slideshow visual treatment');
  if(!visual.trim())errors.push('Scene '+(i+1)+': no visual action');
  const beat=String(scene.visual_mechanism||'').trim().toLowerCase();
  if(!beat)warnings.push('Scene '+(i+1)+': describe distinct visual mechanism (camera/physical change), not just caption');
  else distinct.add(beat);
  if(!String(scene.camera_rule||'').trim())warnings.push('Scene '+(i+1)+': missing camera direction');
 }
 if(distinct.size<6)warnings.push('Fewer than six distinct visual mechanisms; inspect variety and coherence');
 if(plan.production_overlay_visible===true)errors.push('Production labels may not appear in rendered video');
 if(!plan.visual_qc_required)errors.push('Explicit final rendered video visual QC is required');
 return {ok:errors.length===0,errors,warnings};
}
