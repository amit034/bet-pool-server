import React from 'react';
import _ from 'lodash';
import {Menu, Icon, Dropdown} from 'semantic-ui-react';
import {logoutUser, getUserFromLocalStorage} from '../actions/auth';
import {useLocalStorage} from "react-use";
import {useSelector, useDispatch} from 'react-redux';
import {Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import moment from 'moment';
import Intro from "./Intro";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./Auth/LoginPage";
import PoolContainer from './Pool/PoolContainer';
import PoolsContainer from './Pools/PoolsContainer';
import NewPool from './Pools/NewPool';
import {getParticipatesWithRank} from "../utils";
import {getUserBets, getPoolParticipates, getUserPools, getPoolGoals, fetchPoolStandings} from '../actions/pools';
import PullToReloadIndicator from './PullToReloadIndicator';
import UserAvatar from './UserAvatar';

const EMPTY_PARTICIPATES = {};

const App = () => {
    const user = getUserFromLocalStorage();
    const [mute, setMute] = useLocalStorage('mute', 'false');
    const [showInstall, setShowInstall] = React.useState(false);
    React.useEffect(() => {
        const onInstallAvailable = () => setShowInstall(true);
        window.addEventListener('pwa-install-available', onInstallAvailable);
        return () => window.removeEventListener('pwa-install-available', onInstallAvailable);
    }, []);
    const poolMatch = useRouteMatch({path: '/pools/:id'});
    const poolsListMatch = useRouteMatch({path: '/pools', exact: true});
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [skipIntro, setSkipIntro] = useLocalStorage('skipIntro', 'false');
    const [showIntro] =  useLocalStorage('showIntro', 'true');
    const poolIdForRank = _.get(poolMatch, 'params.id');
    const participates = useSelector((state) =>
        poolIdForRank ? state.pools.participates : EMPTY_PARTICIPATES
    );
    const bets = useSelector((state) =>
        poolIdForRank ? state.pools.bets : {}
    );
    const [dataRefreshBusy, setDataRefreshBusy] = React.useState(false);
    const [lastDataUpdatedAt, setLastDataUpdatedAt] = React.useState(null);
    const lastRouteDataKeyRef = React.useRef(null);

    const introBlocking = isAuthenticated && skipIntro !== 'true' && showIntro === 'true';

    const rank = React.useMemo(() => {
        if (!poolIdForRank || participates === EMPTY_PARTICIPATES) {
            return null;
        }
        const leaders = getParticipatesWithRank(participates);
        return _.get(_.find(leaders, {userId: _.get(user, 'userId')}), 'rank');
    }, [poolIdForRank, participates, user]);
    function logout() {
        dispatch(logoutUser());
    }

    function muteSite() {
        setMute('true');
    }
    function unMuteSite() {
        setMute('false');
    }

    React.useEffect(() => {
        if (!isAuthenticated) return;
        const poolId = _.get(poolMatch, 'params.id');
        const key = poolId ? `pool:${poolId}` : poolsListMatch ? 'pools-list' : null;
        if (!key) return;
        if (lastRouteDataKeyRef.current !== key) {
            lastRouteDataKeyRef.current = key;
            setLastDataUpdatedAt(new Date());
        }
    }, [isAuthenticated, poolMatch, poolsListMatch]);

    const handleDataRefresh = React.useCallback(() => {
        if (dataRefreshBusy) return;
        const poolId = _.get(poolMatch, 'params.id');
        if (poolId) {
            setDataRefreshBusy(true);
            const eventIds = _.uniq(
                _.map(_.values(bets), (bet) => _.get(bet, 'challenge.game.eventId')).filter(Boolean)
            );
            Promise.all([
                dispatch(getUserBets(poolId)),
                dispatch(getPoolParticipates(poolId)),
                dispatch(getPoolGoals(poolId)),
                dispatch(fetchPoolStandings(poolId, eventIds, {force: true})),
            ])
                .then(() => setLastDataUpdatedAt(new Date()))
                .finally(() => setDataRefreshBusy(false));
            return;
        }
        if (poolsListMatch) {
            setDataRefreshBusy(true);
            Promise.resolve(dispatch(getUserPools()))
                .then(() => setLastDataUpdatedAt(new Date()))
                .finally(() => setDataRefreshBusy(false));
        }
    }, [dataRefreshBusy, poolMatch, poolsListMatch, dispatch, bets]);

    const lastUpdatedLabel = lastDataUpdatedAt
        ? `Updated ${moment(lastDataUpdatedAt).format('DD/MM HH:mm')}`
        : '';

    React.useEffect(() => {
        if (!isAuthenticated) {
            document.documentElement.style.removeProperty('--app-top-menu-height');
            return undefined;
        }
        const menu = document.querySelector('.top-menu');
        if (!menu) {
            return undefined;
        }
        const syncTopMenuHeight = () => {
            document.documentElement.style.setProperty(
                '--app-top-menu-height',
                `${menu.getBoundingClientRect().height}px`
            );
        };
        syncTopMenuHeight();
        const observer = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(syncTopMenuHeight)
            : null;
        if (observer) {
            observer.observe(menu);
        }
        window.addEventListener('resize', syncTopMenuHeight);
        return () => {
            if (observer) {
                observer.disconnect();
            }
            window.removeEventListener('resize', syncTopMenuHeight);
            document.documentElement.style.removeProperty('--app-top-menu-height');
        };
    }, [isAuthenticated, poolMatch, poolsListMatch, lastUpdatedLabel, rank]);

    const switcher = (<Switch>
        <ProtectedRoute path="/pools/:id" component={PoolContainer} isAuthenticated={isAuthenticated}/>
        <ProtectedRoute exact path="/pools" component={PoolsContainer} isAuthenticated={isAuthenticated}/>
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
                <Dropdown
                    item
                    className="top-menu-user-dropdown"
                    trigger={(
                        <span className="top-menu-user-trigger">
                            <UserAvatar user={user} className="top-menu-user-avatar ui avatar image" />
                            <Icon name="chevron down" className="top-menu-user-chevron" />
                            <span className="top-menu-user-text">
                                <span className="top-menu-user-name">
                                    {user.firstName} {user.lastName}
                                </span>
                                {rank != null && (
                                    <span className="user-rank">Rank: {rank}</span>
                                )}
                            </span>
                        </span>
                    )}
                >
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
                        {showInstall && (
                            <>
                                <Dropdown.Divider/>
                                <Dropdown.Item name='install' onClick={() => window.triggerPWAInstall && window.triggerPWAInstall()}>
                                    <Icon name='download'/>
                                    Install app
                                </Dropdown.Item>
                            </>
                        )}
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
                {(poolMatch || poolsListMatch) ? (
                    <Menu.Menu position="right" className="top-menu-right-meta">
                        <Menu.Item className="top-menu-updated-and-hint">
                            {lastUpdatedLabel ? (
                                <span className="top-menu-updated-label">{lastUpdatedLabel}</span>
                            ) : null}
                            <span className="top-menu-pull-hint">Pull down to reload page</span>
                        </Menu.Item>
                        <Menu.Item
                            className="top-menu-refresh-item"
                            icon
                            disabled={dataRefreshBusy}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDataRefresh();
                            }}
                            title="Refresh scores and standings"
                        >
                            <Icon name="refresh" loading={dataRefreshBusy} />
                        </Menu.Item>
                    </Menu.Menu>
                ) : null}
            </Menu>) : '';
    return (<div className={`app-wrapper${isAuthenticated ? ' app-wrapper--with-top-menu' : ''}`}>
        {isAuthenticated && skipIntro !== 'true' && showIntro === 'true' ? <Intro setSkipIntro={setSkipIntro}/> : ''}
        {menu}
        <PullToReloadIndicator enabled={isAuthenticated && !introBlocking} />
        {switcher}
    </div>);
};

export default App;