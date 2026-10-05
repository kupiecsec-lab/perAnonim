# PerAnonim

Lokalna aplikacja PWA do anonimizacji polskich nazwisk, imion i danych osobowych (PESEL, NIP, REGON, telefon, e-mail, konto bankowe, nr dokumentu, adres, data urodzenia) w plikach DOCX, XLSX, PDF, HTML i TXT. Zeskanowane PDF-y bez warstwy tekstu są odczytywane przez wbudowany, w pełni lokalny OCR (polski model).

## Uruchomienie

Otwórz aplikację:

https://kupiecsec-lab.github.io/perAnonim/

Możesz też pobrać repozytorium i otworzyć `index.html` lokalnie.

## Publikacja GitHub Pages

1. Wejdź do repozytorium `kupiecsec-lab/perAnonim`.
2. Otwórz **Settings**.
3. W menu po lewej wybierz **Pages**.
4. W sekcji **Build and deployment** ustaw **Source: GitHub Actions**.
5. Workflow `Deploy PerAnonim to GitHub Pages` uruchomi się automatycznie po każdym pushu do `main`.
6. Po zakończeniu publikacji otwórz adres `https://kupiecsec-lab.github.io/perAnonim/`.

GitHub może potrzebować kilku minut na pierwsze wdrożenie.

## Prywatność

Dokumenty są analizowane lokalnie w przeglądarce. Biblioteki DOCX/XLSX/PDF i słownik są zapisane w repozytorium, więc aplikacja nie korzysta z CDN ani zewnętrznego API.

Pliki PDF są anonimizowane przez spłaszczenie stron do obrazu z zasłoniętymi nazwiskami — warstwa tekstu, metadane i załączniki nie przechodzą do pliku wynikowego. Skany bez warstwy tekstu przechodzą przez lokalny OCR (tesseract.js + polski model, vendored w repozytorium). W DOCX i XLSX anonimizowane są również metadane (autor, komentarze, osoby, nazwy arkuszy), a miniatury dokumentów są usuwane.

Szczegóły i procedura sprawdzenia trybu offline znajdują się w [PRIVACY.md](PRIVACY.md).

## Obsługa

1. Dodaj plik przez przeciągnięcie lub przycisk wyboru — możesz wrzucić **kilka plików naraz** (wyniki lądują w jednym ZIP ze wspólną mapą zamienników).
2. Sprawdź listę wykrytych nazwisk i danych osobowych — każdy wiersz można **wykluczyć przyciskiem ×**, jeśli to fałszywe trafienie.
3. W razie potrzeby wpisz własne nazwiska albo wczytaj załącznik słownika TXT, PDF lub DOCX.
4. Obejrzyj **podgląd** tekstu po zamianach (opcjonalnie).
5. Zaznacz potwierdzenie ręcznego przeglądu.
6. Pobierz zanonimizowaną kopię oraz — opcjonalnie — raport TXT z listą wykonanych zamian i **mapę zamienników JSON** (pozwala odwrócić anonimizację).

Odmiany tego samego nazwiska (np. „Kowalski", „Kowalskiego") otrzymują wspólny zamiennik. Imiona stojące obok wykrytych nazwisk są maskowane tokenem `IMIE_XX` o numerze zgodnym z nazwiskiem (`IMIE_01 OSOBA_01` to ta sama osoba).

Własny słownik jest zapisywany lokalnie w przeglądarce. Stary binarny format `.doc` należy wcześniej zapisać jako `.docx` lub `.txt`.

Aplikacja jest PWA i po pierwszym wejściu przez HTTPS może działać offline dzięki Service Workerowi.

## Testy

`node tests/run.js` — testy pipeline'u (detekcja PII, grupowanie odmian, integralność XML, wycieki). Uruchamiane automatycznie w GitHub Actions przy każdym pushu.
