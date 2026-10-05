# PerAnonim

Lokalna aplikacja PWA do anonimizacji polskich nazwisk w plikach DOCX, XLSX, PDF, HTML i TXT.

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

Pliki PDF są anonimizowane przez spłaszczenie stron do obrazu z zasłoniętymi nazwiskami — warstwa tekstu, metadane i załączniki nie przechodzą do pliku wynikowego.

Szczegóły i procedura sprawdzenia trybu offline znajdują się w [PRIVACY.md](PRIVACY.md).

## Obsługa

1. Dodaj plik przez przeciągnięcie lub przycisk wyboru.
2. Sprawdź listę wykrytych nazwisk.
3. W razie potrzeby wpisz własne nazwiska albo wczytaj załącznik słownika TXT, PDF lub DOCX.
4. Zaznacz potwierdzenie ręcznego przeglądu.
5. Pobierz zanonimizowaną kopię.

Własny słownik jest zapisywany lokalnie w przeglądarce. Stary binarny format `.doc` należy wcześniej zapisać jako `.docx` lub `.txt`.

Aplikacja jest PWA i po pierwszym wejściu przez HTTPS może działać offline dzięki Service Workerowi.
