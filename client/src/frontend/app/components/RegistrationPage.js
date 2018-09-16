import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
//import FacebookLogin from 'react-facebook-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import {GoogleLogin} from 'react-google-login';
import {registerUser, registerWithFacebookToken, registerWithGoogleToken} from '../actions/auth';
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
        return (<div style={{height: '100%'}}>
                <Header as='h2' color='teal' textAlign='center'>
                    Create An Account
                </Header>
                <Grid container columns={2} divided relaxed stackable textAlign='center' verticalAlign='middle'>
                    <Grid.Row stretched>
                        <Grid.Column style={{maxWidth: 450}}>
                            <Form size='large'>
                                <FacebookLogin
                                    appId="476316572540105"
                                    autoLoad={false}
                                    fields="name,email,picture,app_name"
                                    render={renderProps => (
                                        <div className="field">
                                            <Button fluid size='large' color='facebook' onClick={renderProps.onClick}>
                                                <Icon name='facebook' /> Register with Facebook
                                            </Button>
                                        </div>
                                    )}
                                    callback={this.facebookResponse} />
                                <GoogleLogin
                                    clientId="1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com"
                                    onSuccess={this.googleResponse}
                                    render={renderProps => (
                                        <div className="field">
                                            <Button fluid size='large' color='google plus' onClick={renderProps.onClick}>
                                                <Icon name='google' /> Register with Google
                                            </Button>
                                        </div>
                                    )}
                                />
                            </Form>
                        </Grid.Column>
                        <Grid.Column style={{maxWidth: 450}}>
                            <RegistrationForm
                                onSubmit={this.processForm}
                                onChange={this.changeUser}
                                errors={{summary: this.props.auth.errorMessage}}
                                successMessage={this.state.successMessage}
                                user={this.state.user}
                                goToRegister={this.goToRegister}
                            />
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