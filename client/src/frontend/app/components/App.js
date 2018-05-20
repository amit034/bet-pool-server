import React from 'react';
import {connect} from "react-redux";

import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./LoginPage";
import PoolContainer from './PoolContainer';

class App extends React.Component {
    render() {
        return (
            <div className="app-wrapper">
                <Switch>
                    <Route path="/" render={(props)=>{
                       return  this.props.auth.isAuthenticated ?
                        <Redirect to= "/pools"/> :
                        <LoginPage {...props}/>
                    }} />
                    <ProtectedRoute path="/pools" component={PoolContainer}/>
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = (state) => {  
    return state;
};

export default withRouter(connect(mapStateToProps,{})(App));  