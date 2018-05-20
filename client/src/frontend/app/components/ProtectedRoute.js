import React from 'react';
import {connect} from "react-redux";
export default class ProtectedRoute extends React.Component {
    render() {
        const isAuthenticated = this.props.isAuthenticated;
        const Component = this.props.component;
        const path = this.props.path;
        return (
            isAuthenticated ?
                <Route path={path} render={(props) => {
                    return <Component {...props} />
                }} /> :
                <Redirect to="/" />
        )
    }
}
