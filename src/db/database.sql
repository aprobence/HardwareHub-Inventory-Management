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