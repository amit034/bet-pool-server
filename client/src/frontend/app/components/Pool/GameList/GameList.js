import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import {Modal, Header, Button} from 'semantic-ui-react'
import {getChallengeParticipates} from '../../../actions/pools';
import {connect} from 'react-redux';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper.scss';
import SwiperCore, {Pagination} from 'swiper';
SwiperCore.use([Pagination]);

class GameList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onBetChange = this.onBetChange.bind(this);
        this.onBetKeyChange = this.onBetKeyChange.bind(this);
        this.onShowOthers = this.onShowOthers.bind(this);
        this.handleTipperOpen = this.handleTipperOpen.bind(this);
        this.handleTipperClose = this.handleTipperClose.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.state = {
            tipperOpen: false
        };
        this.numpad = null;
    }
    handleTipperOpen(){
        this.setState({ tipperOpen: true });
    }
    handleTipperClose() {
        this.setState({ tipperOpen: false });
    }
    onBetKeyChange(challengeId, betFieldName, score){
        this.props.onBetChange(challengeId, betFieldName, score);
    }

    onBetChange(challengeId, score1, score2){
        this.props.onBetChange(challengeId, {score1, score2});
    }
    onBetKeyChange(betId, betFieldName, score){
            this.props.onBetKeyChange(betId, betFieldName, score);
    }
    handleFocus ({ target }) {
        const el = target;
        setTimeout(function () {
            el.select()
        }, 0)
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
        return true;
    }
    render() {
        const pagination1 = {
            "clickable": true,
            "renderBullet": function (index, className) {          
                    return '<span class=\"' + className + '\">' + (index + 1) + '</span>';}
        }
        const pagination= {
            el: ".swiper-pagination",
            type: "progressbar",
        };
        const navigation= {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          };

        const {bets, usersBets, participates} = this.props;
        const betArray = _.orderBy(_.values(bets), 'challenge.playAt');
        const currentBet = _.find(betArray, (bet) => {
                    return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
                });
        const currentRound = _.get(currentBet, 'challenge.game.round', 1);
        const betsGroups = _.groupBy(betArray, 'challenge.game.round');
            
        const UserBet = ({participate, bet}) => {
            return (
                <li className="user-bet-row" key={bet.challengeId}>
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
            return <div className="bet-score" >
                <div className="bet-score-points">{score}</div>
                <div className="bet-score-medal"><i className={className}></i></div>
            </div>
        };
        const Game = ({bet, showDay}) => {
            const {score1, score2, score, medal, challenge: {id: challengeId, isOpen, score1: c_score1, score2: c_score2,
                game: {homeTeam, awayTeam}, playAt, factorId}} = bet;
            const gameSideClassName = classNames('game-side', {'main-event': factorId > 1});
            const className = classNames('match-tip-image circular teal icon link small fitted', {
                'users': !isOpen,
                'lightbulb': isOpen
            });
            return (<li className="game-row" key={challengeId} data={challengeId}>
                <div className={gameSideClassName}>
                    {factorId > 1 ? 'Main Event': ''}
                </div>
                <div className="game-center">
                    <div className="game-title">
                        <div className="match-tip">
                            <i className={className} onClick={() => this.onShowOthers(challengeId, !isOpen)}></i>
                        </div>
                        {!isOpen ? <Medal score={score} medal={medal} /> : ''}
                        <div className="game-day">{moment(playAt).format('DD/MM/YYYY')}</div>
                        <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                        {/*< div className="game-more">{factor > 1 ? 'Main Event': ''}</div> */}

                    </div >
                    <div className="game-body">
                        <TeamScore team={homeTeam} teamBet={score1} closed={!isOpen} challengeId={challengeId} betFieldName="score1"/>
                        <MatchResult score1={c_score1} score2={c_score2} closed={!isOpen} challengeId={challengeId}/>
                        <TeamScore team={awayTeam} teamBet={score2} closed={!isOpen} challengeId={challengeId} betFieldName="score2"
                                   reverse={true} />
                    </div>
                </div>
            </li>);
        };
        const MatchResult = ({score1, score2}) => {
            return (<div className="game-result game-body-column">
                <div className="match-result game-body-column-center">{score1} : {score2}</div>
                <div className="game-body-column-footer">&nbsp;</div>
            </div>);
        };
        const TeamScore = ({team: {flag, name}, teamBet, closed, challengeId, betFieldName, reverse}) => {
            const className = classNames('team-score', {'team-reverse': reverse});
            return (<div className={className}>
                <div className="team-bet game-body-column">
                    <div className="game-body-column-center">
                        <input onFocus={this.handleFocus}
                            onChange={(e) => {
                            return this.onBetKeyChange(challengeId, betFieldName, e.target.value);
                        }} value={_.toString(teamBet)}
                               disabled={closed}></input>
                    </div>
                    <div className="team-name game-body-column-footer">{name}</div>
                </div>
                <div className="team-details game-body-column">
                    <div className="game-body-column-center">
                        <div className="team-flag">
                            <img alt={name} title={name} src={flag} />
                        </div>
                    </div>
                    <div className="game-body-column-footer">&nbsp;</div>
                </div>
            </div>);
        };

        const roundNode = _.map(_.pickBy(betsGroups, (value, key) => key > 0), (roundBets, round) => {
            let currentDate = null;
            const gameNodes = roundBets.map((bet) => {
                const gameNode = <Game bet={bet} showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')} />;
                currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
                return (gameNode);
            });
            return (<SwiperSlide><li key={round}>
                    <span className="round-title">Round No: {round}</span>
                    <ul className="round-games">{gameNodes}</ul>
                </li></SwiperSlide>);
        });
        return (<div>
            {tipper}
            <ul className="game-list" style={{marginTop: '30px'}}><Swiper  initialSlide={2} className="Swiper"> {roundNode} </Swiper></ul>
        </div>);
    }

}

GameList.propTypes = {
    bets: PropTypes.object,
    poolId: PropTypes.string,
    onBetChange: PropTypes.func,
    onBetKeyChange: PropTypes.func,
    onShowOthers: PropTypes.func,
    onBetFocused: PropTypes.func,
    isFetching: PropTypes.bool,
    usersBets: PropTypes.array
};

export default connect(({pools: {bets, isFetching, participates, otherBets : {challenge, usersBets}}}) => {
    return {bets, challenge, usersBets, participates, isFetching}
})(GameList);