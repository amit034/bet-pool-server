import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';
import classNames from "classnames";

const PoolsContainer = () => {
  const userPools = useSelector(state => state.pools.pools);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    dispatch(getUserPools());
  },[dispatch]);
  useEffect(() => {
    const activePools =_.filter(userPools, {isActive: true});
    // if (_.size(activePools) === 1) {
    //     handleEnter(_.get(_.first(activePools), 'poolId'));
    // }
  },[userPools]);

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
    const PoolList = ({pools, leave, join, enter}) => {
        const poolArray = _.values(pools);
        const poolNode = poolArray.map((pool) => {
            return (<Pool pool={pool} key={pool.poolId} leave={leave} join={join} enter={enter}/>)
        });
        return (<ul className="pool-list" style={{marginTop: '30px'}}>{poolNode}</ul>);
    };
    const Pool = ({pool, leave, join, enter}) => {
        const userId = _.get(getUserFromLocalStorage(), 'userId');
        const joined = _.find(pool.participates, {userId, joined: true});
        const actionObj = {action: () => {}, name: 'Closed'};
        const poolIsOpen = moment(pool.lastCheckIn).isAfter(moment());
        if (poolIsOpen || joined){
            _.assign(actionObj, {action: joined ? enter : join, name: joined ? 'Enter' : 'Join'});
        }
        const poolClass = classNames('pool', {
            'pool-closed': !poolIsOpen,
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
        <PoolList
          pools={userPools}
          auth={auth}
          leave={handleLeave.bind(this)}
          join={handleJoin.bind(this)}
          enter={handleEnter.bind(this)}
        />
        <NavigationMenu  />
      </div>
    );
  }

export default PoolsContainer;