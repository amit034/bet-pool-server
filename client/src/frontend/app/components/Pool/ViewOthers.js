import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import NavigationMenu from './NavigationMenu';
import {withRouter} from 'react-router-dom';
import {getChallengeParticipates} from '../../actions/pools';
import {connect} from 'react-redux';
import classNames from 'classnames';

class ViewOthers extends React.Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){
      this.props.dispatch(getChallengeParticipates(this.props.match.params.id, this.props.match.params.challengeId));
  }

  render(){
    const BetsList = ({usersBets, participates}) => {
        const userBetsrNode = _.map( _.orderBy(participates, 'score', 'desc'), (participate) => {
            return (<UserBet participate={participate} key={participate.id} bet={_.find(usersBets, {participate: participate.id}) || {}} />)
        });
        return (<div><ul className="users-bets-list" style={{marginTop: '30px'}}>{userBetsrNode}</ul></div>);
    };
  const MatchResult = ({result, closed}) => {
      const className = classNames('match-tip-image circular teal icon link small fitted', {'users': closed, 'lightbulb': !closed});
      return (<div className="game-result">
          <div className="match-result">{result.score1} : {result.score2}</div>
          </div>);
  };
  const TeamScore = ({team: {flag, name}, reverse}) => {
      const className = classNames('team-score', {'team-reverse': reverse});
      return (<div className={className}>
          <div className="team-details">
              <img className="team-flag" src={flag} alt={name} title={name} />
              <span className="team-name">{name}</span>
          </div>
      </div>);
  };
    const ChallengeDetails = ({challenge}) => {
        const {id: challengeId, result, game: {team1, team2}, playAt} = challenge;
        return (<li className="challenge-row" key={challengeId}>
            <div className="game-title">
                <div className="game-day">{moment(playAt).format('ddd DD/MM')}</div>
                <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                <div className="game-more"></div>
            </div>
            <div className="game-body">
                <TeamScore team={team1}/>
                <MatchResult result={result} />
                <TeamScore team={team2} reverse={true} />
            </div>

        </li>);
    };
    const UserBet = ({participate, bet}) => {
    return (
            <li className="user-bet-row">
                <div className="user-bet-body">
                    <div className="user-bet-side">
                        <img className="user-bet-image" src={participate.picture} alt={participate.username} title={participate.username}/>
                    </div>
                    <div className="user-bet-center">
                        <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                        <div className="user-bet-score1">{bet.score1}</div>
                        <div className="user-bet-score2">{bet.score2}</div>
                    </div>
                </div>
            </li>);
    };
    return (
      <div id="content" class="ui container">
        {this.props.challenge ?  <ChallengeDetails challenge={this.props.challenge} /> : ''}
        <BetsList
            usersBets={this.props.usersBets}
            participates={this.props.participates}
        />
        <NavigationMenu  />
      </div>
    );
  }
}

export default withRouter(connect(({pools: {participates, otherBets : {challenge, usersBets}}}) => {
    return {challenge, usersBets, participates}
})(ViewOthers));