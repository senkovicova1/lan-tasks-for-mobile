import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';

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
    history
  } = props;

  const folders = useTracker( () => FoldersCollection.find( {archived: true} ).fetch() );
  const userId = Meteor.userId();

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);

    const myFolders = useMemo(() => {
      let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
      newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
      return newMyFolders;
    }, [userId, folders]);

  const mySearchedFolders = useMemo(() => {
    return myFolders.filter(folder => folder.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, myFolders])

  return (
    <List>

      <SearchSection>
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Icon iconName="Zoom"/>
      </SearchSection>

      {mySearchedFolders.map(folder =>
        <ItemContainer key={folder._id} style={folder.colour ? {backgroundColor: folder.colour} : {}}>
          <span
            style={{paddingLeft: "0px"}}
            onClick={() => history.push(`/folders/archived/${folder._id}`)}
            >
            {folder.name}
          </span>
        </ItemContainer>
      )}
    </List>
  );
};
