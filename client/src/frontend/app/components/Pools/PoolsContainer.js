import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';
import classNames from 'classnames';
import {Button, Icon} from 'semantic-ui-react';

function PoolCard({pool, join, enter, preview, urlJoinCode}) {
    const userId = _.get(getUserFromLocalStorage(), 'userId');
    const joined = _.find(pool.participates, {userId, joined: true});
    const poolIsOpen = moment(pool.lastCheckIn).isAfter(moment());
    const poolIsActive = pool.isActive;
    const poolCode = String(pool.code || '').trim();
    const codeMatchesUrl = urlJoinCode && poolCode === urlJoinCode;
    const showJoinBtn = !joined && poolIsOpen && poolIsActive && codeMatchesUrl;
    const showEnterBtn = joined && poolIsActive;
    const isClosed = (!poolIsOpen && !joined) || !poolIsActive;
    const playerCount = _.size(_.reject(pool.participates, {isBot: true}));
    const firstPrize = _.first(pool.prices);

    const poolClass = classNames('pool-card', {
        'pool-card--closed': isClosed,
        'pool-card--joined': joined,
    });

    const statusLabel = !poolIsActive ? 'Inactive' : poolIsOpen ? 'Open' : 'Closed';
    const statusClass = classNames('pool-card__status', {
        'pool-card__status--open': poolIsActive && poolIsOpen,
        'pool-card__status--closed': isClosed,
    });

    return (
        <li className={poolClass}>
            <div className="pool-card__header">
                <div className="pool-card__identity">
                    <div className="pool-card__image-wrap">
                        {pool.image ? (
                            <img className="pool-card__image" src={pool.image} alt="" />
                        ) : (
                            <Icon name="futbol" className="pool-card__image-fallback" />
                        )}
                    </div>
                    <div className="pool-card__title-wrap">
                        <h3 className="pool-card__title">{pool.name}</h3>
                        <span className={statusClass}>{statusLabel}</span>
                    </div>
                </div>
                <div className="pool-card__buyin">
                    <span className="pool-card__buyin-label">Buy-in</span>
                    <span className="pool-card__buyin-value">{pool.buyIn} NIS</span>
                </div>
            </div>

            <div className="pool-card__stats">
                <div className="pool-card__stat">
                    <span className="pool-card__stat-value">{playerCount}</span>
                    <span className="pool-card__stat-label">Players</span>
                </div>
                <div className="pool-card__stat">
                    <span className="pool-card__stat-value">{pool.pot}</span>
                    <span className="pool-card__stat-label">Pot (NIS)</span>
                </div>
                <div className="pool-card__stat">
                    <span className="pool-card__stat-value">{firstPrize}</span>
                    <span className="pool-card__stat-label">1st Prize</span>
                </div>
            </div>

            <div className="pool-card__meta">
                <Icon name="clock outline" />
                <span>Check-in by {moment(pool.lastCheckIn).format('DD/MM/YY HH:mm')}</span>
            </div>

            <div className="pool-card__actions">
                <Button
                    type="button"
                    size="small"
                    className="pool-card__action pool-card__action--preview"
                    onClick={() => preview(pool.poolId)}
                >
                    Preview
                </Button>
                {showEnterBtn && (
                    <Button
                        type="button"
                        size="small"
                        className="pool-card__action pool-card__action--enter"
                        onClick={() => enter(pool.poolId)}
                    >
                        Enter pool
                    </Button>
                )}
                {showJoinBtn && (
                    <Button
                        type="button"
                        size="small"
                        className="pool-card__action pool-card__action--join"
                        onClick={() => join(pool.poolId, urlJoinCode)}
                    >
                        Join pool
                    </Button>
                )}
            </div>
        </li>
    );
}

function PoolList({join, enter, preview, urlJoinCode}) {
    const poolsState = useSelector((state) => state.pools.pools);
    const poolArray = useMemo(() => _.values(poolsState || {}), [poolsState]);

    if (!poolArray.length) {
        return (
            <div className="pools-empty">
                <Icon name="futbol" className="pools-empty__icon" />
                <p className="pools-empty__title">No pools yet</p>
                <p className="pools-empty__text">
                    Create a new pool or join one with an invite link.
                </p>
            </div>
        );
    }

    return (
        <ul className="pool-list">
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

    const poolCount = _.size(userPools);

    return (
        <div id="content" className="ui container pools-page">
            <header className="pools-page__header">
                <h1 className="pools-page__title">My Pools</h1>
                <p className="pools-page__subtitle">
                    {poolCount
                        ? `${poolCount} pool${poolCount === 1 ? '' : 's'} available`
                        : 'Pick a pool to start predicting'}
                </p>
            </header>
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
