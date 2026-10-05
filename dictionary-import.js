(() => {
  const tokenPattern = /(?:[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+|[A-ZĄĆĘŁŃÓŚŹŻ]{2,})(?:-(?:[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+|[A-ZĄĆĘŁŃÓŚŹŻ]{2,}))?/g;
  const ignored = new Set('pulpit osoby lista listy nazwisk nazwisko nazwiska słownik osoba osoby imię imiona pan pani autor klient wykonawca firma umowa data adres telefon email'.split(' '));
  const extractNames = text => {
    const names = [];
    for (const rawLine of text.replace(/\r/g, '').split(/[\n,;|]+/)) {
      const line = rawLine.replace(/^\s*[-*•\d.)]+\s*/, '').replace(/^[^:]{0,30}:\s*/, '').trim();
      if (!line) continue;
      const words = line.match(tokenPattern) || [];
      if (!words.length) continue;
      if (words.length === 2 && isFirstName(words[0])) names.push(words[1]);
      else if (words.length === 2 && isFirstName(words[1])) names.push(words[0]);
      else if (words.length === 1) names.push(words[0]);
      else words.forEach(word => { if (!isFirstName(word)) names.push(word); });
    }
    return [...new Set(names.filter(name => name.length > 2 && !ignored.has(name.toLocaleLowerCase())))];
  };
  const readAttachment = async file => {
    const type = file.name.split('.').pop().toLowerCase();
    if (type === 'txt') return file.text();
    if (type === 'doc') throw new Error('DOC');
    if (type === 'docx') {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      let xml = '';
      for (const path of Object.keys(zip.files)) {
        if (/word\/(document|header|footer|footnotes|endnotes|comments)\d*\.xml$/.test(path)) xml += await zip.files[path].async('text') + '\n';
      }
      return xml.replace(/<w:p[ >]/g, '\n<w:p ').replace(/<[^>]+>/g, ' ');
    }
    if (type === 'pdf') {
      const pdf = await pdfjsLib.getDocument({data: await file.arrayBuffer()}).promise;
      let text = '';
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join('\n') + '\n';
      }
      return text;
    }
    throw new Error('FORMAT');
  };
  const input = document.querySelector('input[type="file"][hidden]');
  if (!input) return;
  input.addEventListener('change', async event => {
    event.stopImmediatePropagation();
    const file = event.target.files[0];
    if (!file) return;
    try {
      const names = extractNames(await readAttachment(file));
      if (!names.length) throw new Error('EMPTY');
      saveStoredCustom([...readStoredCustom(), ...names]);
      refreshCustomDictionary();
      if (state.file) analyze();
      showToast(`Dodano ${names.length} nazwisk ze słownika.`);
    } catch (error) {
      showToast(error.message === 'DOC' ? 'Format .doc nie jest obsługiwany. Zapisz plik jako .docx lub .txt.' : 'Nie udało się odczytać nazwisk z załącznika.');
    } finally {
      input.value = '';
    }
  }, true);
})();
