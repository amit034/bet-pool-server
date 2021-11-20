import React, {useEffect} from 'react';
import _ from 'lodash';
import moment from 'moment';
import NavigationMenu from '../NavigationMenu';
import {getChallengeParticipates, getPoolParticipates} from '../../../actions/pools';
import {getParticipatesWithRank} from '../../../utils';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {Modal} from 'semantic-ui-react';
import GameList from "./GameList";

const ViewOthers = ({clickOnBetChange}) => {
    const MatchResult = ({score1, score2, closed}) => {
        const className = classNames('match-tip-image circular teal icon link small fitted', {
            'users': closed,
            'lightbulb': !closed
        });
        return (<div className="game-result">
                {score1} : {score2}
        </div>);
    };
    const TeamScore = ({team: {flag, name}, reverse}) => {
        const className = classNames('team-score', {'team-reverse': reverse});
        return (<div className={className}>
            <div className="team-details">
                <div className="team-flag">
                    <img className="team-image" src={flag} alt={name} title={name}/>
                </div>
                <span className="team-name">{name}</span>
            </div>
        </div>);
    };
    const ChallengeDetails = ({challenge}) => {
        const {id, score1, score2, game: {homeTeam, awayTeam}, playAt} = challenge;
        return (<Modal.Header><li className="challenge-row" key={id}>
            <div className="game-title">
                <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                <div className="game-hour">{moment(playAt).format('H:mm')}</div>
            </div>
            <div className="game-body">
                <TeamScore team={homeTeam}/>
                <MatchResult score1={score1} score2={score2} closed={closed} />
                <TeamScore team={awayTeam} reverse={true} />
            </div>

        </li></Modal.Header>);
    };

    const UserBet = ({participate, bet, isOpen}) => {
        return (
            <li className="user-bet-row">
                <div className="user-bet-side">
                    <img className="user-bet-image" src={participate.picture} alt={participate.username}
                         title={participate.username}/>
                </div>
                <div className="user-bet-center">
                    <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                    <div className="user-bet-rank"> Rank: {participate.rank} <span
                        style={{color: 'rgb(156 161 164)'}}>({participate.score}pts).</span></div>
                </div>
                <div className="user-bet-score">
                    <div><span>{bet.score1} : {bet.score2}</span></div>
                    {isOpen ? <div className="users-bets-use-it">
                        <a onClick={() => {
                            clickOnBetChange(bet.challengeId, bet.score1, bet.score2)
                        }}>Use it!</a>
                    </div>: ''}
                </div>
            </li>);
    };

    const BetsList = ({usersBets, participates, isOpen}) => {
        const userBetsNode = _.map(_.orderBy(participates, 'rank'), (participate) => {
            return (<UserBet participate={participate} key={participate.userId} isOpen={isOpen}
                             bet={_.find(usersBets, {userId: participate.userId}) || {}}/>)
        });
        return (<Modal.Content image scrolling style={{maxHeight: "60vh", marginTop: "25px"}}>
            <ul className="users-bets-list" >{userBetsNode}</ul>
            </Modal.Content>);
    };
    const participates = useSelector(state => state.pools.participates);
    const otherBets = useSelector(state => state.pools.otherBets);
    const {challenge, usersBets} = otherBets;
    const viewableUsersIds = _.map(usersBets, 'userId');
    const participatesWithRank = _.filter(getParticipatesWithRank(participates), (({userId}) => _.includes(viewableUsersIds, userId)));
    return (
        <div id="content" style={{margin: "35px 8px 8px 8px"}} >
            {challenge ? <section>
                <ChallengeDetails challenge={challenge}/>
                <BetsList
                    usersBets={usersBets}
                    participates={participatesWithRank}
                    isOpen = {challenge.isOpen}
                />
            </section> : ''}
        </div>
    );
}

export default ViewOthers;