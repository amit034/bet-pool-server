import React from 'react';
import {Route, Redirect} from 'react-router-dom';

/**
 * Stable render callback so Route children are not remounted on every parent render.
 * (Inline render props in the parent cause PoolsContainer / SearchPools to remount and re-fetch.)
 */
export default class ProtectedRoute extends React.Component {
    constructor(props) {
        super(props);
        this.renderRoute = this.renderRoute.bind(this);
    }

    renderRoute(props) {
        const {component: Component, isAuthenticated, socket} = this.props;
        if (!isAuthenticated) {
            return <Redirect to="/"/>;
        }
        const compProp = {...props};
        if (socket) {
            compProp.socket = socket;
        }
        return <Component {...compProp}/>;
    }

    render() {
        const {component, isAuthenticated, socket, ...rest} = this.props;
        return <Route {...rest} render={this.renderRoute}/>;
    }
}
