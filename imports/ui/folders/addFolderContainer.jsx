import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from './folderForm';

export default function AddFolderContainer( props ) {

  const addNewFolder = ( name, colour, archived, users ) => {
    Meteor.call(
      'folders.addFolder',
      name,
      colour,
      archived,
      users,
      (err, response) => {
      if (err) {
      } else if (response) {
        props.history.push( `/${response}/list` );
      }
    }
    );
  }

  const cancel = () => {
    props.history.push( "/all/list" );
  }

  return (
    <FolderForm onSubmit={addNewFolder} onCancel={cancel}/>
  );
};
