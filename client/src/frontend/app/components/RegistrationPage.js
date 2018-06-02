import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import FacebookLogin from 'react-facebook-login';
import {GoogleLogin} from 'react-google-login';
import {registerUser, registerWithFacebookToken, registerWithGoogleToken} from '../actions/auth';
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
            user: {
                username: 'amit',
                password: 'am053450',
                password2: 'am053450',
                email: 'amit.rotbard@gmail.com',
                firstName: 'Amit',
                lastName: 'Rotbard'
            }
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
        return (

            <div>
                <div class="at-title">
                    <h3>Create An Account</h3>
                </div>
                <div>
                    <FacebookLogin
                        textButton={"Register with Facebook"}
                        appId="476316572540105"
                        autoLoad={false}
                        fields="name,email,picture,app_name"
                        callback={this.facebookResponse} />
                </div>
                <div>
                    <GoogleLogin
                        clientId="1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com"
                        onSuccess={this.googleResponse}
                        buttonText={"Register with Google"}
                    />
                </div>
                <div class="at-sep">
                    <strong>OR</strong>
                </div>
                <div>
                    <RegistrationForm
                        onSubmit={this.processForm}
                        onChange={this.changeUser}
                        errors={this.state.errors}
                        successMessage={this.state.successMessage}
                        user={this.state.user}
                    />
                </div>
            </div>
        );
    }

}

RegistrationPage.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(({auth}) => ({auth}))(RegistrationPage)