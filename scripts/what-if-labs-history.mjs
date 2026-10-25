#!/usr/bin/env node
// Register completed episodes for future originality checks. Commit the history file to GitHub.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {episodeFingerprint,auditOriginality} from './what-if-labs-originality.mjs';
const [action,file,historyPath='data/what-if-labs-episodes.json']=process.argv.slice(2);
if(!['check','register'].includes(action)||!file){
 console.error('Usage: node scripts/what-if-labs-history.mjs check|register <episode.json> [history.json]');process.exit(2);
}
try {
 const plan=JSON.parse(await readFile(resolve(file),'utf8'));
 const history=JSON.parse(await readFile(resolve(historyPath),'utf8'));
 const report=auditOriginality(plan,history);
 console.log(JSON.stringify({ok:report.ok,errors:report.errors,warnings:report.warnings,comparisons:report.comparisons},null,2));
 if(!report.ok){process.exitCode=1;}
 else if(action==='register'){
  if(!['approved','published'].includes(plan.publication_status))throw Error('Set publication_status to approved or published after human review');
  history.push(episodeFingerprint(plan));
  await writeFile(resolve(historyPath),JSON.stringify(history,null,2)+'\n');
  console.log('Recorded. Commit the updated history file so the next agent session can see it.');
 }
}catch(e){console.error(e.message);process.exitCode=2;}
