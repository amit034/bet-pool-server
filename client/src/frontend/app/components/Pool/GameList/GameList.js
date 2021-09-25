import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import {Modal, Header, Button} from 'semantic-ui-react'
import {getChallengeParticipates} from '../../../actions/pools';
import {connect} from 'react-redux';

class GameList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onBetChange = this.onBetChange.bind(this);
        this.onBetKeyChange = this.onBetChange.bind(this);
        this.onShowOthers = this.onShowOthers.bind(this);
        this.handleTipperOpen = this.handleTipperOpen.bind(this);
        this.handleTipperClose = this.handleTipperClose.bind(this);
        this.state = {
            tipperOpen: false
        };
    }
    handleTipperOpen(){
        this.setState({ tipperOpen: true });
    }
    handleTipperClose() {
        this.setState({ tipperOpen: false });
    }
    onBetKeyChange(onBetKeyChange, betFieldName, score){
        this.props.onBetChange(challengeId, betFieldName, score);
    }
    onBetChange(challengeId, score1, score2){
        this.props.onBetChange(challengeId, {score1, score2});
    }
    onBetKeyChange(betId, betFieldName, score){
            this.props.onBetKeyChange(betId, betFieldName, score);
    }
    onShowOthers(challengeId, close){
       if (!close){
           this.handleTipperOpen();
           this.props.dispatch(getChallengeParticipates(this.props.poolId, challengeId));

       } else {
           this.props.onShowOthers(challengeId);
       }

    }
    shouldComponentUpdate(nextProps, nextState){
      //return !_.isEqual(_.get(nextProps, 'bets'), _.get(this.props, 'bets')); // equals() is your implementation
        return true;
    }
    render() {
        const {bets, usersBets, participates} = this.props;
        const betArray = _.orderBy(_.values(bets), 'challenge.playAt');
        const currentBet = _.find(betArray, (bet) => {
                    return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
                });
        const currentRound = _.get(currentBet, 'challenge.game.round', 1);
        const betsGroups = _.groupBy(betArray, 'challenge.game.round');
        // const BetPad = ({focused}) => {
        //     if (focused)
        //     const betPadNodes = _.map(_.range(10), (score) => {
        //         const className = classNames('bet-pad-score', {'bet-pad-score-selected': score === _.parseInt(currentScore)});
        //         <span className={className} onClick={() => this.onBetChange(betId, betFieldName, score)}>{score}</span>
        //     });
        //     return (<div className="bet-pad">{betPadNodes}</div>)
        // };
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
                            <div className="user-bet-side">
                                <Button onClick={() => { this.onBetChange(bet.challengeId, bet.score1, bet.score2)}}>Use it!</Button>
                            </div>
                        </div>
                    </li>);
            };
        const tipper = (<Modal
                className='challenge-tip'
                open={this.state.tipperOpen && !this.props.isFetching}
                closeIcon
                dimmer="blurring"
                onClose={this.handleTipperClose}
                size='small'
              >
                <Header icon='tip' content='Match tip' />
                <Modal.Content>
                    <ul className="users-bets-list">
                    {_.map(usersBets, bet => {
                        const participate =_.find(participates, {id: bet.participate}) || {};
                        return <UserBet bet={bet} participate={participate}/>
                    })}
                    </ul>
                </Modal.Content>
              </Modal>
        );
        const Medal = ({score, medal}) => {
            const className = classNames('icon star large fitted', {'outline': medal === 0, 'bronze-medal': medal === 1, 'sliver-medal': medal === 2, 'gold-medal': medal === 3});
            return <div style={{'display': 'flex'}}>
                <div className="bet-score-medal"><i className={className}></i></div>
                <div className="bet-score-points">{score}</div>
            </div>
        };
        const Game = ({bet, key, showDay}) => {
            const {score1, score2, score, medal, challenge: {id: challengeId, score1: c_score1, score2: c_score2, game: {homeTeam, awayTeam}, playAt, factor}, ioOpen} = bet;
            const gameSideClassName = classNames('game-side', {'main-event': factor > 1});
            return (<li className="game-row" key={key}>
                <div className={gameSideClassName}>
                    {factor > 1 ? 'Main Event': ''}
                </div>
                <div className="game-center">
                    <div className="game-title">
                        <div className="game-day">{showDay ? moment(playAt).format('ddd DD/MM') : ''}</div>
                        <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                        {/*< div className="game-more">{factor > 1 ? 'Main Event': ''}</div> */}
                        <div className="bet-score">{!ioOpen ? <Medal score={score} medal={medal} /> : ''}</div>
                    </div >
                    <div className="game-body">
                        <TeamScore team={homeTeam} teamBet={score1} closed={!ioOpen} challengeId={challengeId} betFieldName="score1"/>
                        <MatchResult score1={c_score1} score2={c_score2} closed={!ioOpen} challengeId={challengeId}/>
                        <TeamScore team={awayTeam} teamBet={score2} closed={!ioOpen} challengeId={challengeId} betFieldName="score2"
                                   reverse={true} />
                    </div>
                </div>
            </li>);
        };
        const MatchResult = ({score1, score2 , closed, challengeId}) => {
            const className = classNames('match-tip-image circular teal icon link small fitted', {
                'users': closed,
                'lightbulb': !closed
            });
            return (<div className="game-result">
                <div className="match-tip"><i class={className} onClick={() => this.onShowOthers(challengeId, closed)}></i>
                </div>
                <div className="match-result">{score1} : {score2}</div>
            </div>);
        };
        const TeamScore = ({team: {flag, name}, teamBet, closed, challengeId, betFieldName, reverse}) => {
            const className = classNames('team-score', {'team-reverse': reverse});
            return (<div className={className}>
                <div className="team-details">
                    <img className="team-flag" src={flag} alt={name} title={name} />
                    <span className="team-name">{name}</span>
                </div>
                <div className="team-bet">
                   <input onChange={(e) => this.props.onBetKeyChange(challengeId, betFieldName, e.target.value)} value={teamBet}
                          disabled={closed}></input>
               </div>
            </div>);
        };

        const roundNode = _.map(_.pickBy(betsGroups, (value, key) => key >= currentRound), (roundBets, round) => {
            let currentDate = null;
            const gameNodes = roundBets.map((bet) => {
                const gameNode = <Game bet={bet} key={bet.id}
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
            {tipper}
            <ul className="game-list" style={{marginTop: '30px'}}>{roundNode}</ul>
        </div>);
    }

}

GameList.propTypes = {
    bets: PropTypes.object,
    poolId: PropTypes.string,
    onBetChange: PropTypes.func,
    onBetKetChange: PropTypes.func,
    onShowOthers: PropTypes.func,
    onBetFocused: PropTypes.func,
    isFetching: PropTypes.bool,
    usersBets: PropTypes.array
};

export default connect(({pools: {bets, isFetching, participates, otherBets : {challenge, usersBets}}}) => {
    return {bets, challenge, usersBets, participates, isFetching}
})(GameList);