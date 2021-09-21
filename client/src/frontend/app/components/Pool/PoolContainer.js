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
      this.props.dispatch(getUserBets(this.props.match.params.id));
      //this.props.dispatch(getPoolParticipates(this.props.match.params.id));
  }
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.bets && (nextProps.bets !== this.props.bets)) {
  //       this.setState({
  //           updates: nextProps.bets
  //       }, () => {
  //           //this.props.dispatch(clearFocused());
  //       });
  //   }
  // }
   // shouldComponentUpdate(nextProps, nextState){
   //    return !_.isEqual(_.get(nextProps, 'bets'), _.get(this.props, 'bets')) || !_.isEqual(this.state, nextState); // equals() is your implementation
    // }
  onBetKetChange(challengeId, key, value){
     //this.setState(_.set(this.state.updates, `${challengeId}.${key}`, _.toString(value)), () => {
        const bet = _.get(this.props.bets, challengeId);
        _.set(bet, key, value);
        this.props.dispatch(updateUserBet(this.props.match.params.id , challengeId, bet))
    // });
  }
   onBetChange(challengeId, updatedBet){
     //this.setState(_.set(this.state.updates, `${challengeId}.${key}`, _.toString(value)), () => {
        const bet = _.get(this.props.bets, challengeId);
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        this.props.dispatch(updateUserBet(this.props.match.params.id , challengeId, bet))
    // });
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
      const {bets} = this.props;
    //
    // const GameList = ({bets}) => {
    //     const betsGroups = _.groupBy(bets, 'challenge.game.round');
    //     const roundNode = _.map(betsGroups, (roundBets, round) => {
    //         let currentDate = null;
    //         const gameNodes = roundBets.map((bet) => {
    //            const gameNode = <Game bet={bet} key={bet.id} showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')}/>;
    //            currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
    //            return (gameNode);
    //         });
    //         return (<li><span className="round-title">Round No: {round}</span><ul className="round-games">{gameNodes}</ul></li>);
    //     });
    //
    //     return (<div><a onClick={this.submitBets}>Submit</a><a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}/participates`)}>Leaders</a><ul className="game-list" style={{marginTop: '30px'}}>{roundNode}</ul></div>);
    // };
    // const BetPad = ({betId, currentScore, betFieldName}) => {
    //     const betPadNodes = _.map(_.range(10), (score)=> {
    //         const className = classNames('bet-pad-score', {'bet-pad-score-selected': score === _.parseInt(currentScore)});
    //         <span className={className} onClick={() => this.onBetChange(betId, betFieldName, score)}>{score}</span>
    //     });
    //     return (<div className="bet-pad">{betPadNodes}</div>)
    // };
    // const Game = ({bet, key, showDay}) => {
    // const {score1, score2, challenge: {result, game: {team1, team2}, playAt}, closed } = bet;
    // return (<li className="game-row" key={key}>
    //         <div className="game-title">
    //             <div className="game-day">{showDay ? moment(playAt).format('ddd DD/MM'): ''}</div>
    //             <div className="game-hour">{moment(playAt).format('H:mm')}</div>
    //         </div>
    //         <div className="game-body">
    //             <TeamScore team={team1} teamBet={score1} closed={closed} betId={bet.id} betFieldName="score1"/>
    //             <MatchResult result={result} closed={closed}/>
    //             <TeamScore team={team2} teamBet={score2} closed={closed} betId={bet.id} betFieldName="score2" reverse={true}/>
    //         </div>
    //
    // </li>);
    // // return (
    // //         <li>
    // //             <img width={"25px"} height={"18px"} src={team1.flag} alt={team1.name} title={team1.name}/>
    // //             <input onChange={(e) => this.onBetChange(bet.id, "score1", e.target.value)} value={score1} disabled={closed}></input>
    // //             <span>{moment(playAt).format('hh:mm')}</span>
    // //             <input onChange={(e) => this.onBetChange(bet.id, "score2", e.target.value)}  value={score2} disabled={closed}></input>
    // //             <img width={"25px"} height={"18px"} src={team2.flag} alt={team2.name} title={team2.name}/>
    // //             <span>{score1}</span>
    // //             <span>{score2}</span>
    // //         </li>);
    // };
    // const MatchResult = ({result, closed}) => {
    //     return (<div className="game-result">{result.score1} : {result.score2}</div>);
    // };
    // const TeamScore = ({team: {flag, name}, teamBet, closed, betId, betFieldName, reverse}) => {
    //     const className = classNames('team-score', {'team-reverse': reverse});
    //     return (<div className={className}>
    //         <div className="team-details">
    //             <img className="team-flag" src={flag} alt={name} title={name}/>
    //             <span className="team-name">{name}</span>
    //         </div>
    //         <div className="team-bet">
    //             <input onChange={(e) => this.onBetChange(betId, betFieldName, e.target.value)} value={teamBet} disabled={closed}></input>
    //         </div>
    //         {/*<div className="team-result">*/}
    //             {/*<span>{teamScore}</span>*/}
    //         {/*</div>*/}
    //     </div>);
    // };
    return (<div id="content" class="ui container">
        {/*<a onClick={this.submitBets}>Submit</a>*/}
        {/*<a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}/participates`)}>See Leaders</a>*/}
        <GameList bets={bets} poolId={this.props.match.params.id} onBetChange={this.onBetChange} onBetKetChange={this.onBetKetChange} onShowOthers ={this.onShowOthers} onBetFocused={this.onBetFocused} />
        <BetPad focused={this.props.focused} onBetChange={this.onBetChange}/>
        <NavigationMenu  />
    </div>);

  }
}

function mapStateToProps({pools: {bets}, betPad}) {
    return {
        bets,
        focused: betPad
    }
}

export default withRouter(connect((mapStateToProps))(PoolContainer));