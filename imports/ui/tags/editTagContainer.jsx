import React, {
  useState,
  useEffect
} from 'react';

import {
  TagsCollection
} from '/imports/api/tagsCollection';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TagForm from './tagForm';

export default function EditTagContainer( props ) {

  const {
    tag,
    setChosenTag,
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ editTagModalOpen, showEditTagModal ] = useState( false );

  useEffect( () => {
      showEditTagModal( tag ? true : false );
  }, [ tag ] )

  const editTag = ( title, description, color ) => {
    let data = {};
    if ( tag.title !== title ) {
      data.title = title;
    }
    if ( tag.description !== description ) {
      data.description = description;
    }
    if ( tag.color !== color ) {
      data.color = color;
    }
    TagsCollection.update( tag._id, {
      $set: {
        ...data
      }
    } )
    setChosenTag( null );
  };

  const removeTag = ( tagId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this tag?" ) ) {
      TagsCollection.remove( {
        _id: tagId
      } );
    }
  }

  const closeModal = () => {
    setChosenTag( null );
  }

  return (
    <Modal isOpen={editTagModalOpen} toggle={() => setChosenTag( null )}>
      <ModalBody>
        <TagForm {...tag} onSubmit={editTag} onCancel={closeModal} onRemove={removeTag}/>
      </ModalBody>
    </Modal>
  );
};
