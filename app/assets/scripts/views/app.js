'use strict';
import React from 'react';

const App = React.createClass({
  displayName: 'App',

  propTypes: {
    dispatch: React.PropTypes.func,
    children: React.PropTypes.object
  },

  render: function () {
    return (
      <div>
        <header className='site-header' role='banner'>
          <div className='inner'>
            <div className='site-headline'>
              <h1 className='site-title'>
                <a href='/' title='Visit homepage'>
                  <img src='assets/graphics/layout/ocp-logo-neg.svg' width='482' height='38' alt='Ocp logo' />
                  <span>Open Contracting Partnership</span>
                </a>
              </h1>
            </div>
          </div>
        </header>

        <main className='site-body' role='main'>
          <div className='inner'>
            {this.props.children}
          </div>
        </main>

        <footer className='site-footer' role='contentinfo'>
          <div className='inner'>
            <p><a href='http://open-contracting.org/' title='Visit Open Contracting Partnership website'>OCP</a> &middot; 2016</p>
          </div>
        </footer>
      </div>
    );
  }
});

module.exports = App;
