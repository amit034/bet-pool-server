import React from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


const RegistrationForm = ({
  onSubmit,
  onChange,
  errors,
  successMessage,
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
                <Form.Input
                  fluid
                  icon='lock'
                  name='password2'
                  iconPosition='left'
                  placeholder='Password (again)'
                  type='password'
                  onChange={onChange}
                  value={user.password2}
                />
                <Form.Input fluid icon='user'
                           iconPosition='left'
                          name="firstName"
                           placeholder='First Name'
                           onChange={onChange}
                           value={user.firstName}
               />
                <Form.Input fluid icon='user'
                           iconPosition='left'
                          name="lastName"
                           placeholder='Last Name'
                           onChange={onChange}
                           value={user.lastName}
               />
                <Button color='teal' fluid size='large'>
                    Register Now
                </Button>
            </Form>
      </div>
);

RegistrationForm.propTypes = {
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  errors: PropTypes.object,
  successMessage: PropTypes,
  user: PropTypes.object
};

export default RegistrationForm;