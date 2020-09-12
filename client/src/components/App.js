import React, { Component } from 'react'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

class App extends Component {

    state = { walletInfo : {} }

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
        .then(res => res.json()
        .then(data => {
            this.setState({
                walletInfo : data
            })
        }))
        .catch((error)=>console.log(error))
    }   
    
    render(){
        return (
            <div className="App">
                <img className='logo' src={logo}/>
                <br/>
                <div style={{ marginBottom : '30px'}}>
                    Welcome To the Blockchain..
                </div>
                <br/>
                <div className="blockslink">
                    <Link  to="/blocks">Blocks</Link>
                    <div>
                    <Link to="/conduct-transaction">Conduct a Transaction</Link>
                   </div>
                   <div>
                       <Link to="/transactionPool">Transaction Pool</Link>
                   </div>
                </div>
                
                <br/>

                <div className="WalletInfo">
                   <div>Adress : {this.state.walletInfo.address}</div>
                   <div>Balance : {this.state.walletInfo.balance}</div>
                </div>
            </div>
        );
    }
}

export default App
