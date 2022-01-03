import React, {
  useState
} from 'react';
import {
  Meteor
} from 'meteor/meteor';
import {
  Accounts
} from 'meteor/accounts-base';

import {
  useDispatch,
} from 'react-redux';

import AddUser from '/imports/ui/users/userForm';
import Loader from "/imports/ui/other/loadingScreen";

import {
  setSidebarOpen,
} from '/imports/redux/metadataSlice';

export default function SignInForm( props ) {

  const dispatch = useDispatch();

  const {
    history,
    openLogIn,
    setLoggingOut
  } = props;
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ showLoading, setShowLoading ] = useState( false );

  const onSubmit = ( name, surname, avatar, colour, language, email, password ) => {
    setShowLoading( true );
    setErrorMessage( "" );
    createUser( name, surname, avatar, colour, language, email, password );
    history.push( "/all/list" );
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
    }, ( error ) => {
      console.log( error );
      setShowLoading( false );
      if ( error ) {
        if ( error.reason === "Incorrect password." || error.reason === "User not found." ) {
          setErrorMessage( "Incorrect login details." );
        } else {
          setErrorMessage( error.reason );
        }
      } else {
        setLoggingOut(false);
        dispatch( setSidebarOpen( true ) );
      }
    } );
  };

  return (
    <div>
      {
        showLoading &&
        <Loader />
      }
      <AddUser onSubmit={onSubmit} isSignIn openLogIn={openLogIn} errorMessage={errorMessage}/>
    </div>
  );
};
