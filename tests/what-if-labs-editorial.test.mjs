import test from 'node:test';
import assert from 'node:assert/strict';
import {auditOriginality,episodeFingerprint} from '../scripts/what-if-labs-originality.mjs';
import {validateEpisode} from '../scripts/what-if-labs-visual-director.mjs';
const base={
 title:'What If Earth Had Two Moons?',topic:'space',category:'space',story_approach:'causal orbit demonstration',
 learning_objective:'Understand forces from an additional orbiting body',
 scientific_sources:['https://science.nasa.gov/moon/'],hypothesis_label:true,
 youtube_ai_disclosure_reviewed:true,rights_reviewed:true,
 scenes:Array.from({length:12},(_,i)=>({
  id:i+1,clip:Math.floor(i/4)+1,start:i*2.5,end:(i+1)*2.5,
  visual:'Distinct diagram '+(i+1)+' explains orbital motion for case '+i,
  visual_goal:'Explain an orbital difference at stage '+i,
  narration_en:'A different orbit changes the forces',
  translation_id:'Orbit berbeda mengubah gaya',
  sfx:'soft click',shot_type:['reveal','establishing','explanation','consequence'][i%4],
  style:'scientific-scale',camera_rule:'camera angle '+i,
  transition_in:'cut',transition_out:'cut'
 }))
};
test('unique original concept passes history check',()=>{
 const r=auditOriginality(base,[]);
 assert.equal(r.ok,true);
 assert.equal(r.fingerprint.title,base.title);
});
test('previously approved identical narration blocks',()=>{
 const old=episodeFingerprint(base);
 const r=auditOriginality({...base,episode_id:'different-id'},[old]);
 assert.equal(r.ok,false);
 assert.match(r.errors.join(' '),/duplicate/i);
});
test('missing disclosure review blocks production',()=>{
 const r=auditOriginality({...base,youtube_ai_disclosure_reviewed:false},[]);
 assert.equal(r.ok,false);
});
test('shot order is flexible and not hardcoded',()=>{
 const r=validateEpisode(base);
 assert.equal(r.errors.some(e=>e.includes('expected')&&e.includes('shot')),false);
});
