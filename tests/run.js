// PerAnonim — testy pipeline'u anonimizacji (Node, bez przegladarki).
// Uruchomienie: node tests/run.js
const fs = require('fs'), path = require('path');
const JSZip = require('../vendor/jszip.min.js');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const cut = script.indexOf("$('#fileInput').addEventListener");
if (cut > 0) script = script.slice(0, cut);

const stubs = `
const mkEl=()=>new Proxy({classList:{add(){},remove(){},toggle(){},contains:()=>false},style:{},dataset:{},value:'',textContent:'',innerHTML:''},{get:(t,k)=>k in t?t[k]:(t[k]=(...a)=>mkEl()),set:(t,k,v)=>{t[k]=v;return true}});
const elStub=mkEl();
const document={querySelector:()=>elStub,querySelectorAll:()=>[],createElement:mkEl,addEventListener(){},activeElement:null,createTreeWalker:()=>({nextNode:()=>false})};
const navigator={};const location={protocol:'http:'};
const window={addEventListener(){}};const performance={now:()=>0};const requestAnimationFrame=()=>{};
const NodeFilter={SHOW_TEXT:4};
const XLSX={};const pdfjsLib={};const URL={createObjectURL:()=>'',revokeObjectURL(){}};
const localStorage={getItem:()=>null,setItem(){},removeItem(){}};
`;
const dict = fs.readFileSync(path.join(root, 'polish-dictionary.js'), 'utf8');

let passed = 0, failed = 0;
const ok = (cond, name) => { if (cond) { passed++; } else { failed++; console.log('FAIL:', name); } };

// minimalny DOCX z PII + pulapkami XML (atrybuty numeryczne, nazwy stylow)
async function makeDocx() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml"/></Types>');
  zip.file('word/document.xml', `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:t>Umowa z dnia 10.03.2026</w:t></w:r></w:p>
<w:p><w:r><w:t>Andrzej Kowalski, tel. 477437509, e-mail: a.kowalski@urzad.gov.pl</w:t></w:r></w:p>
<w:p><w:r><w:t>Podpisano: Kowalskiego. Kontakt: Grzegorz Nowak</w:t></w:r></w:p>
<w:p><w:r><w:t>Adres: ul. Miodowa 12, Warszawa</w:t></w:r></w:p>
<w:p><w:r><w:t>PESEL 92010112350 NIP 5213641211</w:t></w:r></w:p>
<w:p><w:r><w:t>Numer sprawy 012345678 oraz kod 111111111 nie sa telefonami.</w:t></w:r></w:p>
<w:p><w:ins w:author="Kowalski"><w:r><w:t>zmiana</w:t></w:r></w:ins></w:p>
</w:body></w:document>`);
  zip.file('word/numbering.xml', '<?xml version="1.0"?><w:numbering><w:num w:numId="1" w16cid:durableId="2079279205"><w:abstractNumId w:val="29"/></w:num></w:numbering>');
  zip.file('word/styles.xml', '<?xml version="1.0"?><w:styles><w:latentStyles><w:lsdException w:name="List" w:semiHidden="1"/></w:latentStyles></w:styles>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0"?><Relationships><Relationship Id="rId1" Type="hyperlink" Target="mailto:a.kowalski@urzad.gov.pl" TargetMode="External"/></Relationships>');
  zip.file('docProps/core.xml', '<?xml version="1.0"?><cp:coreProperties xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>Kowalski</dc:creator></cp:coreProperties>');
  return zip.generateAsync({ type: 'nodebuffer' });
}

const test = `
;(async()=>{
  const buf = await makeDocx();
  const zip = await JSZip.loadAsync(buf);
  let all='';for(const path of Object.keys(zip.files))if(/\\.(xml|rels)$/.test(path))all+=xmlTextContent(await zip.files[path].async('text'))+'\\n';
  globalThis.__findings=[...scanPii(all),...scanText(all)];
  globalThis.__api={replaceText,activeFindings,state};

  // replacement na wszystkich czesciach
  for(const path of Object.keys(zip.files))if(/\\.(xml|rels)$/.test(path))zip.file(path,xmlReplace(await zip.files[path].async('text'),__findings));
  globalThis.__out={};
  for(const path of Object.keys(zip.files))globalThis.__out[path]=await zip.files[path].async('text');
})();
`;
global.makeDocx = makeDocx;
global.JSZip = JSZip;
const ready = eval(stubs + dict + script + test);

