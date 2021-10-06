import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from './folderForm';

export default function AddFolderContainer( props ) {


  console.log("HI");

  const addNewFolder = ( name, colour, archived, users ) => {
    FoldersCollection.insert( {
      name,
      colour,
      archived,
      users,
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        props.history.push( `/${_id}/list` );
      }
    } );
  }

  const cancel = () => {
    props.history.push( "/all/list" );
  }

  return (
    <FolderForm onSubmit={addNewFolder} onCancel={cancel}/>
  );
};
