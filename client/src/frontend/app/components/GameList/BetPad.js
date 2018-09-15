import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
export default class  BetPad extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onClick = this.onClick.bind(this);
        this.state = {
            score: 0
        };

    }
    onClick(e, betId, betFieldName, score){
        this.setState({score}, () => {
            this.props.onBetChange(betId, betFieldName, score);
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.focused !== this.props.focused){
            this.setState({
                score: nextProps.focused.value
            });
        }
    }
    // shouldComponentUpdate(nextProps, nextState){
    //     return !_.isEqual(_.get(nextProps, 'pools.bets'), _.get(this.props, 'pools.bets')); // equals() is your implementation
    //   }
    // shouldComponentUpdate(nextProps, nextState){
    //     return nextProps.focused && !_.isEqual(_.get(nextProps, 'focused'), _.get(this.props, 'focused')); // equals() is your implementation
    // }

    render() {
        const {focused} = this.props;
        const {score} = this.state;
        const badNodes =_.map(!_.isEmpty(focused) && _.range(10), (key) => {
            const className = classNames('bet-pad-score', {'bet-pad-score-selected': key === _.parseInt(score)});
            return (<span key={key} className={className} onClick={(e) => this.onClick(e, focused.betId, focused.betFieldName, key)}>{key}</span>);
        });
        const style = !_.isEmpty(focused) ? {top: focused.top + 34, display:'flex'} : {display:'none'};
        return (<div className="bet-pad" style={style}>
            {badNodes}
        </div>);  
    }
}

BetPad.propTypes = {
    focused: PropTypes.object, onBetChange: PropTypes.func
};
BetPad.defaultProps = {
};