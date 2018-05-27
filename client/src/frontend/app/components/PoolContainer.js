import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getUserBets , updateUserBets} from '../actions/pools';
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
  onBetChange(betId, key, value){
        const update = {};
        update[betId] ={};
        update[betId][key] = value;
        this.setState(_.set(this.props.updates, `${betId}.${key}`, value));
  }
  submitBets(){
      updateUserBets(this.props.match.params.id, this.props.pools.bets);
  }

  render(){

    const GameList = ({bets}) => {
        const gameNode = bets.map((bet) => {
            return (<Game bet={bet} key={bet._id}/>)
        });
        return (<div><a onClick={this.submitBets}>Submit</a><ul className="list-group" style={{marginTop: '30px'}}>{gameNode}</ul></div>);
    };
    const Game = ({bet}) => {
    return (
            <li>
                <img width={"25px"} height={"18px"} src={bet.game.team1.flag} alt={bet.game.team1.name}/>
                <input onChange={(e) => this.onBetChange(bet._id, "score1", e.target.value)} value={bet.score1}></input>
                <span>{bet.game.playAt}</span>
                <input onChange={(e) => this.onBetChange(bet._id, "score2", e.target.value)}  value={bet.score2}></input>
                <img width={"25px"} height={"18px"} src={bet.game.team2.flag} alt={bet.game.team2.name}/>
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