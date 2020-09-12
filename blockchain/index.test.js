const Blockchain = require('./index')
const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
describe('Blockchain' , ()=>{
    let blockchain , newChain , OrignalChain;

    beforeEach(()=>{
        blockchain = new Blockchain()
        newChain = new Blockchain()
        OrignalChain = blockchain.chain
    })
    it('contains a `chain` Array instance' ,()=>{
        expect(blockchain.chain instanceof Array).toEqual(true)
    })
    it('starts with a genesis block' , ()=>{
         expect(blockchain.chain[0]).toEqual(Block.genesis())
    })
    it('add a new block to chain' , ()=>{
        const newData = 'foo-data'
        blockchain.addBlock({ data: newData })
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData)
    })

    describe('isValidChain()' , ()=>{
        describe('when the chain does not start with genesis block' , ()=>{
            it('return false' ,()=>{
                blockchain.chain[0] = { data : "data-genesis"}
                expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
            })
        })
        describe('when the chain starts with the genesis block and has multiple blocks' ,()=>{
            beforeEach(()=>{
                blockchain.addBlock({ data : 'bears' })
                blockchain.addBlock({ data : 'beets' })
                blockchain.addBlock({ data : 'bettle galactica' })
            })

            describe('and lastHash reference has changed' , ()=>{
                it('return false' ,()=>{                 
                    blockchain.chain[2].lastHash = "broken-lastHash"
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
                })
            })

            describe('and chain contains a block with jumped difficulty' , ()=>{
                it('return false' ,()=>{
                    const lastBlock = blockchain.chain[blockchain.chain.length-1]
                    const lastHash = lastBlock.hash
                    const timestamp = Date.now()
                    const nonce = 0;
                    const difficulty = lastBlock.difficulty - 3;
                    const data = []
                    const hash = cryptoHash(lastHash,difficulty,data,nonce,timestamp)

                    const BadBlock = new Block({ lastHash,difficulty,data,nonce,timestamp,hash})

                    blockchain.chain.push(BadBlock)

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)

                })
                })

            describe('and the contains a block with an invalid field' ,()=>{
                it('return false' ,()=>{              
                    blockchain.chain[2].data = 'some-bad-and-evil-data'
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false)
                })
            })
            describe('and chain doen not contain any invalid blocks' ,()=>{
                it('return true' ,()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(true)

                })
            })

        })



    })

    describe('replaceChain()' ,()=>{
        describe('When the new chain is not longer' , ()=>{
            it('does not replace the chain' ,()=>{
                blockchain.replaceChain(newChain.chain)
                newChain.chain[0] = { data : "some-evil-hash"}
                expect(blockchain.chain).toEqual(OrignalChain)
            })
        })

        describe('when new chain is longer' ,()=>{
            beforeEach(()=>{
                newChain.addBlock({ data : 'bears' })
                newChain.addBlock({ data : 'beets' })
                newChain.addBlock({ data : 'bettle galactica' })
            })

            describe('and new the chain is invalid' ,()=>{
                it('does not replace the chain' ,()=>{
                    newChain.chain[2].hash = 'some-fake-hash'
                    blockchain.replaceChain(newChain.chain)
                    console.log(OrignalChain)
                    expect( blockchain.chain).toEqual(OrignalChain)
                })
            })

            describe('and new chain is valid' ,()=>{
                it('replaces the chain' ,()=>{
                    blockchain.replaceChain(newChain.chain)
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
            })
        })
     })


     describe('validTransactionData()' ,()=>{
         let transaction , rewardTransaction , wallet;

         beforeEach(()=>{
             wallet = new Wallet()
             transaction = wallet.createTransaction({ recipient : 'foo-address' , amount : 65})
             rewardTransaction = Transaction.rewardTransaction({ minerWallet : wallet})
         })

         describe('and transaction data is valid' ,()=>{
             it('returns true' ,()=>{
                 newChain.addBlock({ data : [transaction , rewardTransaction ]})
                 expect(blockchain.validTransactionData({ chain : newChain.chain})).toBe(true)
             })
         })

         describe('and the transaction data has multiple rewards' ,()=>{
            it('returns false' ,()=>{
                newChain.addBlock({ data : [transaction , rewardTransaction ,rewardTransaction]})
                expect(blockchain.validTransactionData({ chain : newChain.chain})).toBe(false)
            })
         })

         describe('and the transaction data has at least one malformed outputMap' ,()=>{
             describe('and transaction is not a reward transaction ' ,()=>{
                it('returns false' ,()=>{
                    transaction.outputMap[wallet.publicKey] = 999999
                    newChain.addBlock({ data : [transaction , rewardTransaction ]})
                    expect(blockchain.validTransactionData({ chain : newChain.chain})).toBe(false)
                })
             })

             describe('and transaction is a reward transaction' ,()=>{
                it('returns false' ,()=>{
                    rewardTransaction.outputMap[wallet.publicKey] = 999999
                    newChain.addBlock({ data : [transaction , rewardTransaction]})
                    expect(blockchain.validTransactionData({ chain : newChain.chain})).toBe(false)
                })
             })
         })

         describe('and transaction data has at aleast one malformed input' ,()=>{
            it('returns false' ,()=>{
                wallet.balance = 9000

                const evilOutputMap = {
                    [wallet.publicKey] : 8900,
                    'foo' : 100
                }

                const evilTransaction = { input : {
                    timestamp : Date.now(),
                    address : wallet.publicKey,
                    amount : wallet.balance,
                    signature : wallet.sign(evilOutputMap)
                } ,
                 outputMap : evilOutputMap}

                 newChain.addBlock({ data : [evilTransaction , rewardTransaction]})
                 expect(blockchain.validTransactionData({ chain : newChain.chain })).toBe(false)
            })
         })

         describe('and a block contains multiple identical transactions' ,()=>{
            it('returns false' ,()=>{
                newChain.addBlock({ data : [transaction , transaction ,transaction ,rewardTransaction]})
                expect(blockchain.validTransactionData({ chain : newChain.chain })).toBe(false)
            })
         })



     })
})