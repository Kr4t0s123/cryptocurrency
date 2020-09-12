import React, { Component } from 'react'
import Block from './Block'
import  { Link } from 'react-router-dom'
class Blocks extends Component {

    state = {
        blocks  : []
    }

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        .then(res => res.json().then(data => {
            this.setState({
                blocks : data
            })
        }))
        .catch(e => console.log(e))
    }

    render(){
        return (
            <div>
                <div className="homelink"><Link to="/">Home</Link></div>
                <h3>Blocks</h3>
                {this.state.blocks.map((block)=>{
                    return <Block key={block.hash} block={block}/>
                })}
            </div>
        )
    }
}

export default Blocks
