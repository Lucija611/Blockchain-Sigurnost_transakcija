const Block = require('./Block.js');
const Transaction = require('./Transaction.js');

const ProofOfWork = require('../consensus/proof-of-work.js');
const ProofOfStake = require('../consensus/proof-of-stake.js');
const ProofOfAuthority = require('../consensus/proof-of-authority.js');

class Blockchain {
    // genesisAllocations = pocetna sredstva, npr. [[adresa1, 100], [adresa2, 100]]
    constructor (consensus, genesisAllocations = []) {
        this.consensus = consensus;
        this.chain = [this.createGenesisBlock(genesisAllocations)];
        this.pendingTransactions = [];
        this.participants = [];
        this.miningReward = 100;
    }

    createGenesisBlock(genesisAllocations) {
        // Pocetna sredstva: transakcije "niotkuda" (fromAddress = null)
        const transactions = genesisAllocations.map(
            ([address, amount]) => new Transaction(null, address, amount)
        );
        return new Block("01/01/2010", transactions, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    generateBlock(minerAddress, difficulty = 2) { 
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        
        if (['pow','pos'].includes(this.consensus)){
            
            if (this.consensus == 'pow') {
                let algorithm = new ProofOfWork(block);
                block = algorithm.generateBlock(difficulty);
            } else if (this.consensus == 'pos') {
                let algorithm = new ProofOfStake(block);
                block.validator = minerAddress;
                block = algorithm.generateBlock();
            }

            block.block = this.chain.length;
            this.chain.push(block);
            this.pendingTransactions = [
                new Transaction(null, minerAddress, this.miningReward)
            ]
        } else if (this.consensus == 'poa'){ 
            let algorithm = new ProofOfAuthority(block);
            block.validator = minerAddress;
            block = algorithm.generateBlock();
            block.block = this.chain.length;
            this.chain.push(block);
            this.pendingTransactions = [];
        }
    }

    // dodaje transakciju u pending tek nakon sto prodje sve sigurnosne provjere
    // baca gresku ako provjera ne prodje
    createTransaction(transaction) {
        // 1. Osnovni podaci
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transakcija mora imati posiljatelja i primatelja.');
        }
        if (transaction.amount <= 0) {
            throw new Error('Iznos mora biti pozitivan broj.');
        }

        // 2. Potpis - transakciju je stvarno poslao vlasnik racuna i nitko je nije mijenjao
        if (!transaction.isValid()) {
            throw new Error('Neispravan potpis - transakcija je krivotvorena ili izmijenjena.');
        }

        // 3. Replay - nonce mora biti tocno sljedeci redni broj pociljatelja
        const expectedNonce = this.getNextNonce(transaction.fromAddress);
        if (transaction.nonce !== expectedNonce) {
            throw new Error(`Neispravan nonce ${transaction.nonce} (ocekivan ${expectedNonce}) - moguc replay napad.`);
        }

        // 4. Saldo i double spend - gledamo potvrdjeni saldo MINUS ono sto vec ceka u pending
        const available = this.getAvailableBalance(transaction.fromAddress);
        if (transaction.amount > available) {
            throw new Error(`Nedovoljno sredstava: dostupno ${available}, traceno ${transaction.amount}.`);
        }

        this.pendingTransactions.push(transaction);
    }

    registerParticipant(account) {
        this.participants.push(account);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    // Dostupni saldo = potvrdjeni saldo - iznosi koji vec cekaju u pending transakcijama.
    // Bez ovoga bi se isti novac mogao potrositi dvaput prije sljedeceg bloka (double spend).
    getAvailableBalance(address) {
        let pendingOut = 0;
        for (const trans of this.pendingTransactions) {
            if (trans.fromAddress === address) {
                pendingOut += trans.amount;
            }
        }
        return this.getBalanceOfAddress(address) - pendingOut;
    }

    // Sljedeci ocekivani nonce = broj transakcija koje je adresa vec poslala (u lancu i u pending).
    getNextNonce(address) {
        let count = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) count++;
            }
        }
        for (const trans of this.pendingTransactions) {
            if (trans.fromAddress === address) count++;
        }
        return count;
    }

    validationCheck() {
        let consensusAlgorithm = null;
        let validChain = true;
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            const copiedBlock = Object.assign({}, currentBlock);
            
            switch (this.consensus) {
                default: case 'pow':
                    consensusAlgorithm = new ProofOfWork(copiedBlock);
                    break;
                case 'pos':
                    consensusAlgorithm = new ProofOfStake(copiedBlock);
                    break;
                case 'poa':
                    consensusAlgorithm = new ProofOfAuthority(copiedBlock);
                    break;
            } 

            if(currentBlock.hash !== consensusAlgorithm.calculateHash()) {
                console.log("Block "+ currentBlock.block + " is invalid!");
                validChain = false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log("Block "+ currentBlock.block + " is invalid!");
                validChain = false;
            }
        }
        if(validChain){
            console.log("Blockchain is valid.");
        }
    }

}

module.exports = Blockchain;