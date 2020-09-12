import React, { Component } from 'react'
import { Link, Redirect, withRouter } from 'react-router-dom'
import Transaction from './Transaction'
import history from '../history'

const POLL_INTERVAL_MS = 1000

class TransactionPool extends Component {
    state = {
        transactionPoolMap : {} 
    }
    
    fetchTransactionPoolMap = () =>{
        fetch(`${document.location.origin}/api/transaction-pool-map`).then(res=>res.json()).then(data=>{
            this.setState({ transactionPoolMap : data })
        }).catch(e=>console.log(e))
    }
   
    componentDidMount(){
        this.fetchTransactionPoolMap()
        this.fetchPoolMapInterval =  setInterval(()=>this.fetchTransactionPoolMap() , POLL_INTERVAL_MS)
    }

    componentWillUnmount(){
        clearInterval(this.fetchPoolMapInterval)
    }

    fetchMineTransactions=(e)=>{
        fetch(`${document.location.origin}/api/mine-transactions`).then(res=> {
            if(res.status === 200) {
                alert('success');
                this.props.history.push('/blocks')
            } else {
                alert('The mine-transaction block request did not complete')
            }
        } )
    }
        
 
    render() {
        return (
            <div className="TransactionPool"> 
                <div><Link to="/">Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return (
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction} />
                            </div>
                        );
                    } )
                }
                <hr/>
                <button className="btn btn-danger" onClick={this.fetchMineTransactions}>Mine the Transaction</button>
                
            </div>
        )
    }
}

export default withRouter(TransactionPool)
