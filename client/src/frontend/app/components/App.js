import React from 'react';
import _ from 'lodash';
import {Menu, Icon, Dropdown, Image} from 'semantic-ui-react';
import {logoutUser, getUserFromLocalStorage} from '../actions/auth';
import {useLocalStorage} from "react-use";
import {useSelector, useDispatch} from 'react-redux';
import {Route, Switch, useRouteMatch, Redirect, NavLink} from "react-router-dom";
import Intro from "./Intro";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./Auth/LoginPage";
import PoolContainer from './Pool/PoolContainer';
import PoolsContainer from './Pools/PoolsContainer';
import NewPool from './Pools/NewPool';
import {getParticipatesWithRank} from "../utils";

const App = () => {
    const user = getUserFromLocalStorage();
    const [mute, setMute] = useLocalStorage('mute', 'false');
    const match = useRouteMatch();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [skipIntro, setSkipIntro] = useLocalStorage('skipIntro', 'false');
    const [showIntro] =  useLocalStorage('showIntro', 'true');
    const participates = useSelector(state => state.pools.participates);

    const leaders = getParticipatesWithRank(participates);
    const rank = _.get(_.find(leaders, {userId: _.get(user, 'userId')}), 'rank');
    function logout() {
        dispatch(logoutUser());
    }

    function muteSite() {
        setMute('true');
    }
    function unMuteSite() {
        setMute('false');
    }
    const switcher = (<Switch>
        <ProtectedRoute path="/pools/:id" component={PoolContainer} isAuthenticated={isAuthenticated}/>
        <ProtectedRoute path="/pools" component={PoolsContainer} isAuthenticated={isAuthenticated}/>
        <ProtectedRoute path="/newPool" component={NewPool} isAuthenticated={isAuthenticated}/>
        <Route exact path="/register" render={(props) => {
            return isAuthenticated ?
                <Redirect to="/pools"/> :
                <LoginPage register={true} {...props}/>
        }}/>
        <Route exact path="/" render={(props) => {
            return isAuthenticated ?
                <Redirect to="/pools"/> :
                <LoginPage register={false} {...props}/>
        }}/>
    </Switch>);
    const muteMenu = mute === 'true' ? (<Dropdown.Item
        name='unMmuteSiteMenu'
        onClick={unMuteSite}
    >
        <Icon name='volume off'/>
        Un-Mute Site
    </Dropdown.Item>) : (<Dropdown.Item
        name='muteSiteMenu'
        onClick={muteSite}
    >
        <Icon name='volume up'/>
        Mute Site
    </Dropdown.Item>);


    const menu = isAuthenticated ?
        (<Menu fixed='top' inverted fluid className="top-menu">
                {match.params.id > 0 &&
                <Menu.Item
                    name='pools'
                    as={NavLink} exact to={`/pools`}
                >
                    <Icon name='angle left'/>
                    Back to Pools
                </Menu.Item>
                }
                <Menu.Item>
                    <div>Welcome Back, {user.firstName} {user.lastName}</div>
                    {rank && <div className='user-rank'>Rank: {rank}</div>}
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Dropdown item trigger={(
                        <span>
                                <Image avatar src={user.picture}/>
                              </span>
                    )}>
                        <Dropdown.Menu>
                            <Dropdown.Header icon='tags' content={`Signed In as ${user.firstName} ${user.lastName}`}/>
                            <Dropdown.Divider/>
                            <Dropdown.Item
                                name='profile'
                                disabled
                            >
                                <Icon name='user'/>
                                Your profile
                            </Dropdown.Item>
                            {muteMenu}
                            <Dropdown.Divider/>
                            <Dropdown.Item
                                name='logout'
                                onClick={logout}
                            >
                                <Icon name='log out'/>
                                Sign out
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>) : '';
    return (<div className="app-wrapper">
        {isAuthenticated && skipIntro !== 'true' && showIntro === 'true' ? <Intro setSkipIntro={setSkipIntro}/> : ''}
        {menu}
        {switcher}
    </div>);
};

export default App;