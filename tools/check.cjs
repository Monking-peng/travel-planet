const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),files=[];
function scan(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.local','test-results','.git'].includes(f.name))continue;const p=path.join(dir,f.name);if(f.isDirectory())scan(p);else if(/\.(cjs|mjs|js)$/.test(f.name))files.push(p);}}
scan(root);for(const f of files){const result=cp.spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(result.status){process.stderr.write(result.stderr);process.exit(1);}}
console.log(`Syntax checked ${files.length} JavaScript files.`);
