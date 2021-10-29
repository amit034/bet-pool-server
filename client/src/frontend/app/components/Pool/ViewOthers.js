import React, {useEffect} from 'react';
import _ from 'lodash';
import moment from 'moment';
import NavigationMenu from './NavigationMenu';
import {getChallengeParticipates, getPoolParticipates} from '../../actions/pools';
import {getUsersRanking} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';

const ViewOthers = (props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getChallengeParticipates(props.match.params.id, props.match.params.challengeId));
        dispatch(getPoolParticipates(props.match.params.id));
    }, [dispatch]);

    const MatchResult = ({score1, score2, closed}) => {
    //   console.log(score1,score2,closed);
        const className = classNames('match-tip-image circular teal icon link small fitted', {
            'users': closed,
            'lightbulb': !closed
        });
        return (<div className="game-result">
            <div className="match-result">
                {score1} : {score2}
            </div>
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

    const UserBet = ({participate, bet}) => {
        return (
            <li className="user-bet-row">
                <div className="user-bet-rank"> Rank: {_.get(userRanking, participate.userId)} <span
                    style={{color: 'rgb(156 161 164)'}}>({participate.score}pts).</span></div>
                <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                <div className="user-bet-score"><span>{bet.score1} : {bet.score2}</span></div>
            </li>);
    };
    const BetsList = ({usersBets, participates}) => {
        const userBetsNode = _.map(_.orderBy(participates, 'score', 'desc'), (participate) => {
            return (<UserBet participate={participate} key={participate.userId}
                             bet={_.find(usersBets, {userId: participate.userId}) || {}}/>)
        });
        return (<div>
            <ul className="users-bets-list" style={{marginTop: '30px'}}>{userBetsNode}</ul>
        </div>);
    };
    const participates = useSelector(state => state.pools.participates);
    const otherBets = useSelector(state => state.pools.otherBets);
    const {challenge, usersBets} = otherBets;
    const userRanking = getUsersRanking(participates);
    return (
        <div id="content" className="ui container">
            {challenge ? <ChallengeDetails challenge={challenge}/> : ''}
            <BetsList
                usersBets={usersBets}
                participates={participates}
            />
            <NavigationMenu/>
        </div>
    );
}
export default ViewOthers;