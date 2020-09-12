const Block = require("./block")
const cryptoHash = require("../util/crypto-hash")
const { REWARD_INPUT, MINING_REWARD } = require("../config")
const Transaction = require("../wallet/transaction")
const Wallet = require("../wallet")

class Blockchain {
    constructor(){
        this.chain = [Block.genesis()]
    }

    addBlock({ data }){
        const lastBlock = this.chain[this.chain.length-1]
        const newBlock = Block.mineBlock({ lastBlock ,data })
        this.chain.push(newBlock)
    }

    static isValidChain(chain){
      
        if(JSON.stringify( chain[0]) !== JSON.stringify( Block.genesis())){
           return false
        }
        for(let i=1;i<chain.length;i++)
        {
            const block = chain[i]
            const actualLastHash = chain[i-1].hash;
            const { timestamp , hash, lastHash, data, difficulty, nonce} = block

            const lastDifficulty = chain[i-1].difficulty

            if(Math.abs(lastDifficulty - difficulty) > 1){
                return false;
            }
            if(lastHash != actualLastHash) {
                return false;
            }
            if(hash !== cryptoHash(timestamp , data , lastHash, difficulty, nonce)) {
                return false;
            }
        }
        return true
    }

    replaceChain(chain, validateTransactions ,onSuccess){
        if(chain.length <= this.chain.length){
            console.error('The Incoming Chain must be longer')
            return;
        }
        if(Blockchain.isValidChain(chain) === false){
            console.error('The Incoming Chain must be valid')
            return;
        }
        if(validateTransactions &&  !this.chain.validTransactionData({ chain })){
            console.error('The incoming chain has invalid Data')
            return false;
        }

        if(onSuccess){ onSuccess() }
        console.log('replacing chain with', chain)
        this.chain = chain
    }

    validTransactionData({ chain }){

        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];
            let rewardTransactionCount = 0;
            const transactionSet = new Set()
            for(let transaction of block.data){
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount+=1;

                    if(rewardTransactionCount > 1){
                        console.error("Miner rewards exceed limit")
                        return false;
                    }
    
                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD ){
                        console.error('Miner reward amount is invalid')
                        return false;
                    }            

                } else {
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid Transaction')
                        return false;
                    }
                    
                    const trueBalance = Wallet.calculateBalance({ chain : this.chain , address : transaction.input.address})
                    if(trueBalance !== transaction.input.amount){
                        console.error('Invalid input amount')
                        return false
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transaction appears more than once in the block')
                        return false;
                    } else {
                        transactionSet.add(transaction)
                    }
                    

                }
            } 
        }
        return true
    }
}

module.exports = Blockchain