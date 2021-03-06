import React, { Component } from 'react'
import { Link,Redirect} from 'react-router-dom'
class ConductTranscation extends Component {

    state = {
        recipient : '' ,
        amount : 0 , didRedirect : false , knownAddresses : []
    }

   componentDidMount(){
       fetch(`${document.location.origin}/api/known-addresses`).then(res=>res.json()).then(data=> this.setState({ knownAddresses : data})).catch(e=>console.log(e))
     } 
    updateRecipient =(event)=> {
        this.setState({
            recipient : event.target.value
        })
    }
    updateAmount =(event)=>{
       
        this.setState({
            amount : Number(event.target.value)
        })
    }
    conductTransaction =(event)=>{
        event.preventDefault()
        const { recipient , amount } = this.state
        fetch(`${document.location.origin}/api/transact` ,{
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method : 'POST',
            body : JSON.stringify({ recipient , amount })
        }).then(res=>res.json()).then(data =>
        { 
            alert(data.type || data.massage);
            this.setState({
                didRedirect : true
            })
        })
        .catch(e=>console.log(e))
    }

    doRedirect =()=>{
     this.props.history.push('/transactionPool')
    }
    render(){
        console.log('this.state', this.state)
        const { recipient , amount , knownAddresses } = this.state
        
        return(
            <div className="ConductTransaction">
                <Link to="/">Home</Link>
                <hr style={{ backgroundColor : '#444'}}/>
                 <h2>Conduct a Transaction</h2>
                 <br/>
                 <h4>Known Addresses</h4>
                 {
                    knownAddresses.map(address => {
                        return (
                        <div key={address}>
                           <div> {address}</div>
                           <br/>
                        </div>
                        );
                    })
                 }              
                <form>
                    <div className="form-group">
                        <input onChange={this.updateRecipient} type="text" className="form-control" value={recipient} placeholder="Recipient" />
                    </div>
                    <div className="form-group">
                        <input  type="text" className="form-control" value={amount} placeholder="Amount" onChange={this.updateAmount}/>
                    </div>
                         <button onClick={this.conductTransaction} className="btn btn-danger">Submit</button>
                </form>
                {(this.state.didRedirect)?this.doRedirect():null}
            </div>
        );
    }
}

export default (ConductTranscation)