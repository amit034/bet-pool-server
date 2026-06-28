import React from 'react';
import PropTypes from 'prop-types';
import {Button, Form} from 'semantic-ui-react';

const RegistrationForm = ({
    onSubmit,
    onChange,
    errors,
    successMessage,
    user,
    goToLogin,
    loading,
}) => (
    <div className="auth-form">
        <Form size="large" action="/" onSubmit={onSubmit}>
            {successMessage ? (
                <p className="auth-form__message auth-form__message--success">{successMessage}</p>
            ) : errors.summary ? (
                <p className="auth-form__message auth-form__message--error">{errors.summary}</p>
            ) : (
                <p className="auth-form__message auth-form__message--placeholder" aria-hidden="true">
                    &nbsp;
                </p>
            )}
            <Form.Input
                fluid
                icon="mail"
                iconPosition="left"
                name="email"
                className="auth-form__input"
                placeholder="Email"
                onChange={onChange}
                value={user.email || ''}
                disabled={loading}
            />
            <Form.Input
                fluid
                icon="lock"
                name="password"
                iconPosition="left"
                placeholder="Password"
                className="auth-form__input"
                type="password"
                onChange={onChange}
                value={user.password || ''}
                disabled={loading}
            />
            <Form.Input
                fluid
                icon="lock"
                name="password2"
                iconPosition="left"
                className="auth-form__input"
                placeholder="Confirm password"
                type="password"
                onChange={onChange}
                value={user.password2 || ''}
                disabled={loading}
            />
            <div className="auth-form__name-row">
                <Form.Input
                    fluid
                    icon="user"
                    iconPosition="left"
                    name="firstName"
                    className="auth-form__input"
                    placeholder="First name"
                    onChange={onChange}
                    value={user.firstName || ''}
                    disabled={loading}
                />
                <Form.Input
                    fluid
                    icon="user"
                    iconPosition="left"
                    className="auth-form__input"
                    name="lastName"
                    placeholder="Last name"
                    onChange={onChange}
                    value={user.lastName || ''}
                    disabled={loading}
                />
            </div>
            <Button
                fluid
                size="large"
                type="submit"
                className="auth-form__submit"
                loading={loading}
                disabled={loading}
            >
                Create account
            </Button>
            <div className="auth-form__footer">
                <span className="auth-form__footer-text">Already have an account?</span>
                <button
                    type="button"
                    className="auth-form__link"
                    onClick={goToLogin}
                    disabled={loading}
                >
                    Sign in
                </button>
            </div>
        </Form>
    </div>
);

RegistrationForm.propTypes = {
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    successMessage: PropTypes.string,
    user: PropTypes.object,
    goToLogin: PropTypes.func,
    loading: PropTypes.bool,
};

export default RegistrationForm;
