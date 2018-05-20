import React from 'react';
class PoolContainer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
    this.apiUrl = 'http://localhost:3000/pools'
  }
  // Lifecycle method
  componentDidMount(){
    // Make HTTP reques with Axios
    axios.get(this.apiUrl)
      .then((res) => {
        // Set state with result
        this.setState({data:res.data});
      });
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
    return (
      <div>
        <Title poolCount={this.state.data.length}/>
        {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
        <PoolList
          pools={this.state.data}
          leave={this.handleLeave.bind(this)}
        />
      </div>
    );
  }
}

export default PoolContainer;