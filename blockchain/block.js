const{ GENESIS_DATA , MINE_RATE }  = require('../config')
const cryptoHash = require('../util/crypto-hash')
const HexToBinary = require('hex-to-binary')
class Block {
    constructor({ timestamp , lastHash , hash ,data,nonce,difficulty}){
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.nonce = nonce
        this.difficulty = difficulty
    }

    static genesis(){
        return new Block(GENESIS_DATA)   
    }

    static mineBlock({ lastBlock , data}){
        const lastHash = lastBlock.hash
        let nonce = 0;
        let hash,timestamp,difficulty;
        do {
            timestamp = Date.now();
            nonce++;
            difficulty = Block.adjustDifficulty({ orignalBlock : lastBlock , timestamp})
            hash = cryptoHash(timestamp,lastHash,data,nonce,difficulty)

        } while (HexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty));

        return new this({timestamp ,hash ,lastHash ,data ,difficulty , nonce})
    }

    static adjustDifficulty({orignalBlock ,timestamp }){
         const { difficulty} = orignalBlock
        if(difficulty < 1)
            return 1;
         const diff = timestamp - orignalBlock.timestamp
         
         if(diff > MINE_RATE) {
             return difficulty - 1;
         }

         return difficulty + 1;
    }

}


module.exports = Block




