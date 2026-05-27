'use strict';
import React, {useState, useCallback} from 'react';
import {useHistory} from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {Button, Icon, Image, Input, Loader, Message} from 'semantic-ui-react';
import {useDispatch} from 'react-redux';
import {joinPool} from '../../actions/pools';

function ownerDisplayName(owner) {
    if (!owner) {
        return 'Someone';
    }
    const full = _.trim(`${owner.firstName || ''} ${owner.lastName || ''}`);
    return full || owner.username || 'Someone';
}

function avatarSrc(user) {
    if (user && user.picture) {
        return user.picture;
    }
    return 'https://www.gravatar.com/avatar/?d=mp&f=y';
}

const PoolPreview = ({
    poolId,
    preview,
    loading,
    error,
    infoMode,
    joinCodeInitial,
    onJoined,
    onDismiss,
}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [poolCode, setPoolCode] = useState(joinCodeInitial || '');
    const [joinBusy, setJoinBusy] = useState(false);
    const [joinErr, setJoinErr] = useState(null);

    const handleJoin = useCallback(() => {
        if (!preview || !preview.canJoin) {
            return;
        }
        setJoinBusy(true);
        setJoinErr(null);
        const code = preview.public ? undefined : (poolCode || joinCodeInitial);
        dispatch(joinPool(poolId, code ? {code} : {}))
            .then(() => {
                if (onJoined) {
                    onJoined();
                } else {
                    history.replace(`/pools/${poolId}?active=true`);
                }
            })
            .catch((ex) => {
                setJoinErr(_.get(ex, 'response.data.error', ex.message || 'Could not join pool'));
            })
            .then(() => setJoinBusy(false), () => setJoinBusy(false));
    }, [dispatch, poolId, preview, poolCode, joinCodeInitial, onJoined, history]);

    const handleEnter = () => {
        history.push(`/pools/${poolId}?active=true`);
    };

    const handleMaybeLater = () => {
        if (onDismiss) {
            onDismiss();
        } else {
            history.push('/pools');
        }
    };

    if (loading) {
        return (
            <div className="pool-preview-page">
                <Loader active inline="centered">Loading pool…</Loader>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pool-preview-page">
                <Message negative>{error}</Message>
                <Button basic onClick={handleMaybeLater}>Back to pools</Button>
            </div>
        );
    }

    if (!preview) {
        return null;
    }

    const ownerName = ownerDisplayName(preview.owner);
    const friends = preview.friendsParticipating || {items: [], othersCount: 0};
    const showJoinFlow = !infoMode && !preview.isParticipant;
    const showEnterCta = infoMode || preview.isParticipant;

    return (
        <div className="pool-preview-page">
            <div className="pool-preview-card">
                <div className="pool-preview-card__header">
                    <h1 className="pool-preview-card__title">{preview.name}</h1>
                    <div className={`pool-preview-status ${preview.isOpen ? 'pool-preview-status--open' : 'pool-preview-status--closed'}`}>
                        <span className="pool-preview-status__dot" />
                        {preview.isOpen ? 'Open for Registration' : 'Registration Closed'}
                    </div>
                </div>

                <div className="pool-preview-card__body">
                    <div className="pool-preview-inviter">
                        <Image circular src={avatarSrc(preview.owner)} className="pool-preview-avatar" />
                        <span className="pool-preview-inviter__text">
                            {preview.isInvited ? `${ownerName} invites you to join!` : `Hosted by ${ownerName}`}
                        </span>
                    </div>

                    <div className="pool-preview-section">
                        <h3 className="pool-preview-section__title">
                            <Icon name="users" /> Pool Details
                        </h3>
                        <ul className="pool-preview-details">
                            <li>
                                <Icon name="money" className="pool-preview-details__icon" />
                                <span>Total Pot:</span>
                                <strong>{preview.pot} NIS</strong>
                            </li>
                            <li>
                                <Icon name="trophy" className="pool-preview-details__icon" />
                                <span>First Prize:</span>
                                <strong>{preview.firstPrize} NIS</strong>
                            </li>
                            <li>
                                <Icon name="user" className="pool-preview-details__icon" />
                                <span>Players:</span>
                                <strong>
                                    {_.get(preview, 'players.joined', 0)} / {_.get(preview, 'players.total', 0)}
                                </strong>
                            </li>
                            <li>
                                <Icon name="calendar alternate" className="pool-preview-details__icon" />
                                <span>Join Deadline:</span>
                                <strong>
                                    {preview.lastCheckIn
                                        ? moment(preview.lastCheckIn).format('DD/MM/YY HH:mm')
                                        : '—'}
                                </strong>
                            </li>
                        </ul>
                    </div>

                    {!_.isEmpty(friends.items) && (
                        <div className="pool-preview-section">
                            <h3 className="pool-preview-section__title">
                                <Icon name="group" /> Join with friends
                            </h3>
                            <div className="pool-preview-friends">
                                {_.map(friends.items, (f) => (
                                    <Image
                                        key={f.userId}
                                        circular
                                        src={avatarSrc(f)}
                                        className="pool-preview-avatar pool-preview-friends__avatar"
                                        title={f.username}
                                    />
                                ))}
                                {friends.othersCount > 0 && (
                                    <span className="pool-preview-friends__more">
                                        … + {friends.othersCount} others
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {showJoinFlow && !preview.public && !joinCodeInitial && (
                        <div className="pool-preview-code">
                            <Input
                                fluid
                                placeholder="Enter pool code"
                                value={poolCode}
                                onChange={(e, {value}) => setPoolCode(value)}
                            />
                        </div>
                    )}

                    {joinErr && <Message negative size="small">{joinErr}</Message>}

                    {showEnterCta ? (
                        <Button
                            className="pool-preview-cta"
                            fluid
                            size="large"
                            onClick={handleEnter}
                        >
                            Enter pool
                        </Button>
                    ) : (
                        <Button
                            className="pool-preview-cta"
                            fluid
                            size="large"
                            disabled={!preview.canJoin || joinBusy}
                            loading={joinBusy}
                            onClick={handleJoin}
                        >
                            I&apos;M IN – JOIN NOW
                        </Button>
                    )}

                    <button type="button" className="pool-preview-later" onClick={handleMaybeLater}>
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PoolPreview;
