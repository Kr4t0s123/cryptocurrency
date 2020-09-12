const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const PubSub =require('./app/pubsub')
const request = require('request')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet/index')
const TransactionMiner = require('./app/transaction-miner')
const path = require('path')
const cors = require('cors');


const transactionPool = new TransactionPool();
const wallet = new Wallet()
const app = express();
const blockchain = new Blockchain()
const pubsub = new PubSub({ blockchain ,transactionPool })
const transactionMiner = new TransactionMiner({ transactionPool ,wallet , pubsub, blockchain})
app.use(express.static(path.join(__dirname , './client/dist')))
app.use(cors());
const DEFAULT_PORT = 3000
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`


app.use(bodyParser.json());
app.get('/api/blocks' ,(req, res)=>{
     res.json(blockchain.chain)
})

app.post('/api/transact' ,(req, res)=>{
    const { amount , recipient } = req.body

    let transaction = transactionPool.existingTransaction({ inputAddress : wallet.publicKey})

    try {
        if(transaction){
            transaction.update({ senderWallet : wallet, amount , recipient })
        } else {
            transaction = wallet.createTransaction({ amount, recipient , chain : blockchain.chain })
        }
    } catch (error) {
       return res.status(400).json({  message : error.message})
    } 

    transactionPool.setTransaction(transaction)
    pubsub.broadcastTransaction(transaction)
    res.json({ type : 'success' , transaction })
})

app.post('/api/mine' ,(req, res)=> {
        const { data } = req.body
        blockchain.addBlock({ data })
        pubsub.broadcastChain()
        res.redirect('/api/blocks');
})

app.get('/api/transaction-pool-map' ,(req ,res)=>{
    res.json(transactionPool.transactionMap)
})

app.get('/api/mine-transactions' ,(req ,res)=>{
    transactionMiner.mineTransactions()
    res.redirect('/api/blocks');
})

app.get('/api/wallet-info' ,(req ,res)=>{
    res.json({ address : wallet.publicKey , balance : Wallet.calculateBalance({ chain : blockchain.chain , address : wallet.publicKey})})
})

app.get('/api/known-addresses' ,(req, res)=>{
    
    const addresses = {}
    for(let block of blockchain.chain){
        for(let transaction of block.data){
             const recipients = Object.keys(transaction.outputMap)
             recipients.forEach(recipient => addresses[recipient] = recipient )
        }
    }
    res.json(Object.keys(addresses))
})
app.get('*' ,(req, res)=>{
    res.sendFile(path.join(__dirname , './client/dist/index.html') )
})



const syncWithRootState=()=>{
    request({ url : `${ROOT_NODE_ADDRESS}/api/blocks`} , (error  ,response , body)=>{
        if(!error && response.statusCode === 200){
             const rootChain = JSON.parse(body)
            blockchain.replaceChain(rootChain)
        }
    })

    request({ url : `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`} ,(error  ,response , body)=>{
        if(!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body)
            transactionPool.setMap(rootTransactionPoolMap)
        }
    })
}

const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction =({wallet ,recipient , amount})=>{

    const transaction = wallet.createTransaction({ recipient , amount , chain : blockchain.chain})
    transactionPool.setTransaction(transaction)
}

const walletAction =()=> generateWalletTransaction({ wallet , recipient : walletFoo.publicKey , amount : 5})

const walletFooAction = () => generateWalletTransaction({ wallet : walletFoo , recipient : walletBar.publicKey , amount : 10})

const walletbarAction = ()=> generateWalletTransaction({ wallet : walletBar , recipient : wallet.publicKey , amount : 15})

for(let i = 0;i < 10 ; i++) {
    if(i%3 === 0)
    {
        walletAction();
        walletFooAction()
    } else if(i%3 === 1){
        walletFooAction();
        walletbarAction();
    } else {
        walletbarAction();
        walletAction()
    }

    transactionMiner.mineTransactions();
}

let PEER_PORT;
if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000)
}
const PORT = PEER_PORT || DEFAULT_PORT
app.listen(PORT ,()=>{
    console.log(`Server is up and running on localhost:${PORT}`)
    if(PORT !== DEFAULT_PORT){
        syncWithRootState()
    }
})
