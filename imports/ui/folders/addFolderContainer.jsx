import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from './folderForm';

export default function AddFolderContainer( props ) {

  const addNewFolder = (  name, colour, archived, users ) => {
    FoldersCollection.insert( {
       name, colour, archived, users,
    } );
    cancel( );
  }

  const cancel = () => {
    props.history.push("/all/list");
  }

  return (
        <FolderForm onSubmit={addNewFolder} onCancel={cancel}/>
  );
};
