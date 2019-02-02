import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Route, Switch, withRouter, Redirect, NavLink} from 'react-router-dom';
import format from 'string-template';
import {Menu, Icon, Dropdown, Image} from 'semantic-ui-react';
import {getUserFromLocalStorage, logoutUser} from '../actions/auth';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './Auth/LoginPage';
import RegistrationPage from "./Auth/RegistrationPage";
import PoolContainer from './Pool/PoolContainer';
import PoolsContainer from './Pools/PoolsContainer';
import LeadersContainer from './Pool/LeadersContainer';
import ViewOthers from './Pool/ViewOthers';
import NewPool from './Pools/NewPool';
import texts from '../texts';

class App extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }

    logout() {
        this.props.dispatch(logoutUser());
    }

    render() {
        const {auth: {isAuthenticated}, match} = this.props;
        const user = getUserFromLocalStorage();
        const userTrigger = <span><Image role="presentation" avatar src={user.picture} /></span>;
        return (<div className="app-wrapper">
            {isAuthenticated &&
            <Menu fixed='top' inverted fluid className="top-menu">
                {match.params.id > 0 &&
                <Menu.Item
                    name='pools'
                    as={NavLink} exact to={`/pools`}
                >
                    <Icon name='angle left' />
                    {texts.backToPools}
                </Menu.Item>
                }
                <Menu.Item>
                    <div>{format(texts.welcomeBack, `${user.firstName} ${user.lastName}`)}</div>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Dropdown item
                              trigger={userTrigger}
                    >
                        <Dropdown.Menu>
                            <Dropdown.Header icon='tags' content={`Signed In as ${user.firstName} ${user.lastName}`} />
                            <Dropdown.Divider />
                            <Dropdown.Item name='profile'
                                           disabled
                            >
                                <Icon name='user' />
                                Your profile
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item name="logout"
                                           onClick={this.logout}
                            >
                                <Icon name='log out' />
                                {texts.signOut}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
            }
            <Switch>
                <ProtectedRoute path="/pools/:id/participates" component={LeadersContainer}
                                isAuthenticated={isAuthenticated} />
                <ProtectedRoute path="/pools/:id/challenges/:challengeId/participates" component={ViewOthers}
                                isAuthenticated={isAuthenticated} />
                <ProtectedRoute path="/pools/:id" component={PoolContainer} isAuthenticated={isAuthenticated} />
                <ProtectedRoute path="/pools" component={PoolsContainer} isAuthenticated={isAuthenticated} />
                <ProtectedRoute path="/newPool" component={NewPool} isAuthenticated={isAuthenticated} />
                <Route path="/register" render={(props) => {
                    return isAuthenticated ?
                        <Redirect to="/pools" /> :
                        <RegistrationPage {...props} />
                }} />
                <Route path="/" render={(props) => {
                    return isAuthenticated ?
                        <Redirect to="/pools" /> :
                        <LoginPage {...props} />
                }} />
            </Switch>
        </div>);
    }
}

const mapStateToProps = (state) => {
    return state;
};

export default withRouter(connect(mapStateToProps, {})(App));
