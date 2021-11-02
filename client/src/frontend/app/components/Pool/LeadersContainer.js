import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import {getParticipatesWithRank} from '../../utils';
import {getPoolParticipates} from '../../actions/pools';
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/swiper.scss';
import SwiperCore, {Pagination} from 'swiper';

SwiperCore.use([Pagination]);

const LeadersContainer = () => {
    const participates = useSelector(state => state.pools.participates);

    const LeaderList = ({participates}) => {
        const leaders = getParticipatesWithRank(participates);
        const AllTimeLeadersNode = _.map(leaders, (participate) => {
            return (<Leader participate={participate} rank={participate.rank} />);
        });

        return (<div>
            <ul className="leader-list" style={{marginTop: '30px'}}><Swiper
                className="Swiper"><SwiperSlide>{AllTimeLeadersNode}</SwiperSlide> </Swiper></ul>
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
            <li key={participate.userId} className="leader-row">
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