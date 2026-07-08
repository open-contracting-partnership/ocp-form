import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, IndexRoute, Route, Router } from 'react-router';
import { applyMiddleware, compose, createStore } from 'redux';
import { syncHistory } from 'redux-simple-router';
import thunkMiddleware from 'redux-thunk';

import reducer from './reducers/reducer';
import App from './views/app';
import Entry from './views/entry';
import Form from './views/form';
import Home from './views/home';
import UhOh from './views/uhoh';

// Sync dispatched route actions to the history
const reduxRouterMiddleware = syncHistory(hashHistory);
const finalCreateStore = compose(
  // Middleware you want to use in development:
  applyMiddleware(reduxRouterMiddleware, thunkMiddleware)
  // Required! Enable Redux DevTools with the monitors you chose.
  // DevTools.instrument()
)(createStore);

const store = finalCreateStore(reducer);

// Required for replaying actions from devtools to work
// reduxRouterMiddleware.listenForReplays(store);

render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/' component={App}>
        <Route path='forms/:form' component={Form} />
        <Route path='forms/:form/:entry' component={Entry} />
        <IndexRoute component={Home} />
      </Route>
      <Route path='*' component={App}>
        <IndexRoute component={UhOh} />
      </Route>
    </Router>
  </Provider>,
  document.querySelector('#site-canvas')
);
