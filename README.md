# HardwareHub Inventory Management

Ez egy modern, egyoldalas webalkalmazás, amelyet egy számítástechnikai szerviz javításainak és raktárkészletének kezelésére készítettünk. Az alkalmazás felhős adatbázissal kommunikál, és asztali gépen valamint mobilon is használható.

Készítette: **Apró Bence** és **Ngo Nguyen Thao**

---

## Főbb funkciók

A projekt célja egy könnyen kezelhető rendszer készítése volt, amely segíti egy szerviz mindennapi munkáját.

- **Szerviznapló és archívum:**  
  Az aktív javítások és a kész munkák külön oldalon jelennek meg. A státuszok egy legördülő menüből módosíthatók, és keresni is lehet az ügyfelek vagy eszközök között.

- **Automatikus készletkezelés:**  
  Új javítás rögzítésekor a rendszer megjeleníti a raktáron lévő alkatrészeket. Ha kiválasztunk egyet, a program automatikusan csökkenti a készlet darabszámát.

- **Készlethiány figyelés:**  
  A kevés darabszámú alkatrészek piros kiemelést kapnak, így könnyen észrevehető, ha utánrendelés szükséges. A készlet egy gombbal növelhető.

- **API kommunikáció:**  
  Az alkalmazás a Retool REST API-ját használja adatkezelésre. A rendszer képes új adatok létrehozására, módosítására, lekérésére és törlésére is.

- **Hibakezelés:**  
  Ha egy kérés sikertelen, az alkalmazás hibaüzenetet jelenít meg, és nem fagy le. A gombok művelet közben töltési állapotot mutatnak.

- **Reszponzív felület:**  
  A Bootstrap 5 segítségével az oldal mobiltelefonon és számítógépen is kényelmesen használható.

---

## Technológiák

- **Környezet:** Vite.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Dizájn:** Bootstrap 5, Bootstrap Icons, CSS
- **Backend / Adatbázis:** Retool API, SQL

---

## Telepítés és futtatás

A projekt futtatásához szükség van Node.js-re.

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Fejlesztői szerver indítása

```bash
npm run dev
```

A terminálban megjelenő localhost linken az alkalmazás böngészőből megnyitható és tesztelhető.