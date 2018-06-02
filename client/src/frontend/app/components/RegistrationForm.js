import React from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router';
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
  <Card className="container">
    <form action="/" onSubmit={onSubmit}>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errors.summary && <p className="error-message">{errors.summary}</p>}

      <div className="field-line">
        <TextField
          floatingLabelText="Email"
          name="username"
          errorText={errors.email}
          onChange={onChange}
          value={user.username}
        />
      </div>

      <div className="field-line">
        <TextField
          floatingLabelText="Password"
          type="password"
          name="password"
          onChange={onChange}
          errorText={errors.password}
          value={user.password}
        />
      </div>
      <div className="field-line">
        <TextField
          floatingLabelText="Password (again"
          type="password"
          name="password2"
          onChange={onChange}
          errorText={errors.password2}
          value={user.password2}
        />
      </div>
        <div className="field-line">
         <TextField
           floatingLabelText="First Name"
           name="firstName"
           errorText={errors.email}
           onChange={onChange}
           value={user.firstName}
         />
       </div>
        <div className="field-line">
         <TextField
           floatingLabelText="Last Name"
           name="lastName"
           errorText={errors.email}
           onChange={onChange}
           value={user.lastName}
         />
       </div>
      <div className="button-line">
        <RaisedButton type="submit" label="Register Now" primary />
      </div>
    </form>
  </Card>
);

RegistrationForm.propTypes = {
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  errors: PropTypes.object,
  successMessage: PropTypes,
  user: PropTypes.object
};

export default RegistrationForm;