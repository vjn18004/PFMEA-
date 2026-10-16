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
3. Namnge huvudprocessen i rutan till vänster (obligatoriskt). OP10–OP100 visas vertikalt med hierarkilinjer under huvudprocessen. Dra egenskaper till operationerna, eller klicka på egenskapen och sedan operationens rubrik. Namnen på operationerna är exempel.
4. Dra relevanta 4M-rutor (Människa, Maskin, Material, Metod) från paletten till operationernas högra del. Alternativt välj en kategori med ett klick och klicka på ”Lägg till” i operationen. Varje kategori kan användas flera gånger. Beskriv den konkreta resursen i rutan; rutor kan tas bort individuellt. 4M-tilldelning är valfri. På mindre skärmar visas paletten ovanför operationslistan.
5. Ange huvudprocessens funktion i steg 3. Beskriv också funktionen för varje produktegenskap, till exempel: `Borra produkten för att uppnå rätt diameter.` Varje tilldelad 4M-ruta har egna funktionsfält. Ange minst en funktion per ruta och använd ”Lägg till funktion” för flera. Alla tillagda fält måste vara ifyllda innan felsätt föreslås. Den sista funktionen på en 4M-ruta kan inte tas bort.
6. Granska regelbaserade förslag på felaktig, utebliven och ofullständig funktion för huvudprocessen, produktegenskaperna och varje separat 4M-funktion. För exemplet föreslås `Borrar fel diameter på produkten.` Redigera, radera eller lägg till felsätt.
7. Exportera semikolonseparerad CSV för kalkylblad eller en JSON-kopia av projektet. Huvudprocessens namn, dess funktion och felsätt samt operationernas 4M-resurser med alla funktioner och felsätt ingår i båda exporterna. CSV har separata rader per funktion/felsätt samt kolumner för nivå, kategori, resurs och funktions-ID.

Arbetet sparas automatiskt i samma webbläsares localStorage. Exportera för att behålla en separat kopia. JSON-import, flera projekt, backend, delning och inloggning ingår inte ännu. Äldre projekt behåller produktegenskaper och resurser när de nya funktionsfälten läggs till; de nya fälten börjar tomma och behöver fyllas i. Underlagets råtext och originalfil sparas inte efter omladdning. Ingen automatisk geometrisk tolkning av ritningsvyer eller säker förståelse av GD&T-symboler görs. Prototypen omfattar inte fullständig PFMEA med effekter, orsaker, S/O/D, AP eller åtgärder.

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

Webbläsartestet kontrollerar exempeldata, vertikal hierarki, obligatoriskt huvudprocessnamn, drag-och-släpp av produktegenskaper och alla fyra 4M-kategorier, klickalternativ, upprepade kategorier och borttagning, huvudprocessens och 4M-rutornas obligatoriska funktioner, flera funktioner per ruta, separata felsätt, CSV/JSON-export, lokal lagring, äldre sparade projekt, mobil-/surfplattebredd och textuppladdning. Det sparar tillfälliga skärmbilder och exportfiler under `/tmp`. PDF-text och bild-OCR har dessutom testats med genererade underlag i utvecklingsmiljön.
