import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';

class GameList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onBetChange = this.onBetChange.bind(this);
    }

    onBetChange(betId, betFieldName, score){
        this.props.onBetChange(betId, betFieldName, score);
    }
    shouldComponentUpdate(nextProps, nextState){
      return !_.isEqual(_.get(nextProps, 'bets'), _.get(this.props, 'bets')); // equals() is your implementation
    }
    render() {
        const {bets} = this.props;
        const currentBet = _.find(bets, (bet) => {
                    return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
                });
        const currentRound = _.get(currentBet, 'challenge.game.round', 1);
        const betsGroups = _.groupBy(bets, 'challenge.game.round');
        // const BetPad = ({focused}) => {
        //     if (focused)
        //     const betPadNodes = _.map(_.range(10), (score) => {
        //         const className = classNames('bet-pad-score', {'bet-pad-score-selected': score === _.parseInt(currentScore)});
        //         <span className={className} onClick={() => this.onBetChange(betId, betFieldName, score)}>{score}</span>
        //     });
        //     return (<div className="bet-pad">{betPadNodes}</div>)
        // };
        const Game = ({bet, key, showDay}) => {
            const {score1, score2, challenge: {result, game: {team1, team2}, playAt}, closed} = bet;
            return (<li className="game-row" key={key}>
                <div className="game-title">
                    <div className="game-day">{showDay ? moment(playAt).format('ddd DD/MM') : ''}</div>
                    <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                </div>
                <div className="game-body">
                    <TeamScore team={team1} teamBet={score1} closed={closed} betId={bet._id} betFieldName="score1"/>
                    <MatchResult result={result} closed={closed}/>
                    <TeamScore team={team2} teamBet={score2} closed={closed} betId={bet._id} betFieldName="score2"
                               reverse={true} />
                </div>

            </li>);
        };
        const MatchResult = ({result, closed}) => {
            return (<div className="game-result">{result.score1} : {result.score2}</div>);
        };
        const TeamScore = ({team: {flag, name}, teamBet, closed, betId, betFieldName, reverse}) => {
            const className = classNames('team-score', {'team-reverse': reverse});
            return (<div className={className}>
                <div className="team-details">
                    <img className="team-flag" src={flag} alt={name} title={name} />
                    <span className="team-name">{name}</span>
                </div>
                <div className="team-bet">
                    <input onChange={(e) => this.props.onBetChange(betId, betFieldName, e.target.value)} value={teamBet || ''}
                           disabled={closed}></input>
                </div>
                {/*<div className="team-result">*/}
                {/*<span>{teamScore}</span>*/}
                {/*</div>*/}
            </div>);
        };

        const roundNode = _.map(_.pickBy(betsGroups, (value, key) => key >= currentRound), (roundBets, round) => {
            let currentDate = null;
            const gameNodes = roundBets.map((bet) => {
                const gameNode = <Game bet={bet} key={bet._id}
                                       showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')} />;
                currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
                return (gameNode);
            });
            return (<li key={round}>
                    <span className="round-title">Round No: {round}</span>
                    <ul className="round-games">{gameNodes}</ul>
                </li>);
        });
        return (<div>
            <ul className="game-list" style={{marginTop: '30px'}}>{roundNode}</ul>
        </div>);
    }

}

GameList.propTypes = {
    bets: PropTypes.array,
    onBetChange: PropTypes.func,
    onBetFocused: PropTypes.func
};

export default GameList;