import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';
import classNames from 'classnames';
import {Button} from 'semantic-ui-react';

function PoolCard({pool, join, enter, preview, urlJoinCode}) {
    const userId = _.get(getUserFromLocalStorage(), 'userId');
    const joined = _.find(pool.participates, {userId, joined: true});
    const poolIsOpen = moment(pool.lastCheckIn).isAfter(moment());
    const poolIsActive = pool.isActive;
    const poolCode = String(pool.code || '').trim();
    const codeMatchesUrl = urlJoinCode && poolCode === urlJoinCode;
    const showJoinBtn = !joined && poolIsOpen && poolIsActive && codeMatchesUrl;
    const showEnterBtn = joined && poolIsActive;
    const poolClass = classNames('pool', {
        'pool-closed': (!poolIsOpen && !joined) || !poolIsActive,
    });

    return (
        <li className={poolClass}>
            <div className="pool-left-side">
                <div className="pool-left-title">{pool.name}</div>
                <div className="pool-left-side-center">
                    <div className="pool-left-detail">
                        <div className="pool-left-detail-header">Players</div>
                        <div className="pool-left-detail-value">
                            {_.size(_.reject(pool.participates, {isBot: true}))}
                        </div>
                    </div>
                    <div className="pool-left-detail">
                        <div className="pool-left-detail-header">Pot</div>
                        <div className="pool-left-detail-value">{pool.pot} NIS</div>
                    </div>
                    <div className="pool-left-detail">
                        <div className="pool-left-detail-header">First Price</div>
                        <div className="pool-left-detail-value">{_.first(pool.prices)} NIS</div>
                    </div>
                </div>
            </div>
            <div className="pool-right-side">
                <div className="pool-right-title">
                    <img className="pool-image" src={pool.image} alt="" />
                </div>
                <div className="divider" />
                <div className="pool-right-detail-value">{pool.buyIn} NIS</div>
                <div className="pool-right-detail-value" style={{fontWeight: 100}}>Check-in DeadLine</div>
                <div className="pool-right-detail-value">
                    {moment(pool.lastCheckIn).format('DD/MM/YY HH:mm')}
                </div>
                <div className="pool-card-actions">
                    <Button
                        type="button"
                        size="small"
                        className="pool-card-actions__preview"
                        onClick={() => preview(pool.poolId)}
                    >
                        Preview
                    </Button>
                    {showEnterBtn && (
                        <Button
                            type="button"
                            size="small"
                            primary
                            className="pool-card-actions__enter"
                            onClick={() => enter(pool.poolId)}
                        >
                            Enter
                        </Button>
                    )}
                    {showJoinBtn && (
                        <Button
                            type="button"
                            size="small"
                            className="pool-card-actions__join"
                            onClick={() => join(pool.poolId, urlJoinCode)}
                        >
                            Join
                        </Button>
                    )}
                </div>
            </div>
        </li>
    );
}

function PoolList({join, enter, preview, urlJoinCode}) {
    const poolsState = useSelector((state) => state.pools.pools);
    const poolArray = useMemo(() => _.values(poolsState || {}), [poolsState]);
    return (
        <ul className="pool-list" style={{marginTop: '30px'}}>
            {poolArray.map((pool) => (
                <PoolCard
                    key={pool.poolId}
                    pool={pool}
                    join={join}
                    enter={enter}
                    preview={preview}
                    urlJoinCode={urlJoinCode}
                />
            ))}
        </ul>
    );
}

