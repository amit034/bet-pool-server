import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getUserBets , updateUserBets, updateUserBet} from '../actions/pools';
import {connect} from 'react-redux';

class PoolContainer extends React.Component{
  constructor(props){
    super(props);
      this.submitBets = this.submitBets.bind(this);
      this.onBetChange = this.onBetChange.bind(this);
      this.state = {
          updates: {}
      }
  }
  // Lifecycle method
  componentDidMount(){
      this.props.dispatch(getUserBets(this.props.match.params.id));
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.pools.bets) {
      this.setState({
        updates: _.keyBy(nextProps.pools.bets, '_id')
      });
    }
  }
  onBetChange(betId, key, value){
        this.setState(_.set(this.state.updates, `${betId}.${key}`, value));
        this.props.dispatch(updateUserBet(this.props.match.params.id, this.state.updates[betId]))
  }
  submitBets(){
      this.props.dispatch(updateUserBets(this.props.match.params.id, this.props.pools.bets));
  }

  render(){

    const GameList = ({bets}) => {
        const gameNode = bets.map((bet) => {
            return (<Game bet={bet} key={bet._id}/>)
        });
        return (<div><a onClick={this.submitBets}>Submit</a><a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}/participates`)}>Leaders</a><ul className="list-group" style={{marginTop: '30px'}}>{gameNode}</ul></div>);
    };
    const Game = ({bet}) => {
    return (
            <li>
                <img width={"25px"} height={"18px"} src={bet.challenge.game.team1.flag} alt={bet.challenge.game.team1.name} title={bet.challenge.game.team1.name}/>
                <input onChange={(e) => this.onBetChange(bet._id, "score1", e.target.value)} value={bet.score1}></input>
                <span>{bet.challenge.game.playAt}</span>
                <input onChange={(e) => this.onBetChange(bet._id, "score2", e.target.value)}  value={bet.score2} ></input>
                <img width={"25px"} height={"18px"} src={bet.challenge.game.team2.flag} alt={bet.challenge.game.team2.name} title={bet.challenge.game.team2.name}/>
                <span>{bet.challenge.game.score1}</span>
                <span>{bet.challenge.game.score2}</span>
            </li>);
    }
    return (
      <div>
        <GameList
            bets={this.props.pools.bets}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(PoolContainer));