import React, {
  useState
} from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import FolderForm from './folderForm';

import {
  LinkButton
} from '../../other/styles/styledComponents';

export default function AddFolderContainer( props ) {

  const [ addFolderModalOpen, showAddFolderModal ] = useState( false );

  const toggleAddFolderModal = () => showAddFolderModal( !addFolderModalOpen );

  const addNewFolder = (  name, colour, archived, users ) => {
    FoldersCollection.insert( {
       name, colour, archived, users,
    } );
    showAddFolderModal( false );
  }

  const closeModal = () => {
    showAddFolderModal( false );
  }

  return (
    <div>
      <LinkButton onClick={toggleAddFolderModal}> <Icon iconName="Add"/> Folder </LinkButton>
      <Modal isOpen={addFolderModalOpen} toggle={toggleAddFolderModal}>
        <ModalBody>
          <FolderForm onSubmit={addNewFolder} onCancel={closeModal}/>
        </ModalBody>
      </Modal>
    </div>
  );
};
