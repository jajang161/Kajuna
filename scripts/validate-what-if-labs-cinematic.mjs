#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {auditCinematicPlan} from './what-if-labs-cinematic-qc.mjs';
const file=process.argv[2];
if(!file){console.error('Usage: node scripts/validate-what-if-labs-cinematic.mjs episode.json');process.exit(2);}
try{const plan=JSON.parse(await readFile(file,'utf8'));const report=auditCinematicPlan(plan);console.log(JSON.stringify(report,null,2));if(!report.ok)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=2;}
