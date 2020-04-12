import React from 'react';
import {Route, Redirect } from "react-router-dom";
export default class ProtectedRoute extends React.Component {
    render() {
        const { component: Component, isAuthenticated, ...rest } = this.props;
        return (
            <Route {...rest} render={(props) => {
                return isAuthenticated ? <Component {...props} /> : <Redirect to="/" />
            }} />
        )
    }
}
