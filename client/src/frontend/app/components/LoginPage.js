import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {loginUser} from '../actions/auth';
import LoginForm from './LoginForm';

class LoginPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props, context) {
    super(props, context);
    this.apiUrl = 'http://localhost:3000/api/auth/login';
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
        username: 'amit2',
        password: 'am053450'
      }
    };

    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
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
    const username = encodeURIComponent(this.state.user.username);
    const password = encodeURIComponent(this.state.user.password);

    this.props.dispatch(loginUser({username, password}));
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

  /**
   * Render the component.
   */
  render() {
    return (
      <LoginForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        successMessage={this.state.successMessage}
        user={this.state.user}
      />
    );
  }

}

LoginPage.contextTypes = {
  router: PropTypes.object.isRequired
};

export default connect(({auth}) => ({auth}))(LoginPage);