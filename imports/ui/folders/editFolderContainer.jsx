import React, {
  useState,
  useEffect
} from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import FolderForm from './folderForm';

export default function EditFolderContainer( props ) {

  const {
    folderID,
    closeEdit
  } = props;

  const folder = useTracker( () => FoldersCollection.find( {
      _id: folderID
    } ).fetch() );

  const userId = Meteor.userId();

  const editFolder = ( name, colour, archived, users ) => {
    console.log(archived);
    let data = {
      name, colour, archived
    };
    FoldersCollection.update( folderID, {
      $set: {
        ...data
      }
    } )
  };

  const removeFolder = ( folderId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this folder?" ) ) {
      FoldersCollection.remove( {
        _id: folderId
      } );
    }
  }

  return (
      <FolderForm {...folder[0]} onSubmit={editFolder} onCancel={closeEdit} onRemove={removeFolder}/>
  );
};
