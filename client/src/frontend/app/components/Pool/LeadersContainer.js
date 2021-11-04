import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import {getParticipatesWithRank} from '../../utils';
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/swiper.scss';
import SwiperCore, {Pagination} from 'swiper';
SwiperCore.use([Pagination]);

const LeadersContainer = () => {
    const participates = useSelector(state => state.pools.participates);
    const LeaderList = ({participates}) => {
        const numberOfRounds = _.size(_.get(_.first(participates), 'rounds', []));
        const roundsScore = _.map(_.range(numberOfRounds), (roundId) => {
            return _.map(participates, ({score, medals, rounds, ...others}) => {
                const {score: roundScore, medals: roundMedals} = _.get(rounds, roundId, {score: 0, medals: {1:0, 2:0, 3:0}});
                return {
                    ...others,
                    score: roundScore, 
                    medals: roundMedals,
                };
            });
        });
        roundsScore.push(participates);  
        const allLeadersNode = _.map(roundsScore, (roundScore, idx) => {
            const roundLeaders = getParticipatesWithRank(roundScore);
            const roundLeaderNode = _.map(roundLeaders, (participate) => {
                    return (<Leader key={participate.userId} participate={participate} rank={participate.rank} />);
            });
            const title = idx < numberOfRounds? `Round ${idx+1}` : 'All Time'; 
            return (<SwiperSlide key={idx}><div className='round-title'>{title} Leaders</div>{roundLeaderNode}</SwiperSlide>)
        });
        return (<div>
            <ul className="leader-list" style={{marginTop: '30px'}}><Swiper
                className="Swiper">{_.reverse(allLeadersNode)}</Swiper></ul>
        </div>);
    };
    const Leader = ({participate, rank}) => {
        const medals = _.map(_.forOwnRight(participate.medals), (medal, idx) => {
            const className = classNames('icon star large fitted', {
                'bronze-medal': idx === "1",
                'sliver-medal': idx === "2",
                'gold-medal': idx === "3"
            });
            return (<div key={idx} className="leader-medal">
                <i className={className}></i>
                <div className="medal-badge">{medal}</div>
            </div>);
        });
        return (
            <li className="leader-row">
                <div className="leader-body">
                    <div className="leader-rank"> {rank}.</div>
                    <div className="leader-side">
                        <img className="leader-image" src={participate.picture} alt={participate.username}
                            title={participate.username}/>
                    </div>
                    <div className="leader-center">
                        <div className="leader-name">{participate.firstName} {participate.lastName}</div>
                        <div className="leader-medals">
                            {medals}
                        </div>
                        <div className="leader-score-box"><span
                            className="leader-score-numbers">{participate.score}</span></div>
                    </div>
                </div>
            </li>);
    };
    return (
        <div id="content" className="ui container">
            <LeaderList
                participates={participates}
            />
        </div>
    );
}

export default LeadersContainer;