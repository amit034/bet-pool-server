import React from 'react';
import {withRouter} from 'react-router-dom';
import {getEvents} from '../actions/events';
import {connect} from 'react-redux';

class NewPool extends React.Component{
  constructor(props){
    super(props);
    this.handleAddEventToPool = this.handleAddEventToPool.bind(this);
  }
  // Lifecycle method

  componentDidMount(){
      this.props.dispatch(getEvents());
  }

  handleAddEventToPool(){

  }
  render(){
    const Title = ({eventCount}) => {
        return (
          <div>
             <div>
                <h1>Events ({eventCount})</h1>
             </div>
          </div>
        );
    };
    const EventList = ({events, handleAddEventToPool}) => {
        const eventNode = events.map((event) => {
            return (<Event event={event} key={event._id} handleAddEventToPool={handleAddEventToPool}/>)
        });
        return (<ul className="list-group" style={{marginTop: '30px'}}>{eventNode}</ul>);
    };
    const Event = ({event, remove}) => {
    return (<li><a href="#" className="list-group-item" onClick={() => {remove(event._id)}}>{event.name}</a></li>);
    }
    return (
      <div>
        <Title eventCount={this.props.events.events.length}/>
        {/*<TodoForm addTodo={this.addTodo.bind(this)}/>*/}
        <EventList
          events={this.props.events.events}
          addEventToPool={this.handleAddEventToPool}
        />
      </div>
    );
  }
}

export default withRouter(connect(({events}) => ({events}))(NewPool));