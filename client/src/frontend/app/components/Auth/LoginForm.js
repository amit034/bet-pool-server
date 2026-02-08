import React from 'react';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';

const LoginForm = ({
  onSubmit,
  onChange,
  errors,
  successMessage,
  goToRegister,
  user
}) => {
    return (<div className='login-form'>
        {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */}
        <Form size='large' action="/" onSubmit={onSubmit}>
            <p className="error-message">{errors.summary}</p>
            <Form.Input fluid icon='user'
                        iconPosition='left'
                        name='email'
                        placeholder='Email'
                        className={'login-input'}
                        onChange={onChange}
                        value={user.email}
            />
            <Form.Input
                fluid
                icon='lock'
                name='password'
                iconPosition='left'
                placeholder='Password'
                type='password'
                className={'login-input'}
                onChange={onChange}
                value={user.password}
            />

            <Button fluid size='large' className={'login-button'}>
                LOGIN
            </Button>
            <Grid className={'login-help'}>
                <Grid.Row>
                    <Grid.Column floated='left' width={6}>
                        Forget password?
                    </Grid.Column>
                    <Grid.Column floated='right' width={7}>
                        New user? <a onClick={goToRegister} className={'sign-up-button'}>SIGN UP</a>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

        </Form>
        {/*<Message attached='bottom'>*/}
        {/*  New to us? <a onClick={goToRegister}>Sign Up</a>*/}
        {/*</Message>*/}
    </div>);
};

export default LoginForm