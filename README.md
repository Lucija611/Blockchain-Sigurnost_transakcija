# Sigurnost transakcija: saldo, double spend i replay

Seminarski rad iz kolegija Blockchain. Projekt nadograđuje primjer s laboratorijskih vježbi ([msvarcmajer/mechanism](https://github.com/msvarcmajer/mechanism), temeljen na [BlockchainJS](https://github.com/schefa/BlockchainJS)) zaštitom transakcija od tri osnovna napada: trošenja sredstava koja ne postoje, dvostruke potrošnje (double spend) i ponovnog slanja iste transakcije (replay).

```
Blockchain-Sigurnost_transakcija
    |-- consensus/
        |-- proof-of-authority.js
        |-- proof-of-stake.js
        |-- proof-of-work.js
    |-- src/
        |-- Block.js
        |-- Blockchain.js      (izmijenjeno)
        |-- Participants.js
        |-- Transaction.js     (izmijenjeno)
        |-- Wallet.js          (novo)
    |-- example-poa.js         (izmijenjeno)
    |-- example-pos.js         (izmijenjeno)
    |-- example-pow.js         (izmijenjeno)
    |-- example-security.js    (novo)
```

## Pokretanje
```shell
git clone https://github.com/Lucija611/Blockchain-Sigurnost_transakcija.git
cd Blockchain-Sigurnost_transakcija
npm install
node example-security.js
```

## Problem u izvornom kodu

Izvorni lanac prihvaća svaku transakciju bez provjere. Adrese su obični tekst, pa bilo tko može poslati transakciju u tuđe ime. Saldo se ne provjerava, pa račun s 0 može poslati 100 i završiti u minusu, a ista transakcija može se poslati više puta.

## Što je dodano

### Potpisi (`src/Wallet.js`, `src/Transaction.js`)

Svaki korisnik ima novčanik s parom ključeva (ECDSA, krivulja secp256k1, kao u Bitcoinu i Ethereumu). Adresa je javni ključ. Pošiljatelj potpisuje hash transakcije privatnim ključem, a lanac potpis provjerava javnim ključem. Svaka izmjena transakcije nakon potpisivanja čini potpis neispravnim.

### Saldo (`Blockchain.createTransaction`)

Iznos mora biti pozitivan i ne smije biti veći od salda pošiljatelja. Početna sredstva dodjeljuju se u genesis bloku.

### Double spend (`Blockchain.getAvailableBalance`)

Saldo se ne gleda samo iz blokova, nego se od njega oduzimaju i transakcije koje već čekaju u pending. Tako se ista sredstva ne mogu potrošiti dvaput prije nego što se izrudari sljedeći blok.

### Replay (`Blockchain.getNextNonce`)

Svaka transakcija ima nonce, redni broj transakcije pošiljatelja (0, 1, 2...). Lanac prihvaća samo transakciju s točno sljedećim nonceom. Ponovno poslana stara transakcija ima već iskorišten nonce i odbija se. Nonce je dio potpisanih podataka, pa ga napadač ne može promijeniti.

## Demo

`example-security.js` stvara tri korisnice (Iva, Maria, Lucija) i redom pokušava:

1. ispravnu transakciju, koja se prihvaća
2. slanje više nego što korisnica ima i negativan iznos, što se odbija (saldo)
3. dvaput potrošiti istih 70, pri čemu se druga transakcija odbija (double spend)
4. ponovno poslati već izvršenu transakciju, što se odbija (replay)
5. promijeniti iznos nakon potpisivanja, što se odbija (neispravan potpis)

Za svaku odbijenu transakciju ispisuje se razlog. Na kraju provjera lanca potvrđuje da nijedna neispravna transakcija nije ušla u blok.