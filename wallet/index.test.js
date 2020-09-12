const Wallet = require('./index.js')
const { verifySignature } = require('../util/index');
const Transaction = require('./transaction.js');
const Blockchain = require('../blockchain/index');
const { STARTING_BALANCE } = require('../config.js');
const { calculateBalance } = require('./index.js');
describe('Wallet' ,()=>{
    let wallet;

    beforeEach(()=>{
        wallet = new Wallet();
    })
    it('has a `balance`' ,()=>{
        expect(wallet).toHaveProperty('balance')
    })
    it('has a `publicKey`' , ()=>{
        expect(wallet).toHaveProperty('publicKey')
    })

    describe('signing data' ,()=>{
        const data = 'foobar'

        it('verifies a signature' ,()=>{
            expect( verifySignature({
                publicKey : wallet.publicKey,
                data ,
                signature : wallet.sign(data)
            })).toBe(true)

           
        })

        it('does not verify the invalid signature', ()=>{
            const newWallet = new Wallet()
            expect(verifySignature({
                publicKey : wallet.publicKey ,
                data,
                signature : newWallet.sign(data)
            })).toBe(false)
        })
    })

    describe('createTransaction()' ,()=>{
        describe('and the amount exceeds the balance' ,()=>{
            it('throws an error' ,()=>{
                expect(()=>wallet.createTransaction({ amount : 99999 , recipient : 'foo-recipient'})).toThrow('Amount exceeds balance');
            })
        })

        describe('and the amount is valid' , ()=>{
            let transaction,amount,recipient;

            beforeEach(()=>{
                amount = 30;
                recipient = 'foo-recipient'
                transaction = wallet.createTransaction({ amount , recipient})
            })

            
            
            it('creates an instance of `Transaction`' ,()=>{
                 expect(transaction instanceof Transaction).toBe(true)
            })


            it('matches the transaction input with wallet' ,()=>{
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })

            it('outputs the amount the recipient' ,()=>{
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })
        })

        describe('and chain is passed' ,()=>{
            it('calls Wallet.calculateBalance' ,()=>{
                const calculateBalanceMock = jest.fn();

                const originalcalculateBalance =  Wallet.calculateBalance
                
                Wallet.calculateBalance = calculateBalanceMock

                wallet.createTransaction({ recipient : 'foo' , amount : 50 , chain : new Blockchain().chain})

                expect(calculateBalanceMock).toHaveBeenCalled()

                Wallet.calculateBalance = originalcalculateBalance
            }) 
        })
    })


    describe('calculateBalance()' ,()=>{
        let blockchain;
        
        beforeEach(()=>{
            blockchain = new Blockchain()
        })

        describe('and there are no output for wallet' ,()=>{
            it('returns the `STARTING_BALANCE`' ,()=>{
                expect(
                    Wallet.calculateBalance({ chain : blockchain.chain , address : wallet.publicKey})
                ).toEqual(STARTING_BALANCE)
            })
        })

        describe('and there are outputs for the wallet' ,()=>{
            let transactionOne,transactionTwo;

            beforeEach(()=>{
                transactionOne = new Wallet().createTransaction({ recipient : wallet.publicKey , amount : 50})
                transactionTwo = new Wallet().createTransaction({ recipient : wallet.publicKey , amount : 40})
                
                blockchain.addBlock({ data : [transactionOne , transactionTwo]})
            })
            
            it('adds the sum of all outputs to wallet balance' ,()=>{
                expect(
                    Wallet.calculateBalance({ chain : blockchain.chain , address : wallet.publicKey})
                ).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey])
            })
            
            describe('and the wallet has made a transaction' ,()=>{
                let recentTransaction;

                beforeEach(()=>{
                    recentTransaction = wallet.createTransaction({ recipient : 'foo-address' , amount : 50 })
                    blockchain.addBlock({ data : [recentTransaction]})
                })
                it('returns the output amount of recent transaction' ,()=>{
                    expect(Wallet.calculateBalance({ chain : blockchain.chain , address : wallet.publicKey})).toEqual(recentTransaction.outputMap[wallet.publicKey])
                })

                describe('and there are outputs next to and after the recent transaction' ,()=>{
                    let sameBlockTransaction,nextBlockTransaction;

                    beforeEach(()=>{
                        recentTransaction = wallet.createTransaction({ recipient : 'later-foo' , amount : 60})
                        
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet : wallet})
                        
                        blockchain.addBlock({ data : [recentTransaction , sameBlockTransaction]})

                        nextBlockTransaction = new Wallet().createTransaction({ recipient : wallet.publicKey , amount : 70})

                        blockchain.addBlock({ data : [nextBlockTransaction]})
                    })

                    it('includes the output amount in the returned balance' ,()=>{
                        expect( Wallet.calculateBalance({ chain : blockchain.chain , address : wallet.publicKey})).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] + sameBlockTransaction.outputMap[wallet.publicKey] + nextBlockTransaction.outputMap[wallet.publicKey]
                        )
                       
                    })
                })
            })
        })

       

    })
})