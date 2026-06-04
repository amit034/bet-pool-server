'use strict';
import React from 'react';
import {useGoogleLogin} from '@react-oauth/google';
import {Button, Icon} from 'semantic-ui-react';

/**
 * Google Identity Services (replaces deprecated react-google-login).
 * Uses implicit flow so the backend still receives access_token.
 */
export default function GoogleSignInButton({label, onSuccess, onFailure}) {
    const login = useGoogleLogin({
        flow: 'implicit',
        onSuccess: (tokenResponse) => {
            if (!tokenResponse || !tokenResponse.access_token) {
                if (onFailure) {
                    onFailure(new Error('Google did not return an access token'));
                }
                return;
            }
            onSuccess({accessToken: tokenResponse.access_token});
        },
        onError: (err) => {
            if (onFailure) {
                onFailure(err || new Error('Google sign-in failed'));
            }
        },
    });

    return (
        <div className="field login-input">
            <Button
                fluid
                size="large"
                type="button"
                onClick={() => login()}
                className="social-button google-button"
            >
                <Icon name="google" /> {label}
            </Button>
        </div>
    );
}
