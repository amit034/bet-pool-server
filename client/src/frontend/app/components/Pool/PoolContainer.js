import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates, getUserBets, updateUserBet, updateUserBets} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {clearFocused, setFocused} from '../../actions/betPad';
import {connect} from 'react-redux';
import GameList from './GameList/GameList';
import BetPad from './GameList/BetPad';

class PoolContainer extends React.Component{
  constructor(props){
    super(props);
      this.submitBets = this.submitBets.bind(this);
      this.onBetChange = this.onBetChange.bind(this);
      this.onBetKetChange = this.onBetKetChange.bind(this);
      this.onBetFocused= this.onBetFocused.bind(this);
      this.onShowOthers = this.onShowOthers.bind(this);
      this.state ={
          updates: {}
      }
  }
  // Lifecycle method

  componentDidMount(){
      const {dispatch, match, socket} = this.props;
      const poolId = match.params.id;
      dispatch(getUserBets(poolId));
      socket.emit('joinPool', poolId);
      //dispatch(getPoolParticipates(poolId));
  }
  componentWillUnmount() {
      const {match, socket} = this.props;
      const poolId = match.params.id;
      socket.emit('leavePool', poolId);
  }

  onBetKetChange(challengeId, key, value){
        const bet = _.get(this.props.bets, challengeId);
        _.set(bet, key, value);
        this.props.dispatch(updateUserBet(this.props.match.params.id , challengeId, bet))

  }
   onBetChange(challengeId, updatedBet){
        const bet = _.get(this.props.bets, challengeId);
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        this.props.dispatch(updateUserBet(this.props.match.params.id , challengeId, bet))
  }
  onShowOthers(challengeId){
      this.props.history.push(`/pools/${this.props.match.params.id}/challenges/${challengeId}/participates`);
  }
  onBetFocused(e, betId, betFieldName){
      this.props.dispatch(setFocused(betId, e.target.value, e.target.offsetTop, betFieldName));
  }
  submitBets(){
      this.props.dispatch(updateUserBets(this.props.match.params.id, this.props.bets));
  }

  render(){
    return (<div id="content" className="ui container">
        <GameList poolId={this.props.match.params.id} onBetChange={this.onBetChange} onBetKeyChange={this.onBetKetChange} onShowOthers ={this.onShowOthers} onBetFocused={this.onBetFocused} />
        <BetPad focused={this.props.focused} onBetChange={this.onBetChange}/>
        <NavigationMenu  />
    </div>);

  }
}

function mapStateToProps({pools: {bets}}) {
    return {
        bets
    }
}

export default withRouter(connect((mapStateToProps))(PoolContainer));