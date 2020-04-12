import React from 'react';
import {connect} from "react-redux";
import {Menu, Icon ,Dropdown, Image} from 'semantic-ui-react'
import {logout ,getUserFromLocalStorage} from '../actions/auth';
import {Route, Switch, withRouter, Redirect, NavLink} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./Auth/LoginPage";
import RegistrationPage from "./Auth/RegistrationPage";
import PoolContainer from './Pool/PoolContainer';
import PoolsContainer from './Pools/PoolsContainer';
import LeadersContainer from './Pool/LeadersContainer'
import ViewOthers from './Pool/ViewOthers';
import NewPool from './Pools/NewPool';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }
    logout() {
        this.props.dispatch(logoutUser());
    }
    render() {
        const {auth: {isAuthenticated} , match} = this.props;
        const user = getUserFromLocalStorage();
        return (<div className="app-wrapper">
            {isAuthenticated && (<div className="top-menu">
                    {match.params.id > 0 &&
                    <Menu.Item
                        name='pools'
                        as={NavLink} exact to={`/pools`}
                    >
                        <Icon name='angle left' />
                        Back to Pools
                    </Menu.Item>
                    }
                    <Menu.Item>
                        <Image avatar src={user.picture} />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Dropdown item trigger={(
                            <span>
                            <Image avatar src={user.picture} />
                          </span>
                        )}>
                            <Dropdown.Menu>
                                <Dropdown.Header icon='tags' content={`Signed In as ${user.firstName} ${user.lastName}`} />
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    name='profile'
                                    disabled
                                >
                                    <Icon name='user' />
                                    Your profile
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    name='logout'
                                    onClick={this.logout}
                                >
                                    <Icon name='log out' />
                                    Sign out
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Menu>
            </div>)}
            <Switch>
                <ProtectedRoute path="/pools/:id/participates" component={LeadersContainer} isAuthenticated={isAuthenticated}/>
                <ProtectedRoute path="/pools/:id/challenges/:challengeId/participates" component={ViewOthers} isAuthenticated={isAuthenticated}/>
                <ProtectedRoute path="/pools/:id" component={PoolContainer} isAuthenticated={isAuthenticated}/>
                <ProtectedRoute path="/pools" component={PoolsContainer} isAuthenticated={isAuthenticated}/>
                <ProtectedRoute path="/newPool" component={NewPool} isAuthenticated={isAuthenticated}/>
                <Route path="/register" render={(props)=>{
                   return isAuthenticated ?
                    <Redirect to= "/pools"/> :
                    <RegistrationPage {...props}/>
                }} />
                <Route path="/" render={(props)=>{
                   return isAuthenticated ?
                    <Redirect to= "/pools"/> :
                    <LoginPage {...props}/>
                }} />
            </Switch>
        </div>);
    }
}

const mapStateToProps = (state) => {
    return state;
};


export default withRouter(connect(mapStateToProps,{})(App));
