'use strict';
import React, {useRef} from 'react';
import {GoogleLogin} from '@react-oauth/google';
import {Button, Icon} from 'semantic-ui-react';

/**
 * Custom-styled button that triggers Google Identity Services credential flow
 * via a hidden official Google button (keeps ID token auth working).
 */
export default function GoogleSignInButton({label, onSuccess, onFailure, disabled}) {
    const hiddenGoogleRef = useRef(null);

    function triggerGoogleLogin() {
        const googleButton = hiddenGoogleRef.current?.querySelector('[role="button"]');
        if (!googleButton) {
            if (onFailure) {
                onFailure(new Error('Google sign-in is not ready yet'));
            }
            return;
        }
        googleButton.click();
    }

    return (
        <div className="auth-social-button-wrap">
            <div
                ref={hiddenGoogleRef}
                className="auth-social-button-wrap__hidden-google"
                aria-hidden="true"
            >
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if (!credentialResponse.credential) {
                            if (onFailure) {
                                onFailure(new Error('Google did not return a credential'));
                            }
                            return;
                        }
                        onSuccess({credential: credentialResponse.credential});
                    }}
                    onError={() => {
                        if (onFailure) {
                            onFailure(new Error('Google sign-in failed'));
                        }
                    }}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="1"
                />
            </div>
            <Button
                fluid
                size="large"
                type="button"
                onClick={triggerGoogleLogin}
                className="auth-social-button auth-social-button--google"
                disabled={disabled}
            >
                <Icon name="google" />
                {label}
            </Button>
        </div>
    );
}
