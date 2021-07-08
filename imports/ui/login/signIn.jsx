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

  const onSubmit = ( name, surname, avatar, colour, language, email, password ) => {
    createUser( name, surname, avatar, colour, language, email, password );
    history.push("/all/list");
  };

  const createUser = ( name, surname, avatar, colour, language, email, password ) => {
    Accounts.createUser( {
      password,
      email,
      profile: {
        name,
        surname,
        avatar,
        colour,
        language
      }
    } );
  };

  return (
    <AddUser onSubmit={onSubmit} isSignIn/>
  );
};
