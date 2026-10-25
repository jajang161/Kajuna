#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {validateEpisode,chooseVisualStyles} from './what-if-labs-visual-director.mjs';
const args=process.argv.slice(2);
const file=args[0];
if(!file){console.error('Usage: node scripts/validate-what-if-labs-plan.mjs path/to/manifest.json');process.exit(2);}
try {
 const plan=JSON.parse(await readFile(file,'utf8'));
 const result=validateEpisode(plan);
 console.log(JSON.stringify(result,null,2));
 if(!result.ok)process.exitCode=1;
} catch(e){console.error(e.message);process.exitCode=2;}
