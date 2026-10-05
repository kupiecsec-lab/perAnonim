(() => {
  const container = $('#customNames').parentElement.parentElement;
  const style = document.createElement('style');
  style.textContent = '.dictionary-manager{margin-top:12px}.dictionary-toggle{background:transparent;color:var(--green-dark);font-size:10px;padding:0;text-decoration:underline}.dictionary-box{display:none;margin-top:10px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:10px}.dictionary-box.open{display:block}.dictionary-tools{display:flex;gap:6px;margin-bottom:8px}.dictionary-search{min-width:0;flex:1;border:1px solid var(--line);border-radius:6px;padding:8px;font-size:11px}.dictionary-download{background:var(--mint);color:var(--green-dark);border-radius:6px;padding:0 9px;font-size:10px;font-weight:700}.dictionary-count{color:var(--muted);font:10px Consolas,monospace;margin-bottom:7px}.dictionary-list{max-height:190px;overflow:auto;display:flex;flex-wrap:wrap;gap:5px}.dictionary-item{display:inline-flex;align-items:center;gap:4px;background:#f0f6f1;border-radius:5px;padding:5px 7px;color:#3d5b4d;font-size:10px}.dictionary-remove{border:0;background:transparent;color:#8a9b92;padding:0;font-size:14px;line-height:1}.dictionary-remove:hover{color:#b84d42}.dictionary-empty{color:var(--muted);font-size:10px;padding:6px 0}';
  document.head.appendChild(style);
  const manager = document.createElement('div');
  manager.className = 'dictionary-manager';
  manager.innerHTML = '<button type="button" class="dictionary-toggle">Zarządzaj zapisanym słownikiem</button><div class="dictionary-box"><div class="dictionary-tools"><input class="dictionary-search" placeholder="Szukaj nazwiska"><button type="button" class="dictionary-download">Eksportuj TXT</button></div><div class="dictionary-count"></div><div class="dictionary-list"></div></div>';
  container.appendChild(manager);
  const toggle = manager.querySelector('.dictionary-toggle');
  const box = manager.querySelector('.dictionary-box');
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
  toggle.addEventListener('click', () => { box.classList.toggle('open'); if (box.classList.contains('open')) render(); });
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
