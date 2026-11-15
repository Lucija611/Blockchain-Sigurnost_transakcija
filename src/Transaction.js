const crypto = require('crypto');
const Wallet = require('./Wallet.js');

class Transaction {
    // fromAddress = null je nagrada za rudarenje ili pocetna sredstva
    // nonce = redni broj transakcije posiljatelja (0, 1, 2, ...) koji stiti od replaya
    constructor(fromAddress, toAddress, amount, nonce = 0) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.nonce = nonce;
        this.signature = null;
    }

    // hash svih podataka transakcije (osim potpisa)
    calculateHash() {
        return crypto.createHash('sha256')
            .update(String(this.fromAddress) + this.toAddress + this.amount + this.nonce)
            .digest('hex');
    }

    // transakciju smije potpisati samo vlasnik racuna posiljatelja
    sign(wallet) {
        if (wallet.address !== this.fromAddress) {
            throw new Error('Nije moguce potpisati transakciju s tudeg racuna!');
        }
        this.signature = wallet.sign(this.calculateHash());
    }

    // Provjera potpisa: ako je netko promijenio podatke, potpis vise ne odgovara
    isValid() {
        if (this.fromAddress === null) return true; // nagrada/pocetna sredstva nemaju potpis
        if (!this.signature) return false;

        try {
            return Wallet.verify(this.fromAddress, this.calculateHash(), this.signature);
        } catch (e) {
            return false;
        }
    }
}

module.exports = Transaction;