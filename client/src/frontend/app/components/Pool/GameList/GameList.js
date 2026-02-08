import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';;
import _ from 'lodash';
import moment from 'moment';
import {Modal, Form} from 'semantic-ui-react';
import {getChallengeParticipates, getPoolParticipates, updateUserBet} from '../../../actions/pools';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import SwiperCore, {Pagination} from 'swiper';
import ViewOthers from "./ViewOthers";
import GoalSound from "./GoalSound";
import Game from "./Game";
SwiperCore.use([Pagination]);

const GameList = ({poolId}) => {
    const dispatch = useDispatch();
    const [viewOthersOpen, setViewOthersOpen] = useState(false);
    const bets = useSelector(state => state.pools.bets);
    const goals = useSelector(state => state.pools.goals);
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
            //dispatch(getPoolParticipates(poolId));
        }
        dispatch(getChallengeParticipates(poolId, challengeId));
    }, []);
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
                return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment().add(10, 'days'), 'day');
            });
            const currentRound = _.get(currentBet, 'challenge.game.round', 1);
            const currSlide = _.size(betsGroups)-currentRound;
            swiper.slideTo(currSlide);
         }
    },[bets]);

    const ViewOthersModal =  (<Modal
            // className='fullscreen' style={{}}
            style={{maxHeight: "90vh", backgroundColor: "#202020", color: "#FFFFFF", paddingTop: "0px"}}
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
        const currentBet = _.find(betArray, (bet) => {
            return moment(_.get(bet, 'challenge.playAt')).isSameOrAfter(moment().add(10, 'days'), 'day');
        });
        const dateGroup = _.groupBy(roundBets, (bet) => {
            return moment(_.get(bet, 'challenge.playAt')).format('YYYYMMDD');

        })
        const gameNodes = _.reduce(dateGroup, (agg, bets, playAt) => {
            agg.push((<div key={_.toString(playAt)} className='group-play-at'>{moment(playAt).format('dddd DD/MM')}</div>));
            agg.push(..._.map(bets,(bet) => {
                const {challengeId} = bet;
                const goal = _.get(goals, challengeId, null);
                const gameNode = <Game bet={bet} goal={goal} isCurrent={currentBet === bet}
                                       onMatchClick={onMatchClick}
                                       onBetKeyChange={onBetKeyChange}
                                       key={_.toString(challengeId)} />;
                return (gameNode);
            }));

            //currentDate = moment(bet.challenge.playAt).format('YYYYMMDD');
            return agg;
        }, []);
        return (<SwiperSlide key={roundNum}><div>
            <span className="round-title">Round No: {roundNum}</span>
            <Form size='large' action="/" onSubmit={processForm}>
                <ul className="round-games">{gameNodes}</ul>
            </Form>
        </div></SwiperSlide>);
    });
    return (<div>
            {<GoalSound></GoalSound>}
            {ViewOthersModal}
            <Swiper pagination={{ "dynamicBullets": true}}  onSwiper={setSwiper}
                    className="Swiper game-list">
                {roundNode}
            </Swiper>
        </div>
    );
}
export default GameList;
