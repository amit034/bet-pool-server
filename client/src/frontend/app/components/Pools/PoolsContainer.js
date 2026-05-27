import React, {useEffect, useState, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';
import classNames from 'classnames';
import {Button} from 'semantic-ui-react';

const PoolsContainer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const urlJoinCode = useMemo(() => {
    const code = new URLSearchParams(location.search).get('joinCode');
    return code ? String(code).trim() : '';
  }, [location.search]);

  useEffect(() => {
    dispatch(getUserPools());
  }, [dispatch]);

  const userPools = useSelector(state => state.pools.pools);

  useEffect(() => {
    if (!urlJoinCode) {
      return;
    }
    dispatch(getUserPools({isActive: true, code: urlJoinCode}));
  }, [dispatch, urlJoinCode]);

  useEffect(() => {
    if (!urlJoinCode || _.isEmpty(userPools)) {
      return;
    }
    const poolArray = _.values(userPools);
    const match = _.find(poolArray, (p) => String(p.code || '').trim() === urlJoinCode);
    if (match && match.poolId) {
      const target = `/pools/${match.poolId}?joinCode=${encodeURIComponent(urlJoinCode)}&preview=1`;
      if (location.pathname !== `/pools/${match.poolId}`) {
        history.replace(target);
      }
    }
  }, [userPools, urlJoinCode, history, location.pathname]);

  function handleJoin(poolId, code) {
    dispatch(joinPool(poolId, code ? {code} : {}))
      .then(() => {
        history.push(`/pools/${poolId}?active=true`);
      })
      .catch(() => {});
  }

  function handleEnter(poolId) {
    history.push(`/pools/${poolId}?active=true`);
  }

  function handlePreview(poolId) {
    const qs = urlJoinCode ? `?preview=1&joinCode=${encodeURIComponent(urlJoinCode)}` : '?preview=1';
    history.push(`/pools/${poolId}${qs}`);
  }

  const PoolList = ({join, enter, preview, urlJoinCode: listJoinCode}) => {
    const poolsState = useSelector(state => state.pools.pools);
    const poolArray = _.values(poolsState);
    const poolNode = poolArray.map((pool) => (
      <Pool
        pool={pool}
        key={pool.poolId}
        join={join}
        enter={enter}
        preview={preview}
        urlJoinCode={listJoinCode}
      />
    ));
    return (<ul className="pool-list" style={{marginTop: '30px'}}>{poolNode}</ul>);
  };

  const SearchPools = () => {
    const [search, setSearch] = useState({searchType: 'public', code: ''});
    const [code, setCode] = useState('');
    const handleSetType = (event) => {
      const searchType = event.target.value;
      setSearch({searchType, code: ''});
      setCode('');
    };
    const handleSetCode = (event) => {
      setCode(event.target.value);
    };
    useEffect(() => {
      const {searchType, code: searchCode} = search;
      const isActive = searchType !== 'archive';
      if (searchType !== 'private' || !_.isEmpty(searchCode)) {
        dispatch(getUserPools({isActive, code: searchCode}));
      }
    }, [search, dispatch]);
    return (
      <div className="search-pools">
        <div onClick={handleSetType} className="search-type">
          <input className="hidden" name="radioGroup" readOnly=""
            checked={search.searchType === 'public'}
            type="radio" value="public" />
          <label>Public</label>
        </div>
        <div onClick={handleSetType} className="search-type">
          <input className="hidden" name="radioGroup" readOnly=""
            checked={search.searchType === 'archive'}
            type="radio" value="archive" />
          <label>Archive</label>
        </div>
        <div className="search-type search-type-private">
          <div onClick={handleSetType}>
            <input className="hidden" name="radioGroup" readOnly=""
              checked={search.searchType === 'private'}
              type="radio" value="private" />
            <label>Private</label>
          </div>
          {search.searchType === 'private' && (
            <div className="private-code">
              <input placeholder="Paste Code here" type="text" value={code} onChange={handleSetCode} />
              <button
                className="ui icon button"
                onClick={(event) => {
                  event.preventDefault();
                  setSearch(_.assign({}, search, {code}));
                }}
              >
                <i aria-hidden="true" className="search icon" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Pool = ({pool, join, enter, preview, urlJoinCode: listJoinCode}) => {
    const userId = _.get(getUserFromLocalStorage(), 'userId');
    const joined = _.find(pool.participates, {userId, joined: true});
    const poolIsOpen = moment(pool.lastCheckIn).isAfter(moment());
    const poolIsActive = pool.isActive;
    const poolCode = String(pool.code || '').trim();
    const codeMatchesUrl = listJoinCode && poolCode === listJoinCode;
    const showJoinBtn = !joined && poolIsOpen && poolIsActive && codeMatchesUrl;
    const showEnterBtn = joined && poolIsActive;
    const poolClass = classNames('pool', {
      'pool-closed': (!poolIsOpen && !joined) || !poolIsActive,
    });

    return (
      <li className={poolClass} key={pool.poolId}>
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
                onClick={() => join(pool.poolId, listJoinCode)}
              >
                Join
              </Button>
            )}
          </div>
        </div>
      </li>
    );
  };

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
