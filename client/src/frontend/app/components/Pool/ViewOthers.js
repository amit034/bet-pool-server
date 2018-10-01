import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates} from '../../actions/pools';
import {connect} from 'react-redux';

class ViewOthers extends React.Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){
      this.props.dispatch(getPoolParticipates(this.props.match.params.id, this.props.match.params.challengeId));
  }

  render(){
    const BetsList = ({participates}) => {
        const userBets = _.orderBy(participates, 'score', 'desc');
        const userBetsrNode = _.map(userBets, (participate) => {
            return (<UserBet participate={participate} key={participate._id}/>)
        });
        return (<div><ul className="users-bets-list" style={{marginTop: '30px'}}>{userBetsrNode}</ul></div>);
    };
    const UserBet = ({participate}) => {
    return (
            <li className="user-bet-row">
                <div className="user-bet-body">
                    <div className="user-bet-side">
                        <img className="user-bet-image" src={participate.picture} alt={participate.username} title={participate.username}/>
                    </div>
                    <div className="user-bet-center">
                        <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                        <div className="user-bet-score1">{participate.score1}</div>
                        <div className="user-bet-score2">{participate.score2}</div>
                    </div>
                </div>
            </li>);
    };
    return (
      <div>
        <a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}`)}>Back to Bets</a>
        <BetsList
            participates={this.props.pools.participates}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(ViewOthers));