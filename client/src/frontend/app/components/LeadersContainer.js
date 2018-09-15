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
        return (<div><ul className="leader-list" style={{marginTop: '30px'}}>{LeaderNode}</ul></div>);
    };
    const Leader = ({participate}) => {
    return (
            <li className="leader-row">
                <div className="leader-body">
                    <div className="leader-side">
                        <img className="leader-image" src={participate.picture} alt={participate.username} title={participate.username}/>
                    </div>
                    <div className="leader-center">
                        <div className="leader-name">{participate.firstName} {participate.lastName}</div>
                        <div className="leader-score">{participate.score}</div>
                    </div>
                </div>
            </li>);
    };
    return (
      <div>
        <a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}`)}>Back to Bets</a>
        <LeaderList
            participates={this.props.pools.participates}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(LeadersContainer));