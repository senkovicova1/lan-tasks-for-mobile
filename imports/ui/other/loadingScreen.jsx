import React from 'react';
import {
  Meteor
} from 'meteor/meteor';
import {
  Spinner
} from 'reactstrap';

import {
  LoadingScreen,
} from "/imports/other/styles/styledComponents";

export default function Loader( props ) {
  return (
    <LoadingScreen whiteBkg={props.whiteBkg}>
      <Spinner color="primary" />
    </LoadingScreen>
  );
};
