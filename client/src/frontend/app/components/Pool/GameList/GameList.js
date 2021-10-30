import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import {Modal, Header, Button} from 'semantic-ui-react';
import {getParticipatesWithRank} from '../../../utils';
import {getChallengeParticipates} from '../../../actions/pools';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
// import "./styles.css";
import SwiperCore, {Pagination} from 'swiper';
SwiperCore.use([Pagination]);
// import FootballNet from '../../../../images/spritesmith-generated/sprite.png'

const GameList = (props) => {
    const bets = useSelector(state => state.pools.bets);
    const goal = useSelector(state => state.pools.goal);
    const participates = useSelector(state => state.pools.participates);
    const otherBets = useSelector(state => state.pools.otherBets);
    const {usersBets} = otherBets;
    const [tipperOpen, setTipperOpen] = useState(false);
    const [othersModal, setOthersOpen] = useState(false);
    const dispatch = useDispatch();

    function handleTipperOpen() {
        setTipperOpen(true);
    }

    function handleTipperClose() {
        setTipperOpen(false);
    }

    function clickOnBetKeyChange(challengeId, betFieldName, score) {
        props.onBetKeyChange(challengeId, betFieldName, score);
    }

    function clickOnBetChange(challengeId, score1, score2) {
        props.onBetChange(challengeId, {score1, score2});
    }
    function  handleFocus ({ target }) {
        const el = target;
        setTimeout(function () {
            el.select();
        }, 0);
    }
    function onMatchClick(challenge, close) {
        if (!close) {
            handleTipperOpen();
            dispatch(getChallengeParticipates(props.poolId, challenge.challengeId));

        } else {
            // props.onShowOthers(challengeId);
            setOthersOpen(true);
        }
    }
    const betArray = _.orderBy(_.values(bets), 'challenge.playAt');
    const currentBet = _.find(betArray, (bet) => {
        return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
    });
    const currentRound = _.get(currentBet, 'challenge.game.round', 1);
    const betsGroups = _.groupBy(betArray, 'challenge.game.round');
    const [swiper, setSwiper] = useState(null);
    let currSlide = 0
    currSlide = Object.keys(betsGroups).length-currentRound
    const slideTo = (currSlide) => {
        if(swiper){swiper.slideTo(currSlide)}
    };
     useEffect(() => {
        slideTo(currSlide) 
    },[bets]);

    const UserBet = ({participate, bet}) => {
        return (<li className="user-bet-row" key={bet.challengeId}>
                <div className="user-bet-body">
                    <div className="user-bet-side">
                        <img className="user-bet-image" src={participate.picture} alt={participate.username}
                             title={participate.username}
                        />
                    </div>
                    <div className="user-bet-center">
                        <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                        <div className="user-bet-score1">{bet.score1}</div>
                        <div className="user-bet-score2">{bet.score2}</div>
                    </div>
                    <div className="user-bet-side">
                        <Button onClick={() => {
                            clickOnBetChange(bet.challengeId, bet.score1, bet.score2)
                        }}>Use it!</Button>
                    </div>
                </div>
            </li>
            );
    };
    const tipper = (<Modal
            className='challenge-tip'
            open={tipperOpen && !props.isFetching}
            closeIcon
            dimmer="blurring"
            onClose={handleTipperClose}
            size='small'
        >
            <Header icon='tip' content='Match tip'/>
            <Modal.Content>
                <ul className="users-bets-list">
                    {_.map(usersBets, bet => {
                        const participate = _.find(participates, {id: bet.participate}) || {};
                        return <UserBet bet={bet} participate={participate}/>
                    })}
                </ul>
            </Modal.Content>
        </Modal>
    );
    const Medal = ({score, medal}) => {
        const className = classNames('icon star large fitted', {
            'outline': medal === 0,
            'bronze-medal': medal === 1,
            'sliver-medal': medal === 2,
            'gold-medal': medal === 3
        });
        return <div className="bet-score">
            <div className="bet-score-points">{score}</div>
            <div className="bet-score-medal"><i className={className}></i></div>
        </div>
    };
    const BetsList = ({usersBets, participates}) => {
        const userBetsNode = _.map(_.orderBy(participates, 'rank'), (participate) => {
            return (<UserBet participate={participate} key={participate.userId}
                             bet={_.find(usersBets, {userId: participate.userId}) || {}}/>)
        });
        return (<div>
            <ul className="users-bets-list" style={{marginTop: '30px'}}>{userBetsNode}</ul>
        </div>);
    };
    const ChallengeDetails = ({challenge}) => {
        console.log(challenge);
        const {id, score1, score2, game: {homeTeam, awayTeam}, playAt} = challenge;
        return (<li className="challenge-row" key={id}>
            <div className="game-title">
                <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                <div className="game-hour">{moment(playAt).format('H:mm')}</div>
            </div>
            <div className="game-body">
                <TeamScore team={homeTeam}/>
                <MatchResult score1={score1} score2={score2} closed={closed} />
                <TeamScore team={awayTeam} reverse={true}/>
            </div>

        </li>);
    };

    
    let ViewOthersModal = null
    const Game = ({bet, showDay, goal}) => {
        const {challenge} = bet
        const {
            score1, score2, score, medal, 
            challenge: {id: challengeId, isOpen, score1: c_score1, score2: c_score2,
                game: {homeTeam, awayTeam}, playAt, factorId}
        } = bet;
        const gameSideClassName = classNames('game-side', {'main-event': factorId > 1});
        const className = classNames('match-tip-image circular teal icon link small fitted', {
            'users': !isOpen,
            'lightbulb': isOpen
        });
        const participatesWithRank = getParticipatesWithRank(participates);
        ViewOthersModal =  (<Modal closeIcon
            open={othersModal}>      
                <Modal.Content>
                <ChallengeDetails challenge={challenge}/>
                <BetsList
                    usersBets={usersBets}
                    participates={participatesWithRank}
                />
                </Modal.Content>
            </Modal>
        )
        

        return (
            <section key={challengeId}>
                    <li className="game-row"  data={challengeId}>
                        <div className={gameSideClassName}>
                            {factorId > 1 ? 'Main Event' : ''}
                        </div>
                        <div className="game-center">
                            <div className="game-title">
                                <div className="match-tip">
                                    <i className={className}
                                       onClick={() => onMatchClick(challenge, !isOpen)}></i>
                                    {/* <i className={className} onClick={() => this.onAnimation()}></i> */}
                                </div>
                                {!isOpen ? <Medal score={score} medal={medal}/> : ''}
                                <div className="game-day">{moment(playAt).format('DD/MM/YYYY')}</div>
                                {/* < div className="game-more">{factor > 1 ? 'Main Event': ''}</div> */}
                                <div className="game-hour">{moment(playAt).format('H:mm')}</div>

                            </div>
                            <div className="game-body">
                                <TeamScore team={homeTeam} teamBet={score1} closed={!isOpen} challengeId={challengeId}
                                           betFieldName="score1"/>
                                <MatchResult score1={c_score1} score2={c_score2} closed={!isOpen}
                                             challengeId={challengeId}/>
                                <TeamScore team={awayTeam} teamBet={score2} closed={!isOpen} challengeId={challengeId}
                                           betFieldName="score2"
                                           reverse={true}/>
                            </div>
                        </div>
                    </li>
            </section>)
    }
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
                    <input onFocus={handleFocus}
                           onChange={(e) => {
                               return clickOnBetKeyChange(challengeId, betFieldName, e.target.value);
                           }} value={_.toString(teamBet)}
                           disabled={closed}></input>
                </div>
                <div className="team-name game-body-column-footer">{name}</div>
            </div>
            <div className="team-details game-body-column">
                <div className="game-body-column-center">
                    <div className="team-flag">
                        <img alt={name} title={name} src={flag}/>
                    </div>
                </div>
                <div className="game-body-column-footer">&nbsp;</div>
            </div>
        </div>);
    };

    
    let newArr = [];
    _.forEachRight(betsGroups, function (roundBets) {
            newArr.push(roundBets)
        }
    );


    const roundNode = _.map(_.pickBy(newArr, (value, key) => key >= 0), (roundBets) => {
        let currentDate = null;
        let roundNum = roundBets[0].challenge.game.round
        const gameNodes = roundBets.map((bet) => {
            const gameNode = <Game bet={bet} goal={goal}
                                   showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')}/>;
            currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
            return (gameNode);
        });
        return (<SwiperSlide><li key={roundNum}>
            <span className="round-title">Round No: {roundNum}</span>
            <ul className="round-games">{gameNodes}</ul>
        </li></SwiperSlide>);
    });
    return (<div>
            {tipper}
            {ViewOthersModal}
            <ul className="game-list" style={{marginTop: '30px'}}><Swiper pagination={{
  "dynamicBullets": true
}} initialSlide={currSlide} onSwiper={setSwiper} className="Swiper">{roundNode}</Swiper></ul>
        </div>
    );

}

// GameList.propTypes = {
//     bets: PropTypes.object,
//     poolId: PropTypes.string,
//     onBetChange: PropTypes.func,
//     onBetKeyChange: PropTypes.func,
//     onShowOthers: PropTypes.func,
//     onBetFocused: PropTypes.func,
//     isFetching: PropTypes.bool,
//     usersBets: PropTypes.array,
//     goal: PropTypes.number
// };

export default GameList;
