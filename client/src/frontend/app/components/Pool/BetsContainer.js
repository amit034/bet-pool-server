import React from 'react';
import _ from 'lodash';
import NavigationMenu from './NavigationMenu';
import {withRouter} from 'react-router-dom';
import {getPoolParticipates} from '../../actions/pools';
import {connect} from 'react-redux';
import classNames from 'classnames';
import GameList from "./GameList/GameList";
import React from "react";
class BetsContainer extends React.Component {
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
