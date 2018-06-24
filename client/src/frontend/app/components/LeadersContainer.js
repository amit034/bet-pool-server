import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates} from '../actions/pools';
import {connect} from 'react-redux';

class LeadersContainer extends React.Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){
      this.props.dispatch(getPoolParticipates(this.props.match.params.id));
  }

  render(){
    const LeaderList = ({participates}) => {
        const leaders = _.orderBy(participates, 'score', 'desc');
        const LeaderNode = _.map(leaders, (participate) => {
            return (<Leader participate={participate} key={participate._id}/>)
        });
        return (<div><ul className="list-group" style={{marginTop: '30px'}}>{LeaderNode}</ul></div>);
    };
    const Leader = ({participate}) => {
    return (
            <li>
                <img width={"25px"} height={"18px"} src={participate.img} alt={participate.username} title={participate.username}/>
                <span>{participate.username}</span>
                <span>{participate.score}</span>
            </li>);
    };
    return (
      <div>
        <LeaderList
            participates={this.props.pools.participates}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(LeadersContainer));