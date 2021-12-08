import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {getUserFromLocalStorage} from '../../actions/auth';

const PoolsContainer = (props) => {
  const userPools = useSelector(state => state.pools.pools);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserPools());
  },[dispatch]);

  function handleLeave(id) {
    // Filter all todos except the one to be removed
    const remainder = this.state.data.filter((pool) => {
      if(pool.id !== id) {
          return pool;
      }
    });

    axios.delete(this.apiUrl+'/'+id)
      .then(() => {
        this.setState({data: remainder});
      });
  }
  function handleJoin(id){
      props.dispatch(joinPool(id), () => handleEnter(id));
  }
  function handleEnter(id){
      props.history.push(`/pools/${id}?active=true`);
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
            return (<Pool pool={pool} key={pool.id} leave={leave} join={join} enter={enter}/>)
        });
        return (<ul className="pool-list" style={{marginTop: '30px'}}>{poolNode}</ul>);
    };
    const Pool = ({pool, leave, join, enter}) => {
        const userId = _.get(getUserFromLocalStorage(), 'userId');
        const joined = _.find(pool.participates, {userId, joined: true});
        const actionObj = {action: () => {}, name: 'Closed'};
        if (moment(pool.lastCheckIn).isAfter(moment()) || joined){
            _.assign(actionObj, {action: joined ? enter : join, name: joined ? 'Enter' : 'Join'});
        }
        return (<li className="pool" key={pool.id} onClick={() => { return actionObj.action(pool.id)}}>
            <div className= 'pool-left-side'>
                <div className='pool-left-title'>{pool.name}</div>
                <div className='pool-left-side-center'>
                    <div className='pool-left-detail'>
                        <div className='pool-left-detail-header'>Players</div>
                        <div className='pool-left-detail-value'>{_.size(pool.participates)}</div>
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
                <div className='pool-right-detail-value'>{moment(pool.lastCheckIn).format('DD/MM/YY hh:mm')}</div>
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