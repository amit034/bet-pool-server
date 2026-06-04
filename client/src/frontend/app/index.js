import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require('../stylesheets/styles.scss');
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./components/App";
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { initPWA } from './utils/pwa';
import GOOGLE_CLIENT_ID from './config/googleClientId';
initPWA();
const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

render(<MuiThemeProvider muiTheme={getMuiTheme()}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
            <Provider store={store}><App />
            </Provider>
        </BrowserRouter>
    </GoogleOAuthProvider>
    </MuiThemeProvider>, document.getElementById('app'));
