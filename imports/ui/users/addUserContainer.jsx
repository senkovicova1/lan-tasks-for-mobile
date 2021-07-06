import React, {
  useState
} from 'react';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import UserForm from './userForm';

import {
  Accounts
} from 'meteor/accounts-base';
import {
  LinkButton
} from '../../other/styles/styledComponents';

export default function AddUserContainer( props ) {

  const [ addUserModalOpen, showAddUserModal ] = useState( false );

  const toggleAddUserModal = () => showAddUserModal( !addUserModalOpen );

  const addNewUser = ( name, surname, showMyTasks, email, password ) => {
    Accounts.createUser( {
      password,
      email,
      profile: {
        name,
        surname,
        showMyTasks
      }
    } );
    showAddUserModal( false );
  };

  const closeModal = () => {
    showAddUserModal( false );
  }

  return (
    <div>
      <LinkButton onClick={toggleAddUserModal}> <Icon iconName="Add"/> User </LinkButton>
      <Modal isOpen={addUserModalOpen} toggle={toggleAddUserModal}>
        <ModalBody>
          <UserForm onSubmit={addNewUser} onCancel={closeModal}/>
        </ModalBody>
      </Modal>
    </div>
  );
};
