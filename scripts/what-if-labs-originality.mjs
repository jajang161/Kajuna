// Deterministic originality preflight: an aid to editorial review, NOT monetization certification.
import {createHash} from 'node:crypto';
const normalize=x=>String(x||'').toLocaleLowerCase('en').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const ignore=new Set(['what','would','happen','with','from','that','this','when','then','if','could','the','into','your','about','were','jadi','jika','akan','dengan','yang']);
const terms=s=>new Set(normalize(s).split(' ').filter(x=>x.length>2&&!ignore.has(x)));
const overlap=(a,b)=>{const A=terms(a),B=terms(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size);};
const textFields=(p)=>({
 title:p.title||'',
 hook:p.hook||p.scenes?.[0]?.narration_en||'',
 narration:(p.scenes||[]).map(s=>s.narration_en).join(' '),
 visuals:(p.scenes||[]).map(s=>s.visual).join(' '),
 transitions:(p.scenes||[]).map(s=>s.transition_out||'').join('|'),
 cameras:(p.scenes||[]).map(s=>s.camera_rule||'').join('|')
});
export function episodeFingerprint(plan){
 const f=textFields(plan);
 return {id:plan.episode_id||createHash('sha256').update(f.title+'|'+f.narration).digest('hex').slice(0,12),
 title:f.title,topic:plan.topic||'',category:plan.category||'',story_approach:plan.story_approach||'',
 hook:f.hook,learning_objective:plan.learning_objective||'', scientific_sources:plan.scientific_sources||[],
 narration:f.narration,visuals:f.visuals,transitions:f.transitions,cameras:f.cameras,
 publication_status:plan.publication_status||'planned',published_at:plan.published_at||null};
}
export function auditOriginality(plan,history=[]){
 const errors=[],warnings=[],comparisons=[];
 if(!plan||!Array.isArray(plan.scenes)||plan.scenes.length!==12)return {ok:false,errors:['Exactly twelve scenes required'],warnings,comparisons};
 if(!Array.isArray(history))return {ok:false,errors:['Episode history must be an array'],warnings,comparisons};
 const needs=['title','topic','story_approach','learning_objective'];
 for(const f of needs)if(!String(plan[f]||'').trim())errors.push('Missing editorial field: '+f);
 if(!Array.isArray(plan.scientific_sources)||!plan.scientific_sources.length)errors.push('Scientific source references required; verify each manually');
 if(!plan.hypothesis_label)warnings.push('Explicitly distinguish hypothetical assumptions from established findings');
 if(!plan.youtube_ai_disclosure_reviewed)errors.push('AI alteration disclosure decision must be reviewed before production');
 if(!plan.rights_reviewed)errors.push('Asset and music usage rights must be reviewed before production');
 const fingerprint=episodeFingerprint(plan);
 for(const old of history){
  if(!old||typeof old!=='object')continue;
  const ot=old.title||'',on=old.narration||'',ov=old.visuals||'';
  const title=overlap(fingerprint.title,ot),narration=overlap(fingerprint.narration,on),visuals=overlap(fingerprint.visuals,ov);
  const sameHook=normalize(fingerprint.hook)===normalize(old.hook)&&normalize(fingerprint.hook).length>12;
  const sameApproach=normalize(fingerprint.story_approach)===normalize(old.story_approach);
  const sameCategory=normalize(fingerprint.category)===normalize(old.category);
  const identicalNarration=normalize(fingerprint.narration)===normalize(on)&&normalize(on).length>40;
  comparisons.push({episode_id:old.id||'',title_similarity:title,narration_similarity:narration,visual_similarity:visuals});
  if(fingerprint.id===old.id||identicalNarration||(title>=.85&&narration>=.72))errors.push('Near-duplicate concept/narration relative to episode '+(old.id||ot));
  else if(title>=.70||narration>=.65||visuals>=.75||sameHook)warnings.push('Review similarity to '+(old.id||ot)+' (topic/storyboard/hook); rewrite substantive content if needed');
  if(sameApproach&&sameCategory)warnings.push('Same story approach and category as '+(old.id||ot)+'; ensure new teaching value');
 }
 const shots=plan.scenes.map(s=>s.shot_type||'');
 const repeating=shots.every((s,i)=>s===['establishing','explanation','consequence','reveal'][i%4]);
 if(repeating)warnings.push('Fixed four-shot formula repeated in every clip: vary scene purposes when useful');
 const transitions=plan.scenes.map(s=>s.transition_out).filter(Boolean);
 if(new Set(transitions).size<=2)warnings.push('Transitions may look templated; vary only when narrative warrants it');
 if(!plan.production_rationale)warnings.push('Explain why each AI footage shot adds value beyond procedural animation');
 return {ok:errors.length===0,errors,warnings,comparisons,fingerprint};
}
