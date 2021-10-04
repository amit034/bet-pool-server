import React from 'react';
import _ from 'lodash';
import NavigationMenu from './NavigationMenu';
import { withRouter } from 'react-router-dom';
import { getPoolParticipates } from '../../actions/pools';
import { connect } from 'react-redux';
import classNames from 'classnames';

class LeadersContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch(getPoolParticipates(this.props.match.params.id));
    }

    render() {
        const LeaderList = ({ participates }) => {
            const leaders = _.orderBy(participates, 'score', 'desc');
            const LeaderNode = _.map(leaders, (participate, idx) => {
                return (<Leader participate={participate} key={participate.id} idx={idx} />)
            });
            return (<div><ul className="leader-list" style={{ marginTop: '30px' }}>{LeaderNode}</ul></div>);
        };
        const Leader = ({ participate, idx }) => {

            const medals = _.map(_.forOwnRight(participate.medals), (medal, key) => {
                const className = classNames('icon star large fitted', { 'bronze-medal': key === "1", 'sliver-medal': key === "2", 'gold-medal': key === "3" });
                return (<div className="leader-medal">
                    <i className={className}></i>
                    <div className="medal-badge">{medal}</div>
                </div>);
            });
            return (
                <li className="leader-row">
                    <div className="leader-body">
                        <div className="leader-rank">{idx + 1}. </div>
                        <div className="leader-side">
                            <img className="leader-image" src={participate.picture} alt={participate.username} title={participate.username} />
                        </div>
                        <div className="leader-center">
                            <div className="leader-name">{participate.firstName}</div>
                            <div className="leader-medals">
                                {medals}
                            </div>
                            <div className="leader-score">{participate.score}</div>
                        </div>
                    </div>
                </li>);
        };
        return (
            <div id="content" class="ui container">
                {/*<a href="#" className="list-group-item" onClick={() =>  this.props.history.push(`/pools/${this.props.match.params.id}`)}>Back to Bets</a>*/}
                <LeaderList
                    participates={this.props.pools.participates}
                />
                <NavigationMenu />
            </div>
        );
    }
}

export default withRouter(connect(({ pools }) => ({ pools }))(LeadersContainer));