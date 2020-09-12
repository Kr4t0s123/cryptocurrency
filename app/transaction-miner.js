const Transaction =require('../wallet/transaction')

class TransactionMiner{
    constructor({ transactionPool, blockchain , wallet , pubsub}){
        this.transactionPool = transactionPool;
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.pubsub = pubsub
    }
     
    mineTransactions(){
        // get the transactionPool's valid transactions
        const validTransactions = this.transactionPool.validTransaction()
       
        //generate the miner's reward
        validTransactions.push(Transaction.rewardTransaction({ minerWallet : this.wallet }))

        //add block consisting of these transaction to blockchain
        this.blockchain.addBlock({ data : validTransactions })
        
        //broadcast the upload blockchain
        this.pubsub.broadcastChain()
        
        //clear the transaction pool
        this.transactionPool.clear()
    }

};


module.exports = TransactionMiner