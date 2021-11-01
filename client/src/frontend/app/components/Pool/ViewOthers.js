import React, {useEffect} from 'react';
import _ from 'lodash';
import moment from 'moment';
import NavigationMenu from './NavigationMenu';
import {getChallengeParticipates, getPoolParticipates} from '../../actions/pools';
import {getParticipatesWithRank} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {Modal} from 'semantic-ui-react';

const ViewOthers = (props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        // dispatch(getChallengeParticipates(props.poolId, props.challengeId));
        // dispatch(getPoolParticipates(props.poolId));
    }, [dispatch]);

    const MatchResult = ({score1, score2, closed}) => {
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

    const UserBet = ({participate, bet}) => {
        return (
            <li className="user-bet-row">
                <div className="user-bet-rank"> Rank: {participate.rank} <span
                    style={{color: 'rgb(156 161 164)'}}>({participate.score}pts).</span></div>
                <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                <div className="user-bet-score"><span>{bet.score1} : {bet.score2}</span></div>
            </li>);
    };

    const BetsList = ({usersBets, participates}) => {
        const userBetsNode = _.map(_.orderBy(participates, 'rank'), (participate) => {
            return (<UserBet participate={participate} key={participate.userId}
                             bet={_.find(usersBets, {userId: participate.userId}) || {}}/>)
        });
        return (<Modal.Content image scrolling style={{maxHeight: "60vh", marginTop: "25px"}}>
            <ul className="users-bets-list" >{userBetsNode}</ul>
            </Modal.Content>);
    };
    const participates = useSelector(state => state.pools.participates);
    const otherBets = useSelector(state => state.pools.otherBets);
    const {challenge, usersBets} = otherBets;
    const participatesWithRank = getParticipatesWithRank(participates);
    return (
        <div id="content" style={{margin: "35px 8px 8px 8px"}} >
            {challenge ? <ChallengeDetails challenge={challenge}/> : ''}
            <BetsList
                usersBets={usersBets}
                participates={participatesWithRank}
            />
        </div>
    );
}
export default ViewOthers;