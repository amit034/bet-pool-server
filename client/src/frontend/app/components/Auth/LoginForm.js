import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

const LoginForm = ({
  onSubmit,
  onChange,
  errors,
  successMessage,
  goToRegister,
  user
}) => (
  <div className='login-form'>
    {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */}
    <style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style>
        <Form size='large' action="/" onSubmit={onSubmit}>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errors.summary && <p className="error-message">{errors.summary}</p>}
            <Form.Input fluid icon='user'
                        iconPosition='left'
                        name='email'
                        placeholder='E-mail address'
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
              onChange={onChange}
              value={user.password}
            />

            <Button color='teal' fluid size='large'>
              Login
            </Button>

        </Form>
        <Message>
          New to us? <a onClick={goToRegister}>Sign Up</a>
        </Message>
  </div>
)

export default LoginForm