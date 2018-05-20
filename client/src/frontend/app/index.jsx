import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter } from 'react-router-dom';
import App from "./components/App";
import rootReducer from './reducers'
import thunk from 'redux-thunk';
const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);
// const Title = ({poolCount}) => {
//   return (
//     <div>
//        <div>
//           <h1>pools ({poolCount})</h1>
//        </div>
//     </div>
//   );
// }
//
// const NewForm = ({addTodo}) => {
//   // Input Tracker
//   let input;
//   // Return JSX
//   return (
//     <form onSubmit={(e) => {
//         e.preventDefault();
//         addTodo(input.value);
//         input.value = '';
//       }}>
//       <input className="form-control col-md-12" ref={node => {
//         input = node;
//       }} />
//       <br />
//     </form>
//   );
// };
//
// const Pool = ({todo, remove}) => {
//   // Each Todo
//   return (<a href="#" className="list-group-item" onClick={() => {remove(todo.id)}}>{todo.text}</a>);
// }
//
// const PoolList = ({pools, leave}) => {
//   const poolNode = pools.map((pool) => {
//     return (<Pool pool={pool} key={pool.id} leave={leave}/>)
//   });
//   return (<div className="list-group" style={{marginTop:'30px'}}>{poolNode}</div>);
// }
//
// // Contaner Component
// // pool Id
// window.id = 0;
// class BetPoolApp extends React.Component{
//   constructor(props){
//     // Pass props to parent class
//     super(props);
//     // Set initial state
//     this.state = {
//       data: []
//     }
//     this.apiUrl = 'http://localhost:3000/pools'
//   }
//   // Lifecycle method
//   componentDidMount(){
//     // Make HTTP reques with Axios
//     axios.get(this.apiUrl)
//       .then((res) => {
//         // Set state with result
//         this.setState({data:res.data});
//       });
//   }
//
//   addTodo(val){
//     // Assemble data
//     const todo = {text: val};
//     // Update data
//     axios.post(this.apiUrl, todo)
//        .then((res) => {
//           this.state.data.push(res.data);
//           this.setState({data: this.state.data});
//        });
//   }
//   // Handle remove
//   handleLeave(id){
//     // Filter all todos except the one to be removed
//     const remainder = this.state.data.filter((pool) => {
//       if(pool.id !== id) return pool;
//     });
//     // Update state with filter
//     axios.delete(this.apiUrl+'/'+id)
//       .then((res) => {
//         this.setState({data: remainder});
//       })
//   }
//
//   render(){
//     return (
//       <div>
//         <Title poolCount={this.state.data.length}/>
//         {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
//         <PoolList
//           pools={this.state.data}
//           leave={this.handleLeave.bind(this)}
//         />
//       </div>
//     );
//   }
// }
render(<MuiThemeProvider muiTheme={getMuiTheme()}><BrowserRouter><Provider store={store}><App /></Provider></BrowserRouter></MuiThemeProvider>, document.getElementById('app'));