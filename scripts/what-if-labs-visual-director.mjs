// What If Labs — deterministic topic styling and manifest QA. No image/MP4 quality claim.
const styles={
 space:['scientific-scale','physics-simulation','cause-effect-puzzle','cosmic-scale'],
 biology:['anatomy-cutaway','microverse-journey','scientific-scale'],
 technology:['exploded-mechanism','physics-simulation','cause-effect-puzzle'],
 geography:['geographic-infographic','cause-effect-puzzle','scientific-scale'],
 evolution:['evolution-timeline','anatomy-cutaway','scientific-scale'],
 history:['alternate-history','geographic-infographic','cause-effect-puzzle'],
 other:['scientific-scale','cause-effect-puzzle']
};
const keywords={
 space:/space|planet|orbit|star|galax|black hole|cosmic|moon|solar|antariksa|planet|bintang|lubang hitam/i,
 biology:/body|human|biology|anatom|cell|organ|brain|blood|tubuh|manusia|otak|darah/i,
 technology:/technolog|machine|robot|computer|device|future|mesin|teknologi|komputer/i,
 geography:/geograph|climate|disaster|earthquake|volcano|map|region|tsunami|iklim|gempa|gunung|peta/i,
 evolution:/evolution|prehistor|dinosaur|fossil|evolusi|prasejarah|fosil/i,
 history:/history|historic|historis|sejarah|alternate past/i
};
export function detectTopic(text=''){
 const hits=Object.entries(keywords).filter(([,regex])=>regex.test(text)).map(([key])=>key);
 return hits[0]||'other';
}
export function chooseVisualStyles(topic){
 const category=styles[topic] ? topic:detectTopic(topic);
 return {category,primary:styles[category][0],secondary:styles[category][1],options:[...styles[category]]};
}
const allowedShots=new Set(['establishing','explanation','consequence','reveal']);
const allowedTransitions=new Set(['cut','match-cut','object-wipe','diagram-transform','camera-follow','push-through','zoom-to-detail','pullback']);
const words=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const tokens=s=>new Set(words(s).split(' ').filter(w=>w.length>3));
function similarity(a,b){const x=tokens(a),y=tokens(b);if(!x.size||!y.size)return 0;let common=0;for(const t of x)if(y.has(t))common++;return common/Math.min(x.size,y.size);}
export function validateEpisode(plan,{strict=true}={}){
 const errors=[],warnings=[];
 if(!plan||!Array.isArray(plan.scenes)||plan.scenes.length!==12)return {ok:false,errors:['Expected exactly 12 scenes'],warnings};
 const selected=chooseVisualStyles(plan.topic||plan.title||'');
 const sceneStyles=new Set(),transitionCounts=new Map(),cameraRuns=[];
 for(let i=0;i<12;i++){
  const s=plan.scenes[i],start=i*2.5,expectedShot=['establishing','explanation','consequence','reveal'][i%4];
  if(s.id!==i+1||s.clip!==Math.floor(i/4)+1||Math.abs(s.start-start)>1e-4||Math.abs(s.end-start-2.5)>1e-4)errors.push('Scene '+(i+1)+': timing/id/clip mismatch');
  for(const key of ['visual','narration_en','translation_id'])if(typeof s[key]!=='string'||!s[key].trim())errors.push('Scene '+(i+1)+': missing '+key);
  const narration=String(s.narration_en||'').trim();
  if(narration.length>100||narration.split(/\s+/).length>9)errors.push('Scene '+(i+1)+': narration too long for estimated 2.5s; actual TTS timing must also be checked');
  for(const key of ['visual_goal','camera_rule','transition_in','transition_out','shot_type','style','sfx']){
   if(typeof s[key]!=='string'||!s[key].trim())(strict?errors:warnings).push('Scene '+(i+1)+': missing '+key);
  }
  if(s.shot_type&&!allowedShots.has(s.shot_type))errors.push('Scene '+(i+1)+': unknown shot type');
  // Shot purpose is intentionally flexible across episodes; do not enforce a repeated four-shot formula.
  for(const k of ['transition_in','transition_out'])if(s[k]&&!allowedTransitions.has(s[k]))errors.push('Scene '+(i+1)+': invalid '+k);
  if(s.style)sceneStyles.add(s.style);
  if(s.camera_rule)cameraRuns.push(words(s.camera_rule));else cameraRuns.push('');
  if(i>0){
   const prev=plan.scenes[i-1];
   if(words(prev.visual)===words(s.visual)||similarity(prev.visual,s.visual)>=.85)errors.push('Scenes '+i+' and '+(i+1)+': repetitive visual');
   if(prev.transition_out&&s.transition_in&&prev.transition_out!==s.transition_in)errors.push('Scenes '+i+' to '+(i+1)+': transition mismatch');
  }
  if(s.transition_out&&i<11)transitionCounts.set(s.transition_out,(transitionCounts.get(s.transition_out)||0)+1);
  if(i>=2&&cameraRuns[i]&&cameraRuns[i]===cameraRuns[i-1]&&cameraRuns[i]===cameraRuns[i-2])errors.push('Scene '+(i+1)+': same camera action in 3 consecutive scenes');
 }
 if(sceneStyles.size>4)warnings.push('More than four visual families; check coherent art direction');
 for(const style of sceneStyles)if(!selected.options.includes(style))warnings.push('Style '+style+' is outside suggested '+selected.category+' palette; verify suitability');
 for(const [transition,count] of transitionCounts)if(count>5)warnings.push('Transition '+transition+' repeats '+count+' times; verify this is intentional');
 if(plan.ratio&&plan.ratio!=='9:16')errors.push('Ratio must be 9:16');
 if(plan.duration&&plan.duration!==30)errors.push('Duration must be 30 seconds');
 // Lexical overlap is only a weak proxy for semantic narration/visual match.
 for(let i=0;i<12;i++){
  const s=plan.scenes[i];
  if(s.visual_goal&&s.visual&&!similarity(s.visual_goal,s.visual))warnings.push('Scene '+s.id+': review visual_goal and visual meaning manually');
 }
 return {ok:errors.length===0,category:selected.category,recommendedStyles:selected.options,errors,warnings};
}
