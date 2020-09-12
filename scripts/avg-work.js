const Blockchain = require('../blockchain/index')

const blockchain = new Blockchain();

blockchain.addBlock({ data : 'initial'})
console.log(blockchain.chain[blockchain.chain.length - 1])
let prevTimestamp,nextTimestamp,nextBlock,timeDiff;
let sum = 0;
for(let i = 1; i <= 1000; i++) {

    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp

    blockchain.addBlock({ data : `block ${i}`})

    nextBlock = blockchain.chain[blockchain.chain.length - 1];
    nextTimestamp = nextBlock.timestamp

    timeDiff = nextTimestamp - prevTimestamp
    sum += timeDiff

    console.log(`Time to Mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average : ${sum/i}`)
}