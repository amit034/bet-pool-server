import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import {Modal} from 'semantic-ui-react';
import {getChallengeParticipates, getPoolParticipates, updateUserBet} from '../../../actions/pools';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import SwiperCore, {Pagination} from 'swiper';
import ViewOthers from "./ViewOthers";
import Game from "./Game";
SwiperCore.use([Pagination]);


const GameList = ({poolId}) => {
    const dispatch = useDispatch();
    const [viewOthersOpen, setViewOthersOpen] = useState(false);
    const bets = useSelector(state => state.pools.bets);
    const goal = useSelector(state => state.pools.goal);

    function handleViewOthersClose() {
        setViewOthersOpen(false);
    }
    function onMatchClick(challengeId, close) {
        if (!close) {
            setViewOthersOpen(true);
        } else {
            setViewOthersOpen(true);
            dispatch(getPoolParticipates(poolId));
        }
        dispatch(getChallengeParticipates(poolId, challengeId));
    }
    function clickOnBetChange(challengeId, score1, score2) {
        handleViewOthersClose();
        onBetChange(challengeId, {score1, score2});
    }
    function onBetKeyChange(challengeId, key, value) {
        const bet = _.get(bets, challengeId);
        _.set(bet, key, value);
        onBetChange(challengeId, bet);
    }
    function onBetChange(challengeId, updatedBet) {
        const bet = _.get(bets, challengeId);
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        dispatch(updateUserBet(poolId, challengeId, bet));
    }
    const [swiper, setSwiper] = useState(null);
    const betArray = _.orderBy(_.values(bets), 'challenge.playAt');
    const betsGroups = _.groupBy(betArray, 'challenge.game.round');
    useEffect(() => {
         if(swiper){
            const currentBet = _.find(betArray, (bet) => {
                return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment(), 'day');
            });
            const currentRound = _.get(currentBet, 'challenge.game.round', 1);
            const currSlide = _.size(betsGroups)-currentRound;
            swiper.slideTo(currSlide);
         }
    },[bets]);


    const ViewOthersModal =  (<Modal
            // className='fullscreen' style={{}}
            style={{maxHeight: "90vh", backgroundColor: "#0C4262", color: "#EFBA9A", paddingTop: "0px"}}
            open={viewOthersOpen}
            closeIcon
            dimmer="blurring"
            onClose={handleViewOthersClose}
            size='small'
        >
            <ViewOthers clickOnBetChange={clickOnBetChange}/>
        </Modal>)


    const roundNode = _.map(_.reverse(_.values(betsGroups)), (roundBets) => {
        let currentDate = null;
        let roundNum = _.get(_.first(roundBets), 'challenge.game.round', 0);
        const gameNodes = roundBets.map((bet) => {
            const {challengeId} = bet;
            const gameNode = <Game key={challengeId} bet={bet} goal={goal} onMatchClick={onMatchClick}  onBetKeyChange={onBetKeyChange}
                                   showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')}/>;
            currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
            return (gameNode);
        });
        return (<SwiperSlide key={roundNum}><div>
            <span className="round-title">Round No: {roundNum}</span>
            <ul className="round-games">{gameNodes}</ul>
        </div></SwiperSlide>);
    });
    return (<div>
            {ViewOthersModal}
            <Swiper pagination={{ "dynamicBullets": true}}  onSwiper={setSwiper}
                    className="Swiper game-list"
                    style={{marginTop: '30px'}}>
                {roundNode}
            </Swiper>
        </div>
    );

}

export default GameList;
