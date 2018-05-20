import React from 'react';
import {withRouter} from 'react-router-dom';
import {getUserPools} from '../actions/pools';
import {connect} from 'react-redux';

class PoolContainer extends React.Component{
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
    const PoolList = ({pools, leave}) => {
        const poolNode = pools.map((pool) => {
            return (<Pool pool={pool} key={pool._id} leave={leave} />)
        });
        return (<div className="list-group" style={{marginTop: '30px'}}>{poolNode}</div>);
    };
    const Pool = ({pool, remove}) => {
    return (<a href="#" className="list-group-item" onClick={() => {remove(pool._id)}}>{pool.name}</a>);
    }
    return (
      <div>
        <Title poolCount={this.props.pools.pools.length}/>
        {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
        <PoolList
          pools={this.props.pools.pools}
          leave={this.handleLeave.bind(this)}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(PoolContainer));