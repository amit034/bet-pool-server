import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {getUserBets, updateUserBet, updateUserBets} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {clearFocused, setFocused} from '../../actions/betPad';
import {connect} from 'react-redux';
import GameList from './GameList/GameList';
import BetPad from './GameList/BetPad';
import {Modal} from 'semantic-ui-react';
import ViewOthers from './ViewOthers';

class PoolContainer extends React.Component {
    constructor(props) {
        super(props);
        this.submitBets = this.submitBets.bind(this);
        this.onBetChange = this.onBetChange.bind(this);
        this.onBetFocused = this.onBetFocused.bind(this);
        this.onShowOthers = this.onShowOthers.bind(this);
        this.onShowOthersClose = this.onShowOthersClose.bind(this);
        this.state = {
            updates: {},
            showOthers: false
        }
    }

    componentDidMount() {
        this.props.dispatch(getUserBets(this.props.match.params.id));
    }

    onBetChange(challengeId, key, value) {
        const bet = _.get(this.props.bets, challengeId);
        const newBet = _.set(bet, key, value);
        this.props.dispatch(updateUserBet(this.props.match.params.id, challengeId, newBet))
    }

    onShowOthers() {
        this.setState({showOthers: true});
    }

    onShowOthersClose() {
        this.setState({showOthers: false});
    }

    onBetFocused(e, betId, betFieldName) {
        this.props.dispatch(setFocused(betId, e.target.value, e.target.offsetTop, betFieldName));
    }

    submitBets() {
        this.props.dispatch(updateUserBets(this.props.match.params.id, this.props.bets));
    }

    render() {
        const {bets} = this.props;
        return (<div>
            <GameList bets={bets}
                      onBetChange={this.onBetChange}
                      onShowOthers={this.onShowOthers}
                      onBetFocused={this.onBetFocused}
            />
            <Modal open={this.state.showOthers}
                   onClose={this.onShowOthersClose}
            >
                <Modal.Content>
                    <ViewOthers />
                </Modal.Content>
            </Modal>
            <BetPad focused={this.props.focused} onBetChange={this.onBetChange} />
            <NavigationMenu />
        </div>);

    }
}

function mapStateToProps({pools: {bets}, betPad}) {
    return {
        bets,
        focused: betPad
    }
}

export default withRouter(connect((mapStateToProps))(PoolContainer));
