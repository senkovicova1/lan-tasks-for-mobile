import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  FolderIcon
} from "/imports/other/styles/icons";

import {
  List,
  SearchSection,
  Input,
  LinkButton,
  ItemContainer
} from "../../other/styles/styledComponents";

import {
  translations
} from '/imports/other/translations';

export default function FolderList( props ) {

  const {
    match,
    history,
  } = props;

    const userId = Meteor.userId();
    const dbUsers = useSelector( ( state ) => state.users.value );
      const language = useMemo( () => {
        if (dbUsers.length > 0){
        return dbUsers.find( user => user._id === userId ).language;
      }
      return "en";
      }, [ userId, dbUsers ] );

  const {
    search
  } = useSelector( ( state ) => state.metadata.value );
  const folders = useSelector( ( state ) => state.folders.value );

  const [ showClosed, setShowClosed ] = useState( false );

  const mySearchedFolders = useMemo( () => {
    return folders.archived.filter( folder => folder.name.toLowerCase().includes( search.toLowerCase() ) );
  }, [ search, folders ] );

  return (
    <List>
      {
        mySearchedFolders.length === 0 &&
        <span className="message">{translations[language].noArchivedFolders}</span>
      }
      {
        mySearchedFolders.map(folder =>
          <ItemContainer key={folder._id}>
            <img
              className="icon"
              src={FolderIcon}
              alt=""
              />
            <span
              onClick={() => history.push(`/folders/archived/${folder._id}`)}
              >
              {folder.name}
            </span>
            <span className="colour" style={folder.colour ? {backgroundColor: folder.colour} : {}}></span>
          </ItemContainer>
        )
      }
    </List>
  );
};
