
import { createHashHistory } from 'history';
import React, { Component } from 'react';
import Router from './Router';
export default class BrowserRouter extends Component {
    constructor(props){
        super(props);
        this.history = createHashHistory();
    }
    
    render() {
        return <Router history={this.history} children={this.props.children}></Router>
    }
}
