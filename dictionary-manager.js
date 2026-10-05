(() => {
  const container = $('#customNames').parentElement.parentElement;
  const style = document.createElement('style');
  style.textContent = '.dictionary-manager{margin-top:12px}.dictionary-toggle{background:transparent;color:var(--green-dark);font-size:10px;padding:0;text-decoration:underline}.dictionary-backdrop{position:fixed;inset:0;background:rgba(23,35,31,.3);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:.2s;z-index:20}.dictionary-backdrop.open{opacity:1;pointer-events:auto}.dictionary-box{display:none}.dictionary-box.open{display:flex;position:fixed;z-index:21;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:min(680px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 32px));flex-direction:column;border:1px solid rgba(255,255,255,.95);border-radius:16px;background:var(--paper);box-shadow:0 30px 90px rgba(23,35,31,.25);padding:22px}.dictionary-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.dictionary-dialog-title{font-size:16px;font-weight:800;color:var(--ink)}.dictionary-dialog-close{width:30px;height:30px;border:0;border-radius:50%;background:#e8f1eb;color:var(--green-dark);font-size:20px}.dictionary-dialog-close:hover{background:var(--mint)}.dictionary-tools{display:flex;gap:8px;margin-bottom:8px}.dictionary-search{min-width:0;flex:1;border:1px solid var(--line);border-radius:7px;padding:10px;font-size:12px}.dictionary-download{background:var(--mint);color:var(--green-dark);border-radius:7px;padding:0 12px;font-size:11px;font-weight:700}.dictionary-count{color:var(--muted);font:10px Consolas,monospace;margin-bottom:9px}.dictionary-list{min-height:80px;max-height:390px;overflow:auto;display:flex;align-content:flex-start;flex-wrap:wrap;gap:6px;padding:3px}.dictionary-item{display:inline-flex;align-items:center;gap:4px;background:#f0f6f1;border-radius:6px;padding:6px 8px;color:#3d5b4d;font-size:11px}.dictionary-remove{border:0;background:transparent;color:#8a9b92;padding:0;font-size:14px;line-height:1}.dictionary-remove:hover{color:#b84d42}.dictionary-empty{color:var(--muted);font-size:11px;padding:10px 0}@media(max-width:600px){.dictionary-box.open{padding:16px;width:calc(100vw - 20px);max-height:calc(100vh - 20px)}.dictionary-tools{flex-direction:column}.dictionary-download{height:34px}.dictionary-list{max-height:none;flex:1}}';
  document.head.appendChild(style);
  const manager = document.createElement('div');
  manager.className = 'dictionary-manager';
  manager.innerHTML = '<button type="button" class="dictionary-toggle">Zarządzaj zapisanym słownikiem</button><div class="dictionary-backdrop"></div><div class="dictionary-box" role="dialog" aria-modal="true" aria-label="Zarządzanie słownikiem"><div class="dictionary-dialog-head"><div class="dictionary-dialog-title">Zapisany słownik</div><button type="button" class="dictionary-dialog-close" aria-label="Zamknij słownik">×</button></div><div class="dictionary-tools"><input class="dictionary-search" placeholder="Szukaj nazwiska"><button type="button" class="dictionary-download">Eksportuj TXT</button></div><div class="dictionary-count"></div><div class="dictionary-list"></div></div>';
  container.appendChild(manager);
  const toggle = manager.querySelector('.dictionary-toggle');
  const box = manager.querySelector('.dictionary-box');
  const backdrop = manager.querySelector('.dictionary-backdrop');
  const close = manager.querySelector('.dictionary-dialog-close');
  const search = manager.querySelector('.dictionary-search');
  const list = manager.querySelector('.dictionary-list');
  const count = manager.querySelector('.dictionary-count');
  const download = manager.querySelector('.dictionary-download');
  const cleanInput = () => { $('#customNames').value = ''; };
  const render = () => {
    cleanInput();
    const query = search.value.trim().toLocaleLowerCase();
    const matches = readStoredCustom().filter(name => name.toLocaleLowerCase().includes(query));
    const names = matches.slice(0, 100);
    count.textContent = matches.length > names.length ? `Pokazano ${names.length} z ${matches.length} pasujących` : `${matches.length} pasujących`;
    list.innerHTML = '';
    if (!names.length) { list.innerHTML = '<div class="dictionary-empty">Brak pasujących nazwisk.</div>'; return; }
    names.forEach(name => {
      const item = document.createElement('span');
      item.className = 'dictionary-item';
      item.textContent = name;
      const remove = document.createElement('button');
      remove.className = 'dictionary-remove';
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Usuń ${name}`);
      remove.addEventListener('click', () => {
        saveStoredCustom(readStoredCustom().filter(value => value !== name));
        render();
        if (state.file) analyze();
      });
      item.appendChild(remove);
      list.appendChild(item);
    });
  };
  const setOpen = open => { box.classList.toggle('open', open); backdrop.classList.toggle('open', open); if (open) { render(); search.focus(); } };
  toggle.addEventListener('click', () => setOpen(!box.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  search.addEventListener('input', render);
  $('#customApply').addEventListener('click', () => setTimeout(render, 0));
  document.querySelector('input[type="file"][hidden]')?.addEventListener('change', () => setTimeout(render, 0));
  download.addEventListener('click', () => {
    const names = readStoredCustom();
    if (!names.length) { showToast('Słownik jest pusty.'); return; }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([names.join('\n')], {type:'text/plain;charset=utf-8'}));
    link.download = 'peranonim-wlasny-slownik.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  });
  render();
})();
