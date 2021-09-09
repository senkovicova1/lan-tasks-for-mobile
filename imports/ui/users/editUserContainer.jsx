import React from 'react';

import UserForm from './userForm';

export default function EditUserContainer( props ) {

  const {
    history,
    user,
  } = props;


  const editUser = ( name, surname, avatar, colour, language ) => {
    let data = {name, surname, avatar, colour, language};

    Meteor.users.update(user._id, {
      $set: {
        profile: data
      }
    });
    history.push("/all/list");
  };

  const removeUser = ( userId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this user?" ) ) {
      Meteor.users.remove( {
        _id: userId
      } );
    }
  }
/*
    const changeEmail = (email) => {
        const newEmail = [{address: email, verified: false}];
        Meteor.users.update({_id: user._id}, {$set: {emails: newEmail }});
    }*/

  return (
        <UserForm {...user} onSubmit={editUser} onCancel={() => props.history.push("/all/list")} />
  );
};