(async () => {
  await ready;
  const findings = globalThis.__findings || [];
  const out = globalThis.__out || {};

  // -- wykrycia --
  const reps = findings.map(f => f.replacement);
  ok(findings.some(f => f.original === 'Kowalski' && f.replacement === 'OSOBA_01'), 'Kowalski -> OSOBA_01');
  ok(findings.some(f => f.original === 'Kowalskiego' && f.replacement === 'OSOBA_01'), 'Kowalskiego grupowane -> OSOBA_01');
  ok(findings.some(f => f.original === 'Nowak'), 'Nowak wykryty');
  ok(findings.some(f => f.original === 'Andrzej' && f.replacement === 'IMIE_01'), 'imie Andrzej -> IMIE_01');
  ok(findings.some(f => /^IMIE_\d+$/.test(f.replacement) && f.original === 'Grzegorz'), 'imie Grzegorz wykryte');
  ok(findings.some(f => f.original === '477437509'), 'telefon wykryty');
  ok(!findings.some(f => f.original === '012345678'), 'numer od 0 -> brak TELEFON');
  ok(!findings.some(f => f.original === '111111111'), 'wszystkie cyfry identyczne -> brak TELEFON');
  // wykluczenie reczne (FP management)
  const ph = findings.find(f => f.original === '477437509');
  ok(!!ph, 'telefon znaleziony do testu wykluczenia');
  if (ph) { ph.excluded = true; __api.state.findings = findings; const kept = __api.replaceText('tel. 477437509', __api.activeFindings()); ok(kept.includes('477437509'), 'wykluczone wykrycie nie jest zamieniane'); ok(__api.replaceText('tel. 477437509', [ph]).includes('TELEFON'), 'po przywroceniu zamieniane'); ph.excluded = false; }
  ok(findings.some(f => f.original === 'a.kowalski@urzad.gov.pl'), 'email wykryty');
  ok(findings.some(f => f.original === '92010112350' && /^PESEL/.test(f.replacement)), 'PESEL wykryty');
  ok(findings.some(f => f.original === '5213641211' && /^NIP/.test(f.replacement)), 'NIP wykryty');
  ok(findings.some(f => /Miodowa/.test(f.original) && /^ADRES/.test(f.replacement)), 'adres wykryty');

  // -- falszywe trafienia --
  ok(!findings.some(f => f.original === '2079279205'), 'durableId NIE jest wykryciem');
  ok(!findings.some(f => f.original === 'List'), 'w:name="List" NIE jest wykryciem');
  ok(!findings.some(f => f.original === 'OSOBA'), 'token zastepczy NIE jest wykryciem');

  // -- integralnosc XML --
  ok(/durableId="2079279205"/.test(out['word/numbering.xml'] || ''), 'durableId nietkniente');
  ok((out['word/styles.xml'] || '').includes('w:name="List"'), 'nazwy stylow nietkniente');
  ok(!(out['word/_rels/document.xml.rels'] || '').includes('kowalski@urzad'), 'mailto w .rels zanonimizowany');
  ok(!(out['word/document.xml'] || '').includes('w:author="Kowalski"'), 'w:author zanonimizowany');
  ok(!(out['docProps/core.xml'] || '').includes('>Kowalski<'), 'dc:creator zanonimizowany');

  // -- wycieki w tresci --
  const docText = out['word/document.xml'] || '';
  ok(!docText.includes('Andrzej Kowalski'), 'imie+nazwisko zniknieto z tresci');
  ok(!docText.includes('477437509'), 'telefon zniknieto');
  ok(!docText.includes('a.kowalski@urzad.gov.pl'), 'email zniknieto');
  ok(!docText.includes('92010112350'), 'PESEL zniknieto');
  ok(docText.includes('IMIE_01') && docText.includes('OSOBA_01'), 'tokeny w tresci');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
