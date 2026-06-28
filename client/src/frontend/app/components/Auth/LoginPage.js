import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import _ from 'lodash';
import GoogleSignInButton from './GoogleSignInButton';
import {
    loginError,
    loginUser,
    registerUser,
    registerWithFacebookToken,
    registerWithGoogleToken,
    verifyFacebookToken,
    verifyGoogleToken,
} from '../../actions/auth';
import LoginForm from './LoginForm';
import {Button, Icon} from 'semantic-ui-react';
import RegistrationForm from './RegistrationForm';

const LoginPage = ({register = false}) => {
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const history = useHistory();
    const storedMessage = localStorage.getItem('successMessage');
    let successMessage = '';

    if (storedMessage) {
        successMessage = storedMessage;
        localStorage.removeItem('successMessage');
    }

    const [state, setState] = useState({
        errors: {},
        successMessage,
        user: {},
    });

    function facebookResponse(response) {
        const verifyFacebook = register ? registerWithFacebookToken : verifyFacebookToken;
        dispatch(verifyFacebook(response));
    }

    function googleResponse(response) {
        const verifyGoogle = register ? registerWithGoogleToken : verifyGoogleToken;
        dispatch(verifyGoogle(response));
    }

    function googleFailure(err) {
        dispatch(loginError(_.get(err, 'message', 'Google sign-in failed')));
    }

    function processForm(event) {
        event.preventDefault();
        dispatch(loginUser(state.user));
    }

    function processRegisterForm(event) {
        event.preventDefault();
        dispatch(registerUser(state.user));
    }

    function changeUser(event) {
        const field = event.target.name;
        const value = event.target.value;
        setState((prev) => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value,
            },
        }));
    }

    function goToRegister() {
        history.push('/register');
    }

    function goToLogin() {
        history.push('/');
    }

    const FormComp = register ? RegistrationForm : LoginForm;
    const onSubmit = register ? processRegisterForm : processForm;
    const socialPrefix = register ? 'Register' : 'Login';

    return (
        <div className="auth-page">
            <div className="auth-page__inner">
                <div className="auth-card">
                    <div className="auth-card__brand">
                        <div className="auth-card__logo" aria-hidden="true" />
                        <h1 className="auth-card__title">Liga Bet</h1>
                        <p className="auth-card__tagline">
                            Predict results, earn points, beat your friends
                        </p>
                    </div>

                    <div className="auth-card__header">
                        <h2 className="auth-card__heading">
                            {register ? 'Create your account' : 'Welcome back'}
                        </h2>
                        <p className="auth-card__subheading">
                            {register
                                ? 'Join pools and compete on live football predictions.'
                                : 'Sign in to view your pools and place your bets.'}
                        </p>
                    </div>

                    <div className="auth-card__body">
                        <div className="auth-card__form">
                            <FormComp
                                onSubmit={onSubmit}
                                onChange={changeUser}
                                errors={{summary: auth.errorMessage}}
                                successMessage={state.successMessage}
                                user={state.user}
                                goToRegister={goToRegister}
                                goToLogin={goToLogin}
                                loading={auth.isFetching}
                            />
                        </div>

                        <div className="auth-card__divider" aria-hidden="true">
                            <span>or</span>
                        </div>

                        <div className="auth-card__social">
                            <FacebookLogin
                                appId="476316572540105"
                                autoLoad={false}
                                fields="name,email,picture,app_name"
                                render={(renderProps) => (
                                    <Button
                                        fluid
                                        size="large"
                                        type="button"
                                        onClick={renderProps.onClick}
                                        className="auth-social-button auth-social-button--facebook"
                                        disabled={auth.isFetching}
                                    >
                                        <Icon name="facebook" />
                                        {socialPrefix} with Facebook
                                    </Button>
                                )}
                                callback={facebookResponse}
                            />
                            <GoogleSignInButton
                                label={`${socialPrefix} with Google`}
                                onSuccess={googleResponse}
                                onFailure={googleFailure}
                                disabled={auth.isFetching}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
