import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from '/imports/ui/navigation';

import {
  MainPage
} from '/imports/other/styles/styledComponents';

export const App = () => (
  <MainPage>
    <Navigation />
  </MainPage>
);
