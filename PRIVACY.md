# Prywatność PerAnonim

PerAnonim przetwarza zawartość dokumentów lokalnie w przeglądarce. Pliki użytkownika nie są wysyłane do serwera aplikacji.

## Tryb offline

Aplikacja nie korzysta podczas pracy z CDN, Google Fonts, analityki ani zewnętrznego API. Biblioteki wymagane do DOCX, XLSX i PDF znajdują się lokalnie w katalogu `vendor/`.

Można uruchomić aplikację bez internetu po pobraniu repozytorium i otworzeniu `index.html`.

## Jak zweryfikować

1. Otwórz narzędzia deweloperskie przeglądarki.
2. Przejdź do zakładki Network/Sieć.
3. Włącz tryb Offline.
4. Otwórz aplikację i przetwórz dokument.
5. W zakładce sieciowej nie powinny pojawić się żadne żądania do internetu po załadowaniu pliku lokalnego.

## Ważne ograniczenie

Prywatność transportu danych można zagwarantować przez brak żądań sieciowych aplikacji. Nie oznacza to automatycznej gwarancji, że każdy element dokumentu zostanie wykryty jako dane osobowe. Przed eksportem aplikacja wymaga ręcznego przeglądu wykryć.

## Weryfikacja repozytorium

Przed publikacją należy sprawdzić, czy kod nie zawiera nowych adresów `http://`, `https://`, `fetch(`, `XMLHttpRequest` lub `sendBeacon`. Wersja produkcyjna powinna być publikowana jako statyczne pliki GitHub Pages.
