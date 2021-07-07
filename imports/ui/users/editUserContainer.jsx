import React, {
  useState,
  useEffect
} from 'react';


import {
  Modal,
  ModalBody
} from 'reactstrap';

import UserForm from './userForm';

export default function EditUserContainer( props ) {

  const {
    user,
  } = props;


  const editUser = ( name, surname, avatar, colour, language ) => {
    let data = {};
    if ( user.profile.name !== name ) {
      data.name = name;
    }
    if ( user.profile.surname !== surname ) {
      data.surname = surname;
    }
    data.avatar = avatar;
    if ( user.colour !== colour ) {
      data.colour = colour;
    }
    if ( user.profile.language !== language ) {
      data.language = language;
    }

    Meteor.users.update(user._id, {
      $set: {
        profile: data
      }
    });
  };

  const removeUser = ( userId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this user?" ) ) {
      Meteor.users.remove( {
        _id: userId
      } );
    }
  }


  return (
        <UserForm {...user} onSubmit={editUser} onCancel={() => props.history.push("/tasks")}/>
  );
};
