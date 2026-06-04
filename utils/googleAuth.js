'use strict';
const axios = require('axios');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    || '1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com';

function normalizeProfile(payload) {
    const email = payload.email;
    if (!email) {
        throw new Error('Google account has no email');
    }
    return {
        id: String(payload.sub || payload.id),
        displayName: payload.name || email,
        emails: [{value: email}],
        _json: {
            given_name: payload.given_name || '',
            family_name: payload.family_name || '',
            picture: payload.picture || null,
        },
    };
}

async function verifyGoogleAccessToken(accessToken) {
    const {data} = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {Authorization: `Bearer ${accessToken}`},
        timeout: 10000,
    });
    return normalizeProfile(data);
}

async function verifyGoogleIdToken(idToken) {
    const {data} = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: {id_token: idToken},
        timeout: 10000,
    });
    if (data.aud !== GOOGLE_CLIENT_ID) {
        throw new Error('Invalid Google token audience');
    }
    return normalizeProfile(data);
}

/**
 * @param {{ access_token?: string, id_token?: string, credential?: string }} body
 */
async function profileFromGoogleRequestBody(body) {
    const accessToken = body && (body.access_token || body.accessToken);
    const idToken = body && (body.id_token || body.credential || body.idToken);
    if (idToken) {
        return verifyGoogleIdToken(idToken);
    }
    if (accessToken) {
        return verifyGoogleAccessToken(accessToken);
    }
    throw new Error('Google access_token or id_token required');
}

module.exports = {
    GOOGLE_CLIENT_ID,
    profileFromGoogleRequestBody,
};
