-- Ez az SQL adatbázis a projekt fejlesztése és tesztelése során volt használatban, de a végső rendszer a Retool API-n keresztül kommunikál az adatbázissal.

-- Csak dokumentáció / referencia célból van itt.

-- 1. RAKTÁR TÁBLA
CREATE TABLE raktar (
    id SERIAL PRIMARY KEY,
    alkatresz_nev TEXT NOT NULL,
    darabszam INTEGER NOT NULL DEFAULT 0,
    kritikus_szint INTEGER NOT NULL DEFAULT 0
);

-- 2. JAVÍTÁSOK TÁBLA
CREATE TABLE javitasok (
    id SERIAL PRIMARY KEY,
    ugyfel_nev TEXT NOT NULL,
    eszkoz_tipus TEXT NOT NULL,
    hiba_leiras TEXT,
    statusz TEXT NOT NULL CHECK (statusz IN ('Alkatrészre vár', 'Folyamatban', 'Kész', 'Átvéve')),
    felhasznalt_alkatresz_id INTEGER REFERENCES raktar(id) ON DELETE SET NULL,
    letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. FÁZIS: BACKEND API & SQL LEKÉRDEZÉSEK
-- ==========================================

-- 1. get_all_repairs: Az összes szervizmunka lekérése a legfrissebbtől kezdve
SELECT * FROM javitasok 
ORDER BY letrehozva DESC;

-- 2. filter_repairs: Keresés ügyfélnévre/eszközre és státuszra (példa paraméterekkel)
SELECT * FROM javitasok 
WHERE (ugyfel_nev ILIKE '%Péter%' OR eszkoz_tipus ILIKE '%PC%')
  AND (statusz = 'Folyamatban')
ORDER BY letrehozva DESC;

-- 3. update_repair_status: Egy adott javítás státuszának módosítása ID alapján
UPDATE javitasok 
SET statusz = 'Kész' 
WHERE id = 1;

-- 4. get_inventory: A teljes raktárkészlet lekérése
SELECT * FROM raktar 
ORDER BY id ASC;

-- 5. add_new_repair: Új szervizigény beszúrása az adatbázisba
INSERT INTO javitasok (ugyfel_nev, eszkoz_tipus, hiba_leiras, statusz, felhasznalt_alkatresz_id)
VALUES ('Kovács Péter', 'Asztali PC', 'Lassú a rendszer, Windows nem bootol.', 'Alkatrészre vár', 1);

-- 6. add_new_part: Új alkatrész hozzáadása a raktárhoz
INSERT INTO raktar (alkatresz_nev, darabszam, kritikus_szint)
VALUES ('WD Blue 1TB HDD', 5, 2);