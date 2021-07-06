import React, {
  useState
} from 'react';

import {
  Meteor
} from 'meteor/meteor';

import {
  Accounts
} from 'meteor/accounts-base';

import AddUser from '../users/userForm';

export default function SignInForm( props ) {

  const { history } = props;

  const onSubmit = ( name, surname, showMyTasks, email, password ) => {
    createUser( name, surname, showMyTasks, email, password );
    history.push("tasks/all/all");
  };

  const createUser = ( name, surname, showMyTasks, email, password ) => {
    Accounts.createUser( {
      password,
      email,
      profile: {
        name,
        surname,
        showMyTasks
      }
    } );
  };

  return (
    <AddUser onSubmit={onSubmit} isSignIn/>
  );
};
