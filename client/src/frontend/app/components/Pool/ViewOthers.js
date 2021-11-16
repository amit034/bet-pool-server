import React, {useEffect,useState} from 'react';
import _ from 'lodash';
import moment from 'moment';
import NavigationMenu from './NavigationMenu';
import {getChallengeParticipates, getPoolParticipates} from '../../actions/pools';
import {getParticipatesWithRank} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {Modal} from 'semantic-ui-react';
import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries,
    VerticalBarSeriesCanvas,
    FlexibleWidthXYPlot ,
    Hint
  } from 'react-vis';
 import 'react-vis/dist/style.css';

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
        return (
        <Modal.Header><li className="challenge-row" key={id}>
            <div className="game-title">
                <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                <div className="game-hour">{moment(playAt).format('H:mm')}</div>
            </div>
            <div className="game-body">
                <TeamScore team={homeTeam}/>
                <MatchResult score1={score1} score2={score2} closed={closed} />
                <TeamScore team={awayTeam} reverse={true} />
            </div>
            <BetsGraph />
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

    const BetsGraph = (props) => {
        const BarSeries =  VerticalBarSeries;
        let uniqueScores = {};
        let xVal = 1;
        _.forEach(usersBets, (user) => {
            let betKey = user.score1 + " : " + user.score2;
            if(!uniqueScores[betKey]) {
                uniqueScores[betKey] = xVal;
                xVal++;
            }
        });
        
        const barsNode = _.map(participates, (participate)=> {
            const pBet = _.find(usersBets, (user)=> user.userId === participate.userId);
            if(!pBet) return ;
            let gData = _.map((pBet,uniqueScores), (val, key) => {
                let valY = (pBet.score1 + " : " + pBet.score2) === key ? 1 : 0
                return { x: key, y: valY }
            });
            return (<BarSeries data={gData}  onNearestX={(datapoint, event)=>{}}  />)
        });

        const barsNode1 = [
            <BarSeries color="#391945" data={[{x: "2-0", y: 10}, {x: "3-0", y: 5}, {x: "3-1", y: 15}]} />,
            <BarSeries data={[{x: "2-0", y: 12}, {x: "3-0", y: 2}, {x: "3-1", y: 11}]} />
        ]
                
        

        return (
            <div>
            <FlexibleWidthXYPlot color="#608ba8" height={130}  stackBy="y" xType="ordinal" colorType="literal"
             style={{margin:"20px 5px 0 -5px", paddingBottom:"-20px"}} animation={1500,true} >
              {/* <VerticalGridLines /> */}
              {/* <HorizontalGridLines  /> */}
              <XAxis  />
              <YAxis  />
              {barsNode}
              {/* {value ? (
              <Hint
            value={value}
            align={{horizontal: Hint.ALIGN.AUTO, vertical: Hint.ALIGN.TOP_EDGE}}
          >
            <div className="rv-hint__content">{`(${value.x}, ${value.y})`}</div>
          </Hint>) : null} */}
            </FlexibleWidthXYPlot>
          </div>
            )
    }
    // const [value, rememberValue] = useState(1);



    const participates = useSelector(state => state.pools.participates);
    const otherBets = useSelector(state => state.pools.otherBets);
    const {challenge, usersBets} = otherBets;
    const participatesWithRank = getParticipatesWithRank(participates);
    return (
        <div id="content" style={{margin: "35px 8px 8px 8px"}} >
            {challenge ? <ChallengeDetails challenge={challenge}/> : ''}
            {/* <BetsGraph /> */}
            <BetsList
                usersBets={usersBets}
                participates={participatesWithRank}
            />
        </div>
    );
}
export default ViewOthers;