import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates} from '../../actions/pools';
import {connect} from 'react-redux';

const UserBet = ({participate}) => {
    return (
        <li className="user-bet-row">
            <div className="user-bet-body">
                <div className="user-bet-side">
                    <img className="user-bet-image"
                         src={participate.picture}
                         role="presentation"
                         alt={participate.username}
                         title={participate.username}
                    />
                </div>
                <div className="user-bet-center">
                    <div className="user-bet-name">{participate.firstName} {participate.lastName}</div>
                    <div className="user-bet-score1">{participate.score1}</div>
                    <div className="user-bet-score2">{participate.score2}</div>
                </div>
            </div>
        </li>);
};

class ViewOthers extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(getPoolParticipates(this.props.match.params.id, this.props.match.params.challengeId));
    }

    render() {
        const {participates} = this.props.pools;
        const userBets = _.orderBy(participates, 'score', 'desc');
        const userBetsNode = _.map(userBets, (participate) => {
            return (<UserBet participate={participate} key={participate._id} />)
        });
        return (<ul className="users-bets-list">{userBetsNode}</ul>);
    }
}

export default withRouter(connect(({pools}) => ({pools}))(ViewOthers));
