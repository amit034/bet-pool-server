import React from 'react';
import {Route, Redirect } from "react-router-dom";
export default class ProtectedRoute extends React.Component {
    render() {
        const { component: Component, isAuthenticated,socket, ...rest} = this.props;
        return (
            <Route {...rest} render={(props) => {
                const compProp = {...props};
                if (socket) {
                    compProp.socket = socket;
                }
                return isAuthenticated ? <Component {...compProp} /> : <Redirect to="/" />
            }} />
        )
    }
}
