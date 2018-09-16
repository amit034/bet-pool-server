import React from 'react';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import {getUserPools, joinPool} from '../actions/pools';
import {getUserFromLocalStorage} from '../actions/auth';
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
      this.props.dispatch(joinPool(id), );
  }
  handleEnter(id){
      this.props.history.push(`/pools/${id}`);
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

        const poolNode = pools.map((pool) => {
            return (<Pool pool={pool} key={pool._id} leave={leave} join={join} enter={enter}/>)
        });
        return (<ul className="pool-list" style={{marginTop: '30px'}}>{poolNode}</ul>);
    };
    const Pool = ({pool, leave, join, enter}) => {
        const userId = _.get(getUserFromLocalStorage(), 'userId');
        const joined = _.find(pool.participates, (participate) => participate.user === userId && participate.joined);
        const actionObj = {action: () => {}, name: 'Closed'};
        if (moment(pool.lastCheckIn).isAfter(moment())){
            _.assign(actionObj, {action: joined ? enter : join, name: joined ? 'Enter' : 'Join'});
        }
        return (<li className="pool">
            <div className="pool-header">
            </div>
            <div className="pool-body">
                <div className="pool-side">
                    <img  className="pool-image" src={pool.image}/>
                </div>
                <div className="pool-center">
                    <div>
                        <div className="pool-title">{pool.name}</div>
                        <div className="pool-buy-in">
                            <span>{pool.buyIn}&#8362;</span>
                            <div className="pool-last-check-in">
                                <label>Check-in DeadLine: </label>
                                <span>{moment(pool.lastCheckIn).format('DD/MM/YY hh:mm')}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="pool-players">
                            <label>Players: </label>
                            <span>{_.size(pool.participates)}</span>
                        </div>
                        <div className="pool-pot">
                            <label>Pot: </label>
                            <span>{pool.pot}&#8362;</span>
                        </div>
                        <div className="pool-first-price">
                            <label>First Price: </label>
                            <span>{_.first(pool.prices)}&#8362;</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pool-footer">
                <div className="pool-action"><a onClick={() => { return actionObj.action(pool._id)}}>{actionObj.name}</a></div>
            </div>
            {/*<a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${pool._id}`)}>{pool.name}</a>*/}
        </li>);
        };
    return (
      <div>
        {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
        {/*<a className="list-group" style={{marginTop: '30px'}} onClick={() =>  this.props.history.push('/newPool')}>AddPool</a>*/}
        <PoolList
          pools={this.props.pools.pools}
          auth={this.props.auth}
          leave={this.handleLeave.bind(this)}
          join={this.handleJoin.bind(this)}
          enter={this.handleEnter.bind(this)}
        />

      </div>
    );
  }
}

export default withRouter(connect(({pools , auth}) => ({pools}))(PoolsContainer));