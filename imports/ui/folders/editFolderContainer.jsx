import React, {
  useState,
  useEffect,
  useMemo
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from './folderForm';

import {
  translations
} from '/imports/other/translations';

export default function EditFolderContainer( props ) {

  const {
    match,
    history
  } = props;

  const folderID = match.params.folderID;
  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    return [ ...folders.active, ...folders.active ].find( folder => folder._id === folderID );
  }, [ folders, folderID ] );

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
    const language = useMemo( () => {
      if (dbUsers.length > 0){
      return dbUsers.find( user => user._id === userId ).language;
    }
    return "en";
    }, [ userId, dbUsers ] );

  useEffect( () => {
    if ( folder ) {
      const userIsAdmin = folder.users.find( user => user._id === userId ).admin;
      if ( !userIsAdmin ) {
        history.push( `/${folderID}/list` );
      }
    }
  }, [ folderID, userId, folder ] );


  const editFolder = ( name, colour, archived, users ) => {
    Meteor.call(
      'folders.editFolder',
      name,
      colour,
      archived,
      users
    );
    cancel();
  };

  const removeFolder = ( folderId ) => {
    if ( window.confirm( translations[language].confirmRemoveFolder ) ) {
      Meteor.call(
        'folders.removeFolder',
        folderId
      )
      props.history.push( `/all/list` );
    }
  }

  const cancel = () => {
    props.history.push( `/${folderID}/list` );
  }

  return (
      <FolderForm {...folder} onSubmit={editFolder} onCancel={cancel} onRemove={removeFolder}/>
  );
};
