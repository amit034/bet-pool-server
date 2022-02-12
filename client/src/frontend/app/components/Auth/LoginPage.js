import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import {useVideo, useLocalStorage} from 'react-use';
import backgroundVideo from '../../../video/intro.mp4';
import {GoogleLogin} from 'react-google-login';
import {
    loginUser,
    registerUser,
    registerWithFacebookToken, registerWithGoogleToken,
    verifyFacebookToken,
    verifyGoogleToken
} from '../../actions/auth';
import LoginForm from './LoginForm';
import {Button, Grid, Icon, Header ,Form} from 'semantic-ui-react';
import RegistrationForm from "./RegistrationForm";

const LoginPage = ({register = false, muteSite, unMuteSite}) => {
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const history = useHistory();
    const [mute] = useLocalStorage('mute', 'false');
    const storedMessage = localStorage.getItem('successMessage');
    let successMessage = '';

    if (storedMessage) {
        successMessage = storedMessage;
        localStorage.removeItem('successMessage');
    }

    // set the initial component state
    const [state, setState] = useState({
        errors: {},
        successMessage,
        user: {
        }
    });

    const [video, videoState, controls, ref] = useVideo(
        <video autoPlay playsInline muted={mute === 'true'} id='video'>
            <source src={backgroundVideo} type='video/mp4'/>
        </video>
    );
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.addEventListener('ended', () => {
                controls.mute();
                controls.play();
            });
        }
    }, [video]);
    function facebookResponse(response) {
        const verifyFacebook = register ? registerWithFacebookToken : verifyFacebookToken;
        dispatch(verifyFacebook(response));
    }

    function googleResponse(response) {
        const verifyGoogle= register ? registerWithGoogleToken : verifyGoogleToken;
        dispatch(verifyGoogle(response));
    }

    function processForm(event) {
        event.preventDefault();
        dispatch(loginUser(state.user));
    }

    function processRegisterForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();
        dispatch(registerUser(state.user));
    }

    function changeUser(event) {
        const field = event.target.name;
        const user = state.user;
        user[field] = event.target.value;
        setState({
            user
        });
    }

    function goToRegister(){
        history.push(`/register`);
    }
    const FormComp = register ? RegistrationForm : LoginForm;
    const onSubmit = register ? processRegisterForm : processForm;
    const socialPrefix = register ? 'Register' : 'Login';
    return (<div style={{ height: '100%' }} >
            {video}
            {<Button className='mute-btn' icon={mute === 'true' ? 'volume up' : 'volume off'}  onClick={mute? unMuteSite : muteSite} />}
            <div style={{ height: '100%' }} className={'login-page'}>
                <div className={'login-logo'}>
                </div>
                <Header as='h2' textAlign='center' className={'login-header'}>
                    I Dare U
                </Header>
                <Header as='h4' textAlign='center' className={'login-sub-header'}>
                    Challenge your friends to beat you in football predictions
                </Header>
            <Grid columns={2} divided relaxed stackable textAlign='center' verticalAlign='middle'>
                <Grid.Column  stretched style={{maxWidth:450}}>
                    <Grid.Column  className={'login-container'}>
                            <FormComp
                                onSubmit={onSubmit}
                                onChange={changeUser}
                                errors={{summary: auth.errorMessage}}
                                successMessage={state.successMessage}
                                user={state.user}
                                goToRegister={goToRegister}
                            />
                        </Grid.Column>
                    <Grid.Column  className={'social-login-container'}>
                            <Form size='large'>
                                <p className='social-login-title'><span>Or</span></p>
                                <FacebookLogin
                                    appId="476316572540105"
                                    autoLoad={false}
                                    fields="name,email,picture,app_name"

                                    render={renderProps => (
                                        <div className="field login-input">
                                            <Button fluid size='large' onClick={renderProps.onClick} className={'social-button facebook-button'}>
                                                <Icon name='facebook' /> {socialPrefix} with Facebook
                                            </Button>
                                        </div>
                                    )}
                                    callback={facebookResponse} />
                                <GoogleLogin
                                    clientId="1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com"
                                    onSuccess={googleResponse}
                                    cssClass="social-login"
                                    render={renderProps => (
                                        <div className="field login-input">
                                            <Button fluid size='large' onClick={renderProps.onClick}  className={'social-button google-button'}>
                                                <Icon name='google' /> {socialPrefix} with Google
                                            </Button>
                                        </div>
                                    )}
                                />
                            </Form>
                        </Grid.Column>
                </Grid.Column>
                </Grid>
            </div>
        </div>
    );
};

export default LoginPage;