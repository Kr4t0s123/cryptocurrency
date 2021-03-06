const TransactionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./index')
const Blockchain = require('../blockchain')
describe('TransationPool' ,()=>{

    let transactionPool, transaction , senderWallet;
    beforeEach(()=>{
        senderWallet =  new Wallet() 
        transactionPool = new TransactionPool();
        transaction = new Transaction({ senderWallet, recipient : 'foo' , amount : 50})
    })

    describe('setTransaction()' ,()=>{
        it('adds a transaction' ,()=>{
            transactionPool.setTransaction(transaction); 
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction)
        })
    })

    describe('existingTransaction()', () => {
        it('returns a existing transaction given an input address' ,()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.existingTransaction({ inputAddress : senderWallet.publicKey })).toBe(transaction)                   
        })
    })

    describe('validTransaction()'  ,()=>{

        let validTransactions;
        beforeEach(()=>{
            validTransactions = []
            
            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({ senderWallet, recipient : 'any- recipient' ,amount : 50 })
                
                if(i%3 === 0) {
                    transaction.input.amount = 99999
                } else if (i%3 === 1) {
                    transaction.input.signature = new Wallet().sign('foo')
                } else {
                    validTransactions.push(transaction)
                }

                transactionPool.setTransaction(transaction)
            }

           it('returns valid transaction' ,()=>{
                expect(transactionPool.validTransaction()).toEqual(validTransactions)
           })
        })

    })
    
    describe('clear()' ,()=>{
        it('clears the transactionPool' , ()=>{
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({})
        })
    })

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain transactions' ,()=>{
            const blockchain = new Blockchain()
            const expectedTransactionPool = {};
            for(let i = 0; i < 6 ; i++){
                const transaction = new Wallet().createTransaction({ recipient : 'foo' ,amount : 20})

                transactionPool.setTransaction(transaction)
                if(i%2 === 0){
                    blockchain.addBlock({ data : [transaction] })
                } else {
                    expectedTransactionPool[transaction.id] = transaction
                }
            }
            transactionPool.clearBlockchainTransactions({ chain : blockchain.chain });
            expect(transactionPool.transactionMap).toEqual(expectedTransactionPool)
        })
    })
    
})