import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App';

import store from '../imports/redux/store';
import { Provider } from 'react-redux';

export const getSVG = async (path) => {
    return await new Promise((resolve, reject) => {
      Meteor.call('svg.get', { path }, (err, res) => {
        if (err) reject('Something went wrong')
        resolve(res)
      })
    })
  }


Meteor.startup(() => {
  render(
    <Provider store={store}>
      <App/>
    </Provider>
    , document.getElementById('react-target'));
});
