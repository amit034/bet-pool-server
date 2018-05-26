import React from 'react';
import {withRouter} from 'react-router-dom';
import {getPoolGames} from '../actions/pools';
import {connect} from 'react-redux';

class PoolContainer extends React.Component{
  constructor(props){
    super(props);

  }
  // Lifecycle method

  componentDidMount(){
      this.props.dispatch(getPoolGames(this.props.match.params.id));
  }

  handleAddEventToPool(){

  }
  render(){

    const GameList = ({games}) => {
        const gameNode = games.map((game) => {
            return (<Game game={game} key={game._id}/>)
        });
        return (<ul className="list-group" style={{marginTop: '30px'}}>{gameNode}</ul>);
    };
    const Game = ({game}) => {
    return (<li>
                <span>{game.team1}</span>
                <span>{game.team2}</span>
            </li>);
    }
    return (
      <div>
        <GameList
          games={this.props.pools.games}
        />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(PoolContainer));