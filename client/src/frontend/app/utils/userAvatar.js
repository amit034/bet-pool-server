'use strict';
import _ from 'lodash';

const PLACEHOLDER_PICTURE_MARKERS = [
    '765-default-avatar',
    'default-avatar.png',
    'gravatar.com/avatar/?',
    'gravatar.com/avatar/\\?',
    'd=mp&f=y',
    'd=identicon',
    'd=monsterid',
    'd=wavatar',
    'd=retro',
    'd=robohash',
    'd=blank',
];

function hashString(str) {
    const s = String(str || '');
    let hash = 0;
    for (let i = 0; i < s.length; i += 1) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export function userDisplayInitials(user) {
    if (!user) {
        return '?';
    }
    const first = _.trim(user.firstName || '');
    const last = _.trim(user.lastName || '');
    const username = _.trim(user.username || '');

    if (first && last) {
        return `${first[0]}${last[0]}`.toUpperCase();
    }
    if (first.length >= 2) {
        return first.slice(0, 2).toUpperCase();
    }
    if (first) {
        return first[0].toUpperCase();
    }
    if (last.length >= 2) {
        return last.slice(0, 2).toUpperCase();
    }
    if (last) {
        return last[0].toUpperCase();
    }
    if (username.length >= 2) {
        return username.slice(0, 2).toUpperCase();
    }
    if (username) {
        return username[0].toUpperCase();
    }
    return '?';
}

export function avatarColorSeed(user) {
    if (!user) {
        return 'user';
    }
    return String(
        user.userId
        || user.username
        || `${user.firstName || ''}${user.lastName || ''}`
        || user.picture
        || 'user'
    ).toLowerCase();
}

/**
 * Deterministic pastel-ish HSL from name letters — same user always gets the same color.
 */
export function initialsAvatarColor(seed) {
    const base = String(seed || 'user');
    const hue = Math.abs(hashString(base)) % 360;
    const saturation = 52 + (Math.abs(hashString(`${base}:s`)) % 23);
    const lightness = 58 + (Math.abs(hashString(`${base}:l`)) % 14);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function hasUsablePicture(user) {
    const pic = _.trim(_.get(user, 'picture'));
    if (!pic) {
        return false;
    }
    const lower = pic.toLowerCase();
    return !_.some(PLACEHOLDER_PICTURE_MARKERS, (marker) => lower.includes(marker));
}

export function userAvatarLabel(user) {
    const first = _.trim(_.get(user, 'firstName', ''));
    const last = _.trim(_.get(user, 'lastName', ''));
    const full = _.trim(`${first} ${last}`);
    return full || _.get(user, 'username', '') || 'User';
}
