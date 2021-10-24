import React from 'react';
import _ from 'lodash';
import NavigationMenu from './NavigationMenu';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates} from '../../actions/pools';
import {connect} from 'react-redux';
import classNames from 'classnames';

class LeadersContainer extends React.Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){
      this.props.dispatch(getPoolParticipates(this.props.match.params.id));
  }

  render(){
    const LeaderList = ({participates}) => {
        const leaders = _.orderBy(participates, ['score', 'medals.3', 'medals.2'], ['desc', 'desc', 'desc']);
        const LeaderNode = _.map(leaders, (participate) => {
            return (<Leader participate={participate} key={participate.id} rank={_.sortedIndexBy(leaders, participate, (p) => {
                return -1 * (p.score * 1000000 + p.medals[3] * 10000 +  p.medals[2] * 100 + p.medals[1]);
            }) + 1}/>)
        });
        return (<div><ul className="leader-list" style={{marginTop: '30px'}}>{LeaderNode}</ul></div>);
    };
    const Leader = ({participate, key, rank}) => {

    const medals = _.map(_.forOwnRight(participate.medals), (medal, idx)=> {
        const className = classNames('icon star large fitted', {'bronze-medal': idx === "1", 'sliver-medal': idx === "2", 'gold-medal': idx === "3"});
        return (<div className="leader-medal">
            <i className={className}></i>
            <div className="medal-badge">{medal}</div>
        </div>);
    }) ;
    return (
            <li className="leader-row" key={key}>
                <div className="leader-body">
                    <div className="leader-rank"> {rank}. </div>
                    <div className="leader-side">
                        <img className="leader-image" src={participate.picture} alt={participate.username} title={participate.username}/>
                    </div>
                    <div className="leader-center">
                        <div className="leader-name">{participate.firstName} {participate.lastName}</div>
                        <div className="leader-medals">
                            {medals}
                        </div>
                        <div className="leader-score-box"><span className="leader-score-numbers">{participate.score}</span></div>
                    </div>
                </div>
            </li>);
    };
    return (
      <div id="content" class="ui container">
        <LeaderList
            participates={this.props.pools.participates}
        />
        <NavigationMenu  />
      </div>
    );
  }
}

export default withRouter(connect(({pools}) => ({pools}))(LeadersContainer));