const crypto = require('crypto');

// Wallet: par kljuceva (ECDSA, krivulja secp256k1)
// Adresa walleta je javni kljuc zapisan kao hex string
// Privatni kljuc ostaje u novcaniku i koristi se samo za potpisivanje

class Wallet {
    constructor(name) {
        this.name = name;

        const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: 'secp256k1'
        });

        this.privateKey = privateKey;
        this.address = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    }

    // potpisivanje hash transakcije privatnim kljucem
    sign(data) {
        return crypto.sign('sha256', Buffer.from(data), this.privateKey).toString('hex');
    }

    // provjera potpisa pomocu javnog kljuca
    static verify(address, data, signature) {
        const publicKey = crypto.createPublicKey({
            key: Buffer.from(address, 'hex'),
            format: 'der',
            type: 'spki'
        });
        return crypto.verify('sha256', Buffer.from(data), publicKey, Buffer.from(signature, 'hex'));
    }
}

module.exports = Wallet;