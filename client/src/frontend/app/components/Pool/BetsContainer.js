import React from 'react';
import GameList from "./GameList/GameList";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
class BetsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onShowOthers = this.onShowOthers.bind(this);
    }
    onShowOthers(challengeId){
        this.props.history.push(`/pools/${this.props.match.params.id}/challenges/${challengeId}/participates`);
    }
    render() {
        return (
            <GameList poolId={this.props.match.params.id}
                      onBetChange={this.onBetChange}
                      onBetKeyChange={this.onBetKetChange}
                      onShowOthers ={this.onShowOthers}
                      onBetFocused={this.onBetFocused} />
        );
    }
}
export default withRouter(connect(({pools}) => ({pools}))(BetsContainer));