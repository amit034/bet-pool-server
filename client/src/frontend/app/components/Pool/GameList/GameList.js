import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Game from './Game';

class GameList extends Component {
    constructor(props) {
        super(props);
        this.onBetChange = this.onBetChange.bind(this);
        this.onShowOthers = this.onShowOthers.bind(this);
    }

    onBetChange(betId, betFieldName, score) {
        this.props.onBetChange(betId, betFieldName, score);
    }

    onShowOthers(challengeId) {
        this.props.onShowOthers(challengeId);
    }

    render() {
        const {bets} = this.props;
        const betArray = _.values(bets);
        const currentBet = _.find(betArray, (bet) => {
            return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
        });
        const currentRound = _.get(currentBet, 'challenge.game.round', 1);
        const betsGroups = _.groupBy(betArray, 'challenge.game.round');
        const roundNode = _.map(_.pickBy(betsGroups, (value, key) => key >= currentRound), (roundBets, round) => {
            let currentDate = null;
            const gameNodes = roundBets.map((bet) => {
                const gameNode = <Game bet={bet} key={bet._id}
                                       onShowOthers={this.onShowOthers}
                                       onBetChange={this.onBetChange}
                                       showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')} />;
                currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
                return (gameNode);
            });
            return (<li key={round}>
                <span className="round-title">Round No {round}</span>
                <ul className="round-games">{gameNodes}</ul>
            </li>);
        });
        return (<div>
            <ul className="game-list">{roundNode}</ul>
        </div>);
    }

}

GameList.propTypes = {
    bets: PropTypes.object,
    onBetChange: PropTypes.func,
    onShowOthers: PropTypes.func,
    onBetFocused: PropTypes.func
};

export default GameList;