function SearchPools() {
    const dispatch = useDispatch();
    const [searchType, setSearchType] = useState('public');
    const [searchCode, setSearchCode] = useState('');
    const [privateCodeInput, setPrivateCodeInput] = useState('');
    const lastFetchKeyRef = useRef('');

    useEffect(() => {
        const isActive = searchType !== 'archive';
        if (searchType === 'private' && _.isEmpty(searchCode)) {
            return;
        }
        const fetchKey = `${searchType}|${searchCode}|${isActive}`;
        if (lastFetchKeyRef.current === fetchKey) {
            return;
        }
        lastFetchKeyRef.current = fetchKey;
        dispatch(getUserPools({isActive, code: searchCode}));
    }, [searchType, searchCode, dispatch]);

    const handleSetType = (event) => {
        const nextType = event.target.value;
        setSearchType(nextType);
        setSearchCode('');
        setPrivateCodeInput('');
    };

    return (
        <div className="search-pools">
            <div onClick={handleSetType} className="search-type">
                <input
                    className="hidden"
                    name="radioGroup"
                    readOnly=""
                    checked={searchType === 'public'}
                    type="radio"
                    value="public"
                />
                <label>Public</label>
            </div>
            <div onClick={handleSetType} className="search-type">
                <input
                    className="hidden"
                    name="radioGroup"
                    readOnly=""
                    checked={searchType === 'archive'}
                    type="radio"
                    value="archive"
                />
                <label>Archive</label>
            </div>
            <div className="search-type search-type-private">
                <div onClick={handleSetType}>
                    <input
                        className="hidden"
                        name="radioGroup"
                        readOnly=""
                        checked={searchType === 'private'}
                        type="radio"
                        value="private"
                    />
                    <label>Private</label>
                </div>
                {searchType === 'private' && (
                    <div className="private-code">
                        <input
                            placeholder="Paste Code here"
                            type="text"
                            value={privateCodeInput}
                            onChange={(e) => setPrivateCodeInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="ui icon button"
                            onClick={(event) => {
                                event.preventDefault();
                                setSearchCode(privateCodeInput.trim());
                            }}
                        >
                            <i aria-hidden="true" className="search icon" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const PoolsContainer = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const joinRedirectDone = useRef(false);

    const urlJoinCode = useMemo(() => {
        const code = new URLSearchParams(location.search).get('joinCode');
        return code ? String(code).trim() : '';
    }, [location.search]);

    const userPools = useSelector((state) => state.pools.pools);
    const joinCodeFetchKeyRef = useRef('');

    useEffect(() => {
        if (!urlJoinCode) {
            joinCodeFetchKeyRef.current = '';
            return;
        }
        const fetchKey = `join|${urlJoinCode}`;
        if (joinCodeFetchKeyRef.current === fetchKey) {
            return;
        }
        joinCodeFetchKeyRef.current = fetchKey;
        dispatch(getUserPools({isActive: true, code: urlJoinCode}));
    }, [dispatch, urlJoinCode]);

    useEffect(() => {
        if (!urlJoinCode || _.isEmpty(userPools) || joinRedirectDone.current) {
            return;
        }
        const poolArray = _.values(userPools);
        const match = _.find(poolArray, (p) => String(p.code || '').trim() === urlJoinCode);
        if (match && match.poolId) {
            const targetPath = `/pools/${match.poolId}`;
            if (location.pathname !== targetPath) {
                joinRedirectDone.current = true;
                history.replace(
                    `${targetPath}?joinCode=${encodeURIComponent(urlJoinCode)}&preview=1`
                );
            }
        }
    }, [userPools, urlJoinCode, history, location.pathname]);

    const handleJoin = useCallback((poolId, code) => {
        dispatch(joinPool(poolId, code ? {code} : {}))
            .then(() => {
                history.push(`/pools/${poolId}?active=true`);
            })
            .catch(() => {});
    }, [dispatch, history]);

    const handleEnter = useCallback((poolId) => {
        history.push(`/pools/${poolId}?active=true`);
    }, [history]);

    const handlePreview = useCallback((poolId) => {
        const qs = urlJoinCode
            ? `?preview=1&joinCode=${encodeURIComponent(urlJoinCode)}`
            : '?preview=1';
        history.push(`/pools/${poolId}${qs}`);
    }, [history, urlJoinCode]);

    return (
        <div id="content" className="ui container">
            <SearchPools />
            <PoolList
                join={handleJoin}
                enter={handleEnter}
                preview={handlePreview}
                urlJoinCode={urlJoinCode}
            />
            <NavigationMenu />
        </div>
    );
};

export default PoolsContainer;
