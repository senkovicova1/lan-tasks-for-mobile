import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from '/imports/ui/navigation';

import {
  MainPage
} from '/imports/other/styles/styledComponents';

import "react-datetime/css/react-datetime.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";


export const App = () => (
  <MainPage>
    <Navigation />
  </MainPage>
);
