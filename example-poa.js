const Blockchain = require('./src/Blockchain.js');
const Transaction = require('./src/Transaction.js');
const Participants = require('./src/Participants.js');
const Wallet = require('./src/Wallet.js');

// Racuni s novcanicima (kljucevima), u genesis bloku svaki dobiva 100
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

console.log("-".repeat(repeat_lines))
console.log("New Blockchain started with Proof of Authority")
console.log("-".repeat(repeat_lines))
console.log("\Authorities selected...");
let authorities = Participants.nodes();
console.log("-".repeat(repeat_lines))

let blockchain = new Blockchain('poa', genesisAllocations);
console.log("Genesis Block 1 created")
console.log("-".repeat(repeat_lines))

console.log("-".repeat(repeat_lines))
console.log('\nFirst Transactions created...');
send(account1, account2, 100);
send(account2, account1, 50);

console.log("-".repeat(repeat_lines))
console.log('Creating Block 2...');
let authority = authorities[Math.floor(Math.random() * Participants.nodes().length)][0];
console.log('\nAuthority randomly chosen: ' + authority);
blockchain.generateBlock(authority);

console.log("-".repeat(repeat_lines))
console.log('\nNew Transactions created...');
send(account2, account1, 130);

console.log("-".repeat(repeat_lines))
console.log('Creating Block 3...');
authority = authorities[Math.floor(Math.random() * Participants.nodes().length)][0];
console.log('\nAuthority randomly chosen: ' + authority);
blockchain.generateBlock(authority);

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
