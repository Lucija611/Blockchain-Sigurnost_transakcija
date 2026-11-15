const Blockchain = require('./src/Blockchain.js');
const Transaction = require('./src/Transaction.js');
const Wallet = require('./src/Wallet.js');

const line = "-".repeat(50);

// Tri korisnika s novcanicima, Iva i Maria na pocetku imaju po 100
const iva = new Wallet('Iva');
const maria = new Wallet('Maria');
const lucija = new Wallet('Lucija');
const blockchain = new Blockchain('pow', [[iva.address, 100], [maria.address, 100]]);

// Pokusaj dodati transakciju i ispisi je li prihvacena ili odbijena
function trySend(description, tx) {
    try {
        blockchain.createTransaction(tx);
        console.log("PRIHVAĆENO: " + description);
    } catch (error) {
        console.log("ODBIJENO:   " + description + "\n            razlog: " + error.message);
    }
}

// Ispravna transakcija: sljedeci nonce + potpis posiljatelja
function signedTx(from, to, amount) {
    const tx = new Transaction(from.address, to.address, amount, blockchain.getNextNonce(from.address));
    tx.sign(from);
    return tx;
}

function printBalances() {
    [iva, maria, lucija].forEach(function(w) {
        console.log("   " + w.name + ": " + blockchain.getBalanceOfAddress(w.address));
    });
}

console.log(line + "\nPočetna salda:");
printBalances();

console.log(line + "\n1) Ispravna transakcija");
const payment = signedTx(iva, lucija, 30);
trySend("Iva -> Lucija 30", payment);

console.log(line + "\n2) SALDO");
trySend("Lucija -> Maria 50 (Lucija nema ništa)", signedTx(lucija, maria, 50));
trySend("Maria -> Lucija -40 (negativan iznos)", signedTx(maria, lucija, -40));

console.log(line + "\n3) DOUBLE SPEND (Iva ima još 70)");
trySend("Iva -> Maria 70", signedTx(iva, maria, 70));
trySend("Iva -> Lucija 70 (istih 70 još jednom)", signedTx(iva, lucija, 70));

console.log(line + "\nRudarenje bloka...");
blockchain.generateBlock('node-address-1', 2);
printBalances();

console.log(line + "\n4) REPLAY");
trySend("ponovno slanje iste transakcije Iva -> Lucija 30", payment);

console.log(line + "\n5) KRIVOTVORENJE");
const tampered = signedTx(maria, lucija, 5);
tampered.amount = 50;
trySend("Maria je potpisala 5, netko je promijenio na 50", tampered);

console.log(line);
blockchain.validationCheck();