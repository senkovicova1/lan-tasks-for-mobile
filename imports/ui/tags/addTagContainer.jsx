import React, {
  useState
} from 'react';

import {
  TagsCollection
} from '/imports/api/tagsCollection';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import TagForm from './tagForm';

import {
  LinkButton
} from '../../other/styles/styledComponents';

export default function AddTagContainer( props ) {

  const [ addTagModalOpen, showAddTagModal ] = useState( false );

  const toggleAddTagModal = () => showAddTagModal( !addTagModalOpen );

  const addNewTag = ( title ) => {
    TagsCollection.insert( {
      title,
    } );
    showAddTagModal( false );
  }

  const closeModal = () => {
    showAddTagModal( false );
  }

  return (
    <div>
      <LinkButton onClick={toggleAddTagModal}> <Icon iconName="Add"/> Tag </LinkButton>
      <Modal isOpen={addTagModalOpen} toggle={toggleAddTagModal}>
        <ModalBody>
          <TagForm onSubmit={addNewTag} onCancel={closeModal}/>
        </ModalBody>
      </Modal>
    </div>
  );
};
