import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from './navigation';

import {
  MainPage
} from '../other/styles/styledComponents';

import {
  initializeIcons
} from '@fluentui/font-icons-mdl2';
initializeIcons();

export const App = () => (
  <MainPage>
    <Navigation />
  </MainPage>
);