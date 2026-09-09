/** Offline release checks: content integrity, local routes, assets, fragments,
 * accessible page structure, and basic client-side behaviour (no browser). */
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(f=>f.isDirectory()?files(path.join(dir,f.name)):path.join(dir,f.name)))).flat();}
const htmlFiles=(await files(dist)).filter(f=>f.endsWith('.html'));
let references=0;
for(const file of htmlFiles){
 const text=await readFile(file,'utf8');
 assert.equal((text.match(/<h1[ >]/g)||[]).length,1,`${file}: exactly one h1`);
 assert(text.includes('lang="en"')&&text.includes('name="viewport"')&&text.includes('Skip to content'),`${file}: page accessibility metadata`);
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,`${file}: duplicate ids`);
 for(const match of text.matchAll(/\b(?:src|href)="([^"]+)"/g)){
  const ref=match[1];
  assert(!/^(javascript|data):/.test(ref),'Unsafe URL');
  if(!ref.startsWith('/')&&!ref.startsWith('#'))continue;
  const [location,fragment]=ref.split('#');
  let target=location?path.join(dist,location):file;
  const info=await stat(target).catch(()=>null);assert(info,`Missing target ${ref} from ${file}`);
  if(info.isDirectory())target=path.join(target,'index.html');
  await stat(target);
  if(fragment){const content=await readFile(target,'utf8');assert(content.includes(`id="${fragment}"`),`Missing fragment ${ref}`);}
  references++;
 }
 for(const match of text.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(match[0]),'Image missing alt');
}
const data=async name=>JSON.parse(await readFile(path.join(root,'content',name+'.json'),'utf8'));
const team=await data('team');
assert.equal(team.length,new Set(team.map(m=>m.name)).size,'Duplicate team names');
for(const m of team){assert(m.name&&m.role&&Array.isArray(m.bio));if(m.image)await stat(path.join(dist,'assets',m.image));}
for(const p of await data('projects')){assert(p.title&&p.category);for(const f of p.images)await stat(path.join(dist,'assets',f));}
for(const p of await data('publications')){assert(p.citation);assert(!p.year||Number.isInteger(p.year));if(p.url)assert(new URL(p.url).protocol==='https:');}
// Tiny DOM stub exercises shipped enhancement code without external packages.
function element(text='') {return {textContent:text,hidden:false,value:'',dataset:{},attrs:{'aria-expanded':'false'},handlers:{},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,fn){this.handlers[k]=fn;},focus(){this.focused=true;}};}
const selectors=Object.fromEntries(['.menu-button','#navigation','#publication-search','#publication-year','.publication-tools','#publication-count','#no-results','#reset-filters'].map(k=>[k,element()]));
const records=[element('Hardy simulation study'),element('Vergis bariatric care')];records[0].dataset.year='2025';records[1].dataset.year='2026';
const document={querySelector:k=>selectors[k],querySelectorAll:()=>records,documentElement:element(),handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}};
vm.runInNewContext(await readFile(path.join(dist,'assets/main.js'),'utf8'),{document});
selectors['.menu-button'].handlers.click();assert.equal(selectors['.menu-button'].attrs['aria-expanded'],'true');
document.handlers.keydown({key:'Escape'});assert.equal(selectors['.menu-button'].attrs['aria-expanded'],'false');
selectors['#publication-search'].value='hardy simulation';selectors['#publication-search'].handlers.input();assert(!records[0].hidden&&records[1].hidden);
selectors['#publication-year'].value='2026';selectors['#publication-year'].handlers.change();assert(records.every(r=>r.hidden));assert(!selectors['#no-results'].hidden);
selectors['#reset-filters'].handlers.click();assert(records.every(r=>!r.hidden));assert(selectors['#no-results'].hidden);
console.log(`PASS: ${htmlFiles.length} HTML pages; ${references} internal references; content schemas; image alt text; menu and publication filter behaviour.`);
