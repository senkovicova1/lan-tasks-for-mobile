import React, {
  useState
} from 'react';
import {
  Meteor
} from 'meteor/meteor';

import Login from './login';
import SignIn from './signIn';

import {
  GroupButton,
  LoginContainer
} from "/imports/other/styles/styledComponents";

export default function LoginForm( props ) {

  const [ showLogin, setShowLogin ] = useState( true );

  return (
    <LoginContainer>
      {
        showLogin &&
        <div className="signIn">
          <Login {...props} openSignUp={() => setShowLogin(!showLogin)}/>
        </div>
      }
      {
        !showLogin &&
        <SignIn {...props} openLogIn={() => setShowLogin(!showLogin)}/>
      }
    </LoginContainer>
  );
};
