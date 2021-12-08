import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useAudio} from 'react-use';
import _ from 'lodash';
import moment from 'moment';
import {Modal, Form} from 'semantic-ui-react';
import {getChallengeParticipates, getPoolParticipates, updateUserBet} from '../../../actions/pools';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import SwiperCore, {Pagination} from 'swiper';
import ViewOthers from "./ViewOthers";
import Game from "./Game";
SwiperCore.use([Pagination]);
import goalURL from  '../../../../sounds/goal3.mp3';
const url = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';


const GameList = ({poolId}) => {
    const dispatch = useDispatch();
    const [viewOthersOpen, setViewOthersOpen] = useState(false);
    const bets = useSelector(state => state.pools.bets);
    const goals = useSelector(state => state.pools.goals);
    let goalHandler;
    const [audio, state, goalSoundControllers, audioRef] = useAudio({
        src: '../../../../sounds/goal3.mp3'
    });
    useEffect(() => {
        if (!_.isEmpty(goals) && audioRef && audioRef.current) {
            if (goalHandler){
                clearTimeout(goalHandler);
            }
            audioRef.current.currentTime = 5;
            goalSoundControllers.play();
            goalHandler = setTimeout(() => {
                goalSoundControllers.pause();
            }, 20000);
        }
    },
        [goals]
    );
    function onBetChange(challengeId, updatedBet) {
        const bet = _.get(bets, challengeId);
        const update = _.assign({}, bet, _.pick(updatedBet, ['score1', 'score2']));
        dispatch(updateUserBet(poolId, challengeId, update));
    }
    const processForm = (event) => {
        event.preventDefault();
    };
    const handleViewOthersClose = useCallback (() => {
        setViewOthersOpen(false);
    },[]);
    const onMatchClick = useCallback((challengeId, close) =>  {
        if (!close) {
            setViewOthersOpen(true);
        } else {
            setViewOthersOpen(true);
            dispatch(getPoolParticipates(poolId));
        }
        dispatch(getChallengeParticipates(poolId, challengeId));
    });
    const clickOnBetChange = useCallback ((challengeId, score1, score2) => {
        handleViewOthersClose();
        onBetChange(challengeId, {score1, score2});
    }, []);

    const onBetKeyChange = useCallback((challengeId, key, value) =>{
        const bet = _.get(bets, challengeId);
        const update = _.assign({}, bet, {[key]: value});
        onBetChange(challengeId, update);
    }, [bets]);

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
            const gameNode = <Game bet={bet} onMatchClick={onMatchClick}  onBetKeyChange={onBetKeyChange} key={_.toString(challengeId)}
                                   showDay={currentDate < moment(bet.challenge.playAt).format('YYYYMMDD')}/>;
            currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
            return (gameNode);
        });
        return (<SwiperSlide key={roundNum}><div>
            <span className="round-title">Round No: {roundNum}</span>
            <Form size='large' action="/" onSubmit={processForm}>
                <ul className="round-games">{gameNodes}</ul>
            </Form>
        </div></SwiperSlide>);
    });
    return (<div>
            {audio}
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
