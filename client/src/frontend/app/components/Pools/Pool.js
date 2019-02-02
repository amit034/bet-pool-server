import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Ink from 'react-ink';
import texts from '../../texts';
import {getUserFromLocalStorage} from '../../actions/auth';
import {DATE_TIME_FORMAT} from '../../globals';

const CLASS_NAMES = {
    CONTAINER: 'pool',
    BODY: 'pool-body',
    SIDE: 'pool-side',
    IMAGE: 'pool-image',
    CENTER: 'pool-center',
    TITLE: 'pool-title',
    BUY_IN: 'pool-info pool-buy-in',
    CHECK_IN: 'pool-info pool-last-check-in',
    PLAYERS: 'pool-info pool-players',
    POT: 'pool-info pool-pot',
    FIRST_PRICE: 'pool-info pool-first-price',
    FOOTER: 'pool-footer',
    ACTION: 'pool-action'
};

const DEFAULT_ACTIONS_OBJ = {
    action: () => {},
    name: texts.closed
};

const Pool = ({pool, enter, join}) => {
    const userId = _.get(getUserFromLocalStorage(), 'userId');
    const joined = _.find(pool.participates, (participate) => participate.user === userId && participate.joined);
    const actionObj = (moment(pool.lastCheckIn).isAfter(moment()) || joined) ?
        {action: joined ? enter : join, name: joined ? 'Enter' : 'Join'} :
        DEFAULT_ACTIONS_OBJ;
    const onClick = () => {
        return actionObj.action(pool._id);
    };
    return (<li className={CLASS_NAMES.CONTAINER}>
        <div className={CLASS_NAMES.BODY}>
            <div className={CLASS_NAMES.SIDE}>
                <img className={CLASS_NAMES.IMAGE}
                     role="presentation"
                     src={pool.image}
                />
            </div>
            <div className={CLASS_NAMES.CENTER}>
                <div>
                    <div className={CLASS_NAMES.TITLE}>{pool.name}</div>
                    <div className={CLASS_NAMES.BUY_IN}>
                        <div>{pool.buyIn}</div>
                        <div className={CLASS_NAMES.CHECK_IN}>
                            <div>{texts.deadline}</div>
                            <div>{moment(pool.lastCheckIn).format(DATE_TIME_FORMAT)}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className={CLASS_NAMES.PLAYERS}>
                        <div>{texts.players}</div>
                        <div>{_.size(pool.participates)}</div>
                    </div>
                    <div className={CLASS_NAMES.POT}>
                        <div>{texts.pot}</div>
                        <div>{pool.pot}</div>
                    </div>
                    <div className={CLASS_NAMES.FIRST_PRICE}>
                        <div>{texts.first}</div>
                        <div>{_.first(pool.prices)}</div>
                    </div>
                </div>
            </div>
        </div>
        <div className={CLASS_NAMES.FOOTER}>
            <div className={CLASS_NAMES.ACTION}>
                <a onClick={onClick}>{actionObj.name}</a>
            </div>
        </div>
    </li>);
};

export default Pool;

Pool.propTypes = {
    pool: PropTypes.object
};

Pool.defaultProps = {};
