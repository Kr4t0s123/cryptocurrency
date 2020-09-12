const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require('../config');
const cryptoHash = require("../util/crypto-hash");
const HexToBinary = require('hex-to-binary')
describe('Block' , ()=>{
    const timestamp = 2000;
    const lastHash = 'foo-hast';
    const hash = 'bar-hash';
    const data= ['blockchain','data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({ timestamp,lastHash,hash,data,nonce,difficulty});

    it('has timestamp,lastHash,Hash and data', ()=>{
        expect(block.timestamp).toEqual(timestamp)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.hash).toEqual(hash)
        expect(block.data).toEqual(data)
        expect(block.nonce).toEqual(nonce)
        expect(block.difficulty).toEqual(difficulty)


    })
    describe('genesis()' , ()=>{
        const genesisBlock = Block.genesis()
        it('return instance of Block' ,()=>{
            expect(genesisBlock instanceof Block).toEqual(true)
        })

        it('return genesis data', ()=>{
            expect(genesisBlock).toEqual(GENESIS_DATA)
        })
    } )


    describe('mineBlock()' ,()=>{
        const lastBlock = Block.genesis()
        const data = 'mined-data'

        const minedBlock = Block.mineBlock({ lastBlock, data})

        it('returns a Block instance' ,()=>{
            expect(minedBlock instanceof Block).toEqual(true)
        })

        it('sets `hash` that matches the difficulty criteria',()=>{
            expect(HexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty))
        })

        it('sets the `lastHash` to be the `hash` of last Block' , ()=>{
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        })

        it('sets the `data`' , ()=>{
            expect(minedBlock.data).toEqual(data)
        })

        it('sets the `timestamp`', ()=>{
            expect(minedBlock.timestamp).not.toEqual(undefined)
        })

        it('crates a SHA-256 `hash` based on the proper inputs' , ()=>{
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash,data, minedBlock.nonce,minedBlock.difficulty))
        })

        it('adjusts the difficulties' , ()=>{
            const possibleDifficulties = [lastBlock.difficulty-1,lastBlock.difficulty+1]

            expect(possibleDifficulties.includes(minedBlock.difficulty)).toBe(true)
        })

    })

    describe('adjustDifficulty' ,()=>{
        it('raises the difficulty for quickly mined block' ,()=>{
            expect(Block.adjustDifficulty({ orignalBlock : block ,
                timestamp : block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1)
        })

        it('lowers the difficulty for slowly mined block' ,()=>{

            expect(Block.adjustDifficulty({ orignalBlock : block ,
                timestamp : block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty -1)
        })

        it('has a lower limit of 1' ,()=>{
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ orignalBlock : block 
            })).toEqual(1)
        })

    })
 

})