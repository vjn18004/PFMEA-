# PFMEA Studio

Svensk prototyp för att gå från produktunderlag till möjliga processfelsätt.

## Starta

Kräver Node.js 22.12+ (testad med Node 24) och npm.

```sh
npm ci
npm run dev
```

Öppna Vite-adressen som terminalen visar. `npm ci` förbereder lokal OCR-motor och svenska/engelska språkfiler. Dokumenten bearbetas i webbläsaren. Under installationen behövs npm-registret; dokumenttolkningen behöver ingen API-nyckel. Gränssnittet använder lokala systemtypsnitt och en marinblå/vit profil med stålblå detaljer, inspirerad av CV Quality Engineering.

## Arbetsflöde

1. Ladda upp PDF (högst 30 sidor), bild (PNG/JPG/WebP/BMP) eller TXT/CSV. Maximal filstorlek är 25 MB. PDF-text läses direkt; sidor utan användbar text och bilder OCR-tolkas.
2. Granska egenskaperna. Identifieringen bygger på tekniska nyckelord, enheter och symboler och kan missa eller feltolka krav. Komplettera manuellt vid behov. Flera underlag lägger till egenskaper i samma projekt.
3. Dra egenskaper till OP10–OP100. Alternativt klicka på egenskapen och sedan operationens rubrik. Namnen på operationerna är exempel.
4. Beskriv funktionen för varje egenskap, till exempel: `Borra produkten för att uppnå rätt diameter.`
5. Granska regelbaserade förslag på felaktig, utebliven och ofullständig funktion. För exemplet föreslås `Borrar fel diameter på produkten.` Redigera, radera eller lägg till felsätt.
6. Exportera semikolonseparerad CSV för kalkylblad eller en JSON-kopia av projektet.

Arbetet sparas automatiskt i samma webbläsares localStorage. Exportera för att behålla en separat kopia. JSON-import, flera projekt, backend, delning och inloggning ingår inte ännu. Underlagets råtext och originalfil sparas inte efter omladdning. Ingen automatisk geometrisk tolkning av ritningsvyer eller säker förståelse av GD&T-symboler görs. Prototypen omfattar inte fullständig PFMEA med effekter, orsaker, S/O/D, AP eller åtgärder.

## Verifiera

```sh
npm test
npm run build
```

Webbläsartest körs med utvecklingsservern igång:

```sh
npx playwright install chromium
npm run test:ui
# För redan installerad Chromium i molnmiljön:
CHROMIUM_PATH=/usr/bin/chromium npm run test:ui
```

Webbläsartestet kontrollerar exempeldata, tilldelning, funktioner, felsätt, redigering, CSV-export, lokal lagring, mobilbredd och textuppladdning. Det sparar tillfälliga skärmbilder och exportfiler under `/tmp`. PDF-text och bild-OCR har dessutom testats med genererade underlag i utvecklingsmiljön.
