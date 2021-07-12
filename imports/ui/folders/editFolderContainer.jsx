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
    match,
    history
  } = props;

  const { folderID } = match.params;

  const folder = useTracker( () => FoldersCollection.find( {
      _id: folderID
    } ).fetch() );

  const userId = Meteor.userId();


    useEffect( () => {
        const userIsAdmin = folder[0].users.find(user => user._id === userId).admin;

        if ( !userIsAdmin ) {
          history.push(`/${folderID}/list`);
        }

    }, [ folderID, userId, folder ] );


  const editFolder = ( name, colour, archived, users ) => {
    let data = {
      name, colour, archived, users
    };
    FoldersCollection.update( folderID, {
      $set: {
        ...data
      }
    } );
    cancel();
  };

  const removeFolder = ( folderId ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this folder?" ) ) {
      FoldersCollection.remove( {
        _id: folderId
      } );
      props.history.push(`/all/list`);
    }
  }

  const cancel = () => {
  props.history.push(`/${folderID}/list`);
  }

  return (
      <FolderForm {...folder[0]} onSubmit={editFolder} onCancel={cancel} onRemove={removeFolder}/>
  );
};
