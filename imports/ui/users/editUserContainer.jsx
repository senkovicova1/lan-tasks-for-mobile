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
    setChosenUser,
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ editUserModalOpen, showEditUserModal ] = useState( false );

  useEffect( () => {
    if ( user ) {
      showEditUserModal( true )
    } else {
      showEditUserModal( false )
    }
  }, [ user ] )

  const editUser = ( name, surname, showMyTasks ) => {
    let data = {};
    if ( user.name !== name ) {
      data.name = name;
    }
    if ( user.surname !== surname ) {
      data.surname = surname;
    }
    if ( user.showMyTasks !== showMyTasks ) {
      data.showMyTasks = showMyTasks;
    }

    Meteor.users.update(user._id, {
      $set: {
        profile: data
      }
    });

    setChosenUser( null );
  };

  const removeUser = ( userId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this user?" ) ) {
      Meteor.users.remove( {
        _id: userId
      } );
    }
  }

  const closeModal = () => {
    setChosenUser( null );
  }

  return (
    <Modal isOpen={editUserModalOpen} toggle={() => setChosenUser( null )}>
      <ModalBody>
        <UserForm {...user} onSubmit={editUser} onCancel={closeModal}/>
      </ModalBody>
    </Modal>
  );
};
