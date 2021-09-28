import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
//import FacebookLogin from 'react-facebook-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import {GoogleLogin} from 'react-google-login';
import {TiSocialFacebook} from 'react-icons/ti';
import {TiSocialGooglePlus} from 'react-icons/ti';
import {registerUser, registerWithFacebookToken, registerWithGoogleToken} from '../../actions/auth';
import {Button, Form, Grid, Header, Icon} from 'semantic-ui-react'
import RegistrationForm from './RegistrationForm';

class RegistrationPage extends React.Component {

    /**
     * Class constructor.
     */
    constructor(props, context) {
        super(props, context);
        const storedMessage = localStorage.getItem('successMessage');
        let successMessage = '';

        if (storedMessage) {
            successMessage = storedMessage;
            localStorage.removeItem('successMessage');
        }

        // set the initial component state
        this.state = {
            errors: {},
            successMessage,
            user: {}
        };

        this.processForm = this.processForm.bind(this);
        this.changeUser = this.changeUser.bind(this);
        this.facebookResponse = this.facebookResponse.bind(this);
        this.googleResponse = this.googleResponse.bind(this);
    }

    facebookResponse(response) {
        this.props.dispatch(registerWithFacebookToken(response));
    }

    googleResponse(response) {
        this.props.dispatch(registerWithGoogleToken(response));
    }

    /**
     * Process the form.
     *
     * @param {object} event - the JavaScript event object
     */
    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();
        this.props.dispatch(registerUser(this.state.user));
    }

    /**
     * Change the user object.
     *
     * @param {object} event - the JavaScript event object
     */
    changeUser(event) {
        const field = event.target.name;
        const user = this.state.user;
        user[field] = event.target.value;

        this.setState({
            user
        });
    }

    /**
     * Render the component.
     */
    render() {
        return (<div style={{height: '100%'}} className={'login-page'}>
                <Header as='h2' textAlign='center'  className={'login-header'}>
                    Create An Account
                </Header>
                <Grid container columns={2} divided relaxed stackable textAlign='center' verticalAlign='middle'>
                    <Grid.Row stretched>
                        <Grid.Column style={{maxWidth: 450}} className={'login-container'}>
                            <RegistrationForm
                                onSubmit={this.processForm}
                                onChange={this.changeUser}
                                errors={{summary: this.props.auth.errorMessage}}
                                successMessage={this.state.successMessage}
                                user={this.state.user}
                                goToRegister={this.goToRegister}
                            />
                        </Grid.Column>
                        <Grid.Column style={{maxWidth: 450}} className={'social-login-container'}>
                            Or register with
                            <Form size='large'>
                                <FacebookLogin
                                    appId="476316572540105"
                                    autoLoad={false}
                                    fields="name,email,picture,app_name"
                                    render={renderProps => (
                                        <div className="social-button facebook-button">
                                            <button onClick={renderProps.onClick}>
                                                <TiSocialFacebook  style={{color: '#334a97', fontSize: '1.5em' }} />
                                            </button>
                                        </div>
                                    )}
                                    callback={this.facebookResponse} />
                                <GoogleLogin
                                    clientId="1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com"
                                    onSuccess={this.googleResponse}
                                    render={renderProps => (
                                        <div className="social-button">
                                            <Button  onClick={renderProps.onClick} >
                                                <TiSocialGooglePlus style={{color: 'red', fontSize: '1.5em' }}/>
                                            </Button>
                                        </div>
                                    )}
                                />
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }

}

RegistrationPage.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(({auth}) => ({auth}))(RegistrationPage)