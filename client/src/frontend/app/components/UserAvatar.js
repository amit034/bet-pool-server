'use strict';
import React, {useState, useEffect} from 'react';
import classNames from 'classnames';
import {
    avatarColorSeed,
    hasUsablePicture,
    initialsAvatarColor,
    userAvatarLabel,
    userDisplayInitials,
} from '../utils/userAvatar';

export default function UserAvatar({
    user,
    className,
    alt,
    title,
    style,
    ...rest
}) {
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = hasUsablePicture(user) && !imgFailed;
    const initials = userDisplayInitials(user);
    const label = alt || title || userAvatarLabel(user);
    const bgColor = initialsAvatarColor(avatarColorSeed(user));

    useEffect(() => {
        setImgFailed(false);
    }, [user && user.picture, user && user.userId]);

    if (showImage) {
        return (
            <img
                {...rest}
                className={classNames('user-avatar', 'user-avatar--image', className)}
                src={user.picture}
                alt={label}
                title={title || label}
                style={style}
                onError={() => setImgFailed(true)}
            />
        );
    }

    return (
        <span
            {...rest}
            className={classNames('user-avatar', 'user-avatar--initials', className)}
            style={{...style, backgroundColor: bgColor}}
            title={title || label}
            role="img"
            aria-label={label}
        >
            <span className="user-avatar__initials">{initials}</span>
        </span>
    );
}
