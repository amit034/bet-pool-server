import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require('../stylesheets/styles.scss');
import { BrowserRouter } from 'react-router-dom';
import App from "./components/App";
import rootReducer from './reducers';
import thunk from 'redux-thunk';
const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

render(<MuiThemeProvider muiTheme={getMuiTheme()}>
    <BrowserRouter>
        <Provider store={store}><App />
        </Provider>
    </BrowserRouter>
    </MuiThemeProvider>, document.getElementById('app'));
