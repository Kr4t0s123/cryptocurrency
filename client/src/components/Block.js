import React, { Component } from 'react'
import Transaction from './Transaction'

class Block extends Component {

    state = { dispayTransaction : false }

    toggleTransaction =()=>{
        this.setState({ dispayTransaction : !this.state.dispayTransaction})
    }

    get displayTransaction(){
        const{ data} = this.props.block
        const stringfiendData = JSON.stringify(data)
        const dataDisplay = (stringfiendData.length > 35) ? `${stringfiendData.substring(0,35)}...` : stringfiendData
   
    if(this.state.dispayTransaction){
        return (
            <div>
               {
                   data.map(transaction =>
                   <div key={transaction.id}>
                       <hr/>
                        <Transaction transaction={transaction} />
                    </div>)
               }
                <br/>
                <button className="btn btn-danger" onClick={this.toggleTransaction}>Show less</button>
            </div>
        );
    }

    return (<div>
                <div>  Data : {dataDisplay} </div>  
                 <button className="btn btn-danger" onClick={this.toggleTransaction}>Show more</button>
            </div>);
    }
    
    render(){
        const{ timestamp, hash} = this.props.block
        const hashDisplay = `${hash.substring(0,15)}...`
        

        return(
            <div className='Block'>
                <div>Hash : {hashDisplay}</div>
                <div>Timestamp : {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        );
    }
}

export default Block