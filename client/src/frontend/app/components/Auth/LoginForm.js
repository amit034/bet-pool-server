import React from 'react';
import {Button, Form} from 'semantic-ui-react';

const LoginForm = ({
    onSubmit,
    onChange,
    errors,
    goToRegister,
    user,
    loading,
}) => (
    <div className="auth-form">
        <Form size="large" action="/" onSubmit={onSubmit}>
            {errors.summary ? (
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
                placeholder="Email"
                className="auth-form__input"
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
                type="password"
                className="auth-form__input"
                onChange={onChange}
                value={user.password || ''}
                disabled={loading}
            />
            <Button
                fluid
                size="large"
                type="submit"
                className="auth-form__submit"
                loading={loading}
                disabled={loading}
            >
                Sign in
            </Button>
            <div className="auth-form__footer">
                <span className="auth-form__footer-text">New here?</span>
                <button
                    type="button"
                    className="auth-form__link"
                    onClick={goToRegister}
                    disabled={loading}
                >
                    Create an account
                </button>
            </div>
        </Form>
    </div>
);

export default LoginForm;
