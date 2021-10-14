import React from 'react';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import {getUserPools, joinPool} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import { Button, Form, Grid, Header, Image, Message, Segment, Col } from 'semantic-ui-react'
import {getUserFromLocalStorage} from '../../actions/auth';
import {connect} from 'react-redux';

class PoolsContainer extends React.Component{
  constructor(props){
    super(props);
  }
  // Lifecycle method

  componentDidMount(){
      this.props.dispatch(getUserPools());
  }

  // addTodo(val){
  //   // Assemble data
  //   const todo = {text: val};
  //   // Update data
  //   axios.post(this.apiUrl, todo)
  //      .then((res) => {
  //         this.state.data.push(res.data);
  //         this.setState({data: this.state.data});
  //      });
  // }
  // Handle remove
  handleLeave(id){
    // Filter all todos except the one to be removed
    const remainder = this.state.data.filter((pool) => {
      if(pool.id !== id) return pool;
    });
    // Update state with filter
    axios.delete(this.apiUrl+'/'+id)
      .then((res) => {
        this.setState({data: remainder});
      })
  }
  handleJoin(id){
      this.props.dispatch(joinPool(id), () => this.handleEnter(id));
  }
  handleEnter(id){
      this.props.history.push(`/pools/${id}?active=true`);
  }
  render(){
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
        const poolArray = _.concat(_.values(pools), _.values(pools), _.values(pools));
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
            <div className= 'pool-right-side'>
                <div className='pool-right-title'><img  className="pool-image" src={pool.image}/></div>
                <div className='divider' ></div>
                <div className='pool-right-detail-value'>{pool.buyIn} NIS</div>
                <div className='pool-right-detail-value' style={{fontWeight: 100}}>Check-in DeadLine</div>
                <div className='pool-right-detail-value'>{moment(pool.lastCheckIn).format('DD/MM/YY hh:mm')}</div>
            </div>

            {/*<div className="pool-header">*/}
            {/*</div>*/}
            {/*<div className="pool-body">*/}
            {/*    <div className="pool-side">*/}
            {/*        <img  className="pool-image" src={pool.image}/>*/}
            {/*    </div>*/}
            {/*    <div className="pool-center">*/}
            {/*        <div>*/}
            {/*            <div className="pool-title">{pool.name}</div>*/}
            {/*            <div className="pool-buy-in">*/}
            {/*                <span>{pool.buyIn}&#8362;</span>*/}
            {/*                <div className="pool-last-check-in">*/}
            {/*                    <label>Check-in DeadLine: </label>*/}
            {/*                    <span>{moment(pool.lastCheckIn).format('DD/MM/YY hh:mm')}</span>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div>*/}
            {/*            <div className="pool-players">*/}
            {/*                <label>Players: </label>*/}
            {/*                <span>{_.size(pool.participates)}</span>*/}
            {/*            </div>*/}
            {/*            <div className="pool-pot">*/}
            {/*                <label>Pot: </label>*/}
            {/*                <span>{pool.pot}&#8362;</span>*/}
            {/*            </div>*/}
            {/*            <div className="pool-first-price">*/}
            {/*                <label>First Price: </label>*/}
            {/*                <span>{_.first(pool.prices)}&#8362;</span>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="pool-footer">*/}
            {/*    <div className="pool-action"><a onClick={() => { return actionObj.action(pool.id)}}>{actionObj.name}</a></div>*/}
            {/*</div>*/}
            {/*<a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${pool.id}`)}>{pool.name}</a>*/}
        </li>);
        };
    return (
      <div id="content" class="ui container">
        {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
        {/*<a className="list-group" style={{marginTop: '30px'}} onClick={() =>  this.props.history.push('/newPool')}>AddPool</a>*/}
        <PoolList
          pools={this.props.pools}
          auth={this.props.auth}
          leave={this.handleLeave.bind(this)}
          join={this.handleJoin.bind(this)}
          enter={this.handleEnter.bind(this)}
        />
        <NavigationMenu  />
      </div>
    );
  }
}
function mapStateToProps({pools: {pools}, auth}) {
    return {auth, pools};
}

export default withRouter(connect((mapStateToProps))(PoolsContainer));