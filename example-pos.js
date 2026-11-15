const Blockchain = require('./src/Blockchain.js');
const Transaction = require('./src/Transaction.js');
const Participants = require('./src/Participants.js');
const ProofOfStake = require('./consensus/proof-of-stake.js');
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
console.log("New Blockchain started with Proof of Stake")
console.log("-".repeat(repeat_lines))
let blockchain = new Blockchain('pos', genesisAllocations);
console.log("Genesis Block 1 created")
console.log("-".repeat(repeat_lines))

console.log("-".repeat(repeat_lines))
console.log("\nValidators joining the network...");

let proofofstake = new ProofOfStake();
nodes = ProofOfStake.setBalanceForNodes(Participants.nodes());
nodes[0] = proofofstake.createValidator(nodes[0], 200);
nodes[1] = proofofstake.createValidator(nodes[1], 100);
proofofstake.validators.forEach(function(validator){
    console.log(validator[0] + " has a stake of " + validator[1]);
});

console.log("-".repeat(repeat_lines))
console.log('\nFirst Transactions created...\n');
send(account1, account2, 100);
send(account2, account1, 50);

console.log("-".repeat(repeat_lines))
console.log('Creating Block 2...');
console.log('\nChoosing validator...');
let validator = proofofstake.getValidatorWithMaxStake()[0];
console.log("Validator with the highest stake chosen: " + validator)
blockchain.generateBlock(validator);

console.log("-".repeat(repeat_lines))
console.log('Creating Block 3...');
console.log('\nChoosing validator...');
validator = proofofstake.getValidatorWithMaxStake()[0];
console.log("Validator with the highest stake chosen: " + validator);

blockchain.generateBlock(validator);
console.log('\nMiner of Block 2 is been rewarded...');

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
