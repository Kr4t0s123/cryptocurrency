import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import { BrowserRouter as Router , Route , Switch} from 'react-router-dom'
import './index.css'
import history from './history'
import Block from './components/Block'
import Blocks from './components/Blocks'
import ConductTranscation from './components/ConductTransaction'
import TransactionPool from './components/TransactionPool'

render(<Router history={history}>
          <Switch>
            <Route exact path="/" component={App}/>
            <Route exact path="/blocks" component={Blocks}/>
            <Route exact path="/conduct-transaction" component={ConductTranscation}/>
            <Route exact path="/transactionPool" component={TransactionPool} />
          </Switch>
        </Router>, 
     document.getElementById('root'))