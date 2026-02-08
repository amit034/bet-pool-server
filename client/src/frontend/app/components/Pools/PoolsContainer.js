import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';
import classNames from "classnames";
import {Form, Radio} from "semantic-ui-react";

const PoolsContainer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    dispatch(getUserPools());
  },[dispatch]);

  function handleLeave(id) {

  }
  function handleJoin(id){
      dispatch(joinPool(id));
  }
  function handleEnter(id){
      history.push(`/pools/${id}?active=true`);
  }

    const Title = ({poolCount}) => {
        return (
          <div>
             <div>
                <h1>pools ({poolCount})</h1>
             </div>
          </div>
        );
    };
    const PoolList = ({leave, join, enter}) => {
        const userPools = useSelector(state => state.pools.pools);
        const poolArray = _.values(userPools);
        useEffect(() => {
            const activePools =_.filter(userPools, {isActive: true});
            // if (_.size(activePools) === 1) {
            //     enter(_.get(_.first(activePools), 'poolId'));
            // }
        },[userPools]);
        const poolNode = poolArray.map((pool) => {
            return (<Pool pool={pool} key={pool.poolId} leave={leave} join={join} enter={enter}/>)
        });
        return (<ul className="pool-list" style={{marginTop: '30px'}}>{poolNode}</ul>);
    };

    const SearchPools = () => {
        const [search, setSearch] = useState({searchType: 'public', code: ''});
        const [code, setCode] =  useState('');
        const handleSetType = (event) => {
            const searchType = event.target.value;
            setSearch({searchType, code: ''});
            setCode('');

        }
        const handleSetCode = (event) => {
            const code = event.target.value;
            setCode(code);
        }
        useEffect(() => {
            const {searchType, code} = search;
            const isActive = searchType !== 'archive';
            if (searchType !== 'private' || !_.isEmpty(code)) {
                dispatch(getUserPools({isActive, code}));
            }
        },[search]);
        return <div className="search-pools">
              <div onClick={handleSetType} className="search-type" >
                  <input className="hidden" name="radioGroup" readOnly=''
                         checked={search.searchType === 'public'}
                         type="radio" value="public" />
                  <label>Public</label>
              </div>
              <div onClick={handleSetType} className="search-type">
                  <input className="hidden" name="radioGroup" readOnly=''
                         checked={search.searchType === 'archive'}
                         type="radio" value="archive" />
                  <label>Archive</label>
              </div>
              <div className="search-type search-type-private">
                  <div  onClick={handleSetType} ><input className="hidden" name="radioGroup" readOnly=''
                              checked={search.searchType === 'private'}
                              type="radio" value="private" />
                      <label>Private</label></div>
                  {search.searchType === 'private' && <div className='private-code'>
                      <input placeholder="Paste Code here" type="text" value={code} onChange={handleSetCode}/>
                      <button className="ui icon button" onClick={(event) => {
                          event.preventDefault();
                          setSearch(_.assign({}, search, {code}));
                      }}>
                          <i aria-hidden="true" className="search icon"></i>
                      </button>
                  </div>}
              </div>
      </div>
    }
    const Pool = ({pool, leave, join, enter}) => {
        const userId = _.get(getUserFromLocalStorage(), 'userId');
        const joined = _.find(pool.participates, {userId, joined: true});
        const actionObj = {action: () => {}, name: 'Closed'};
        const poolIsOpen = moment(pool.lastCheckIn).isAfter(moment());
        const poolIsActive = pool.isActive;
        if (poolIsOpen || joined){
            _.assign(actionObj, {action: joined ? enter : join, name: joined ? 'Enter' : 'Join'});
        }
        const poolClass = classNames('pool', {
            'pool-closed': (!poolIsOpen && !joined) || !poolIsActive,
        });
        return (<li className={poolClass} key={pool.poolId} onClick={() => { return actionObj.action(pool.poolId)}}>
            <div className= 'pool-left-side'>
                <div className='pool-left-title'>{pool.name}</div>
                <div className='pool-left-side-center'>
                    <div className='pool-left-detail'>
                        <div className='pool-left-detail-header'>Players</div>
                        <div className='pool-left-detail-value'>{_.size(_.reject(pool.participates, {isBot: true}))}</div>
                    </div>
                    <div className='pool-left-detail'>
                        <div className='pool-left-detail-header'>Pot</div>
                        <div className='pool-left-detail-value'>{pool.pot} NIS</div>
                    </div>
                    <div className='pool-left-detail'>
                        <div className='pool-left-detail-header'>First Price</div>
                        <div className='pool-left-detail-value'>{_.first(pool.prices)} NIS</div>
                    </div>
                </div>
            </div>
            <div className= 'pool-right-side'>
                <div className='pool-right-title'><img  className="pool-image" src={pool.image}/></div>
                <div className='divider' ></div>
                <div className='pool-right-detail-value'>{pool.buyIn} NIS</div>
                <div className='pool-right-detail-value' style={{fontWeight: 100}}>Check-in DeadLine</div>
                <div className='pool-right-detail-value'>{moment(pool.lastCheckIn).format('DD/MM/YY HH:mm')}</div>
            </div>

        </li>);
        };
    return (
      <div id="content" className="ui container">
        <SearchPools />
        <PoolList
          leave={handleLeave.bind(this)}
          join={handleJoin.bind(this)}
          enter={handleEnter.bind(this)}
        />
        <NavigationMenu  />
      </div>
    );
  }

export default PoolsContainer;