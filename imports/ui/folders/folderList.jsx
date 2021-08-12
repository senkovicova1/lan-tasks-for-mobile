import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import { useSelector } from 'react-redux';

import { FolderIcon } from  "/imports/other/styles/icons";

import {
  List,
  SearchSection,
  Input,
  LinkButton,
  ItemContainer
} from "../../other/styles/styledComponents";

export default function FolderList( props ) {

  const {
    match,
    history,
    search
  } = props;


  const folders = useSelector((state) => state.folders.value);
  const userId = Meteor.userId();

  const [ showClosed, setShowClosed ] = useState(false);

    const myFolders = useMemo(() => {
      let newMyFolders = folders.filter(folder => folder.archived && folder.users.find(user => user._id === userId));
      newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
      return newMyFolders;
    }, [userId, folders]);

  const mySearchedFolders = useMemo(() => {
    return myFolders.filter(folder => folder.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, myFolders])

  return (
    <List>
      {
        mySearchedFolders.length === 0 &&
        <span className="message">You have no archived folders</span>
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
            <span className="colour"  style={folder.colour ? {backgroundColor: folder.colour} : {}}></span>
          </ItemContainer>
        )
      }
    </List>
  );
};
