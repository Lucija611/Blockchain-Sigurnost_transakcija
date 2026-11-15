const Blockchain = require('./src/Blockchain.js');
const Transaction = require('./src/Transaction.js');
const Participants = require('./src/Participants.js');
const Wallet = require('./src/Wallet.js');

// Racuni s Walletima (kljucevima), u genesis bloku svaki dobiva 100
const account1 = new Wallet('account-address-1');
const account2 = new Wallet('account-address-2');
const accounts = [account1, account2];
const genesisAllocations = [[account1.address, 100], [account2.address, 100]];

// Stvara transakciju sa sljedecim nonceom, potpisuje je i salje u lanac
function send(fromWallet, toWallet, amount) {
    const tx = new Transaction(fromWallet.address, toWallet.address, amount, blockchain.getNextNonce(fromWallet.address));
    tx.sign(fromWallet);
    blockchain.createTransaction(tx);
}
  
repeat_lines = 50;

// Number of zeros at the beginning of the hash value
difficulty = 4;

console.log("-".repeat(repeat_lines))
console.log("New Blockchain started with Proof of Work")
console.log("-".repeat(repeat_lines))
let blockchain = new Blockchain('pow', genesisAllocations);
console.log("Genesis Block 1 created")
console.log("-".repeat(repeat_lines))

console.log('\nTransactions created...');
send(account1, account2, 100);
send(account2, account1, 50);

console.log("-".repeat(repeat_lines))
console.log('\nMining Block 2...');
console.time("Mining Block 2 Time");
blockchain.generateBlock(Participants.nodes()[0][0], difficulty);
console.timeEnd("Mining Block 2 Time");

console.log("-".repeat(repeat_lines))
console.log('\nMining Block 3...');

console.log('\nMiner of Block 2 is been rewarded...');
console.time("Mining Block 3 Time");
blockchain.generateBlock(Participants.nodes()[1][0], difficulty);
console.timeEnd("Mining Block 3 Time");
/**
 * Validation check of the blockchain
 */
console.log("\n"+"-".repeat(repeat_lines)+"\n"+"-".repeat(repeat_lines)) 
console.log("Validation check...")
blockchain.validationCheck();

/**
 * Print balances
 */
console.log("\n"+"-".repeat(repeat_lines))
Participants.nodes().forEach(function(account){
    console.log('Balance of '+account[0]+':\t'+ blockchain.getBalanceOfAddress(account[0]))
});
accounts.forEach(function(wallet){
    console.log('Balance of '+wallet.name+':\t'+ blockchain.getBalanceOfAddress(wallet.address))
});

/**
 * Print blockchain
 */
console.log("\n"+"-".repeat(repeat_lines)+"\n"+"-".repeat(repeat_lines)) 
console.log("Blockchain") 
console.log(JSON.stringify(blockchain.chain,'', 4));
console.log("-".repeat(repeat_lines)) 
console.log("Pending transactions") 
console.log(JSON.stringify(blockchain.pendingTransactions,'', 4));
