import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCinematicPlan} from '../scripts/what-if-labs-cinematic-qc.mjs';
const plan=()=>({visual_quality_profile:'cinematic-3d',narration_delivery:'natural-conversational',final_voice_engine:'neural-voice',visual_qc_required:true,production_overlay_visible:false,scenes:Array.from({length:12},(_,i)=>({visual:'Detailed 3D scene changes perspective '+i,visual_mechanism:'unique camera movement '+i,camera_rule:'tracking camera '+i,on_screen_text:''}))});
test('cinematic 3D example passes static preflight',()=>assert.equal(auditCinematicPlan(plan()).ok,true));
test('production overlays are rejected',()=>{const p=plan();p.scenes[0].on_screen_text='SCENE 1/12';assert.equal(auditCinematicPlan(p).ok,false)});
test('childlike flashcard treatment is rejected',()=>{const p=plan();p.scenes[2].visual='Flat educational cards of planets';assert.equal(auditCinematicPlan(p).ok,false)});
test('robotic demo voice cannot be final',()=>{const p=plan();p.final_voice_engine='espeak';assert.equal(auditCinematicPlan(p).ok,false)});
test('missing final visual review blocks',()=>{const p=plan();p.visual_qc_required=false;assert.equal(auditCinematicPlan(p).ok,false)});
