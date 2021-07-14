import React, {
  useState,
  useEffect,
  useMemo
} from 'react';

import { useSelector } from 'react-redux';
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

  const folderID = match.params.folderID;
  const folders = useSelector((state) => state.folders.value);
  const folder = useMemo(() => {
    return  folders.find(folder => folder._id === folderID);
  }, [folders]);
console.log(folders);
console.log(folder);
  const userId = Meteor.userId();

    useEffect( () => {
        const userIsAdmin = folder.users.find(user => user._id === userId).admin;

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
      <FolderForm {...folder} onSubmit={editFolder} onCancel={cancel} onRemove={removeFolder}/>
  );
};
