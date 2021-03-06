import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
//import FacebookLogin from 'react-facebook-login';
import {GoogleLogin} from 'react-google-login';
import {loginUser, verifyFacebookToken, verifyGoogleToken} from '../../actions/auth';
import LoginForm from './LoginForm';
import {Button, Grid, Icon, Header ,Form} from 'semantic-ui-react'

class LoginPage extends React.Component {

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
            user: {
            }
        };

        this.processForm = this.processForm.bind(this);
        this.changeUser = this.changeUser.bind(this);
        this.facebookResponse = this.facebookResponse.bind(this);
        this.googleResponse = this.googleResponse.bind(this);
        this.goToRegister = this.goToRegister.bind(this);
    }

    facebookResponse(response) {
        this.props.dispatch(verifyFacebookToken(response));
    }

    googleResponse(response) {
        this.props.dispatch(verifyGoogleToken(response));
    }

    /**
     * Process the form.
     *
     * @param {object} event - the JavaScript event object
     */
    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();

        // create a string for an HTTP body message
        // const email = encodeURIComponent(this.state.user.email);
        // const password = encodeURIComponent(this.state.user.password);

        this.props.dispatch(loginUser(this.state.user));
        // axios.post(this.apiUrl, {username, password})
        // .then((res) => {
        //     this.setState({
        //       errors: {}
        //     });
        //     Auth.authenticateUser(res.data);
        //     this.context.router.replace('/');
        // }).catch((err) => {
        //     const errors = err ? err : {};
        //     errors.summary = err.message;
        //    this.setState({
        //      errors
        //    });
        // });
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

    goToRegister(){
        this.props.history.push(`/#/register`)
    }
    /**
     * Render the component.
     */
    render() {
        return (<div style={{ height: '100%' }}>
            <Header as='h2' color='teal' textAlign='center'>
              Log-in to your account
            </Header>
            <Grid container columns={2} divided relaxed stackable textAlign='center' verticalAlign='middle'>
                <Grid.Row stretched>
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Form size='large'>
                            <FacebookLogin
                                appId="476316572540105"
                                autoLoad={false}
                                fields="name,email,picture,app_name"
                                render={renderProps => (
                                    <div className="field">
                                        <Button fluid size='large' color='facebook' onClick={renderProps.onClick}>
                                            <Icon name='facebook' /> Facebook
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
                                            <Icon name='google' /> Google
                                        </Button>
                                    </div>
                                )}
                            />
                        </Form>
                    </Grid.Column>
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <LoginForm
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

LoginPage.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(({auth}) => ({auth}))(LoginPage);