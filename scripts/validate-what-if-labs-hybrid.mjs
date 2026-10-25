#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {checkHybridAssets} from './what-if-labs-hybrid-preflight.mjs';
const [file,project]=process.argv.slice(2);
if(!file){console.error('Usage: node scripts/validate-what-if-labs-hybrid.mjs manifest.json [project-root]');process.exit(2);}
try{
 const manifest=resolve(file);
 const plan=JSON.parse(await readFile(manifest,'utf8'));
 const report=await checkHybridAssets(plan,resolve(project||dirname(manifest)),{strict:true});
 console.log(JSON.stringify(report,null,2));
 if(!report.ok)process.exitCode=1;
}catch(e){console.error(e.message);process.exitCode=2;}
