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
  LinkButton
} from "../../other/styles/styledComponents";

export default function FolderList( props ) {

  const {
    match,
    history
  } = props;

  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );
  const userId = Meteor.userId();

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);

    const myFolders = useMemo(() => {
      let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
      newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
      newMyFolders = newMyFolders.sort((f1, f2) => (f1.archived > f2.archived ? 1 : -1));
      return newMyFolders;
    }, [userId, folders]);

  const mySearchedFolders = useMemo(() => {
    return myFolders.filter(folder => folder.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, myFolders])

  return (
    <List>

      <SearchSection>
        <Input width="30%" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </SearchSection>

      {mySearchedFolders.map(folder => <div key={folder._id} style={folder.colour ? {backgroundColor: folder.colour} : {}}>{folder.name}</div>)}
      <LinkButton onClick={() => history.push('/folders/add')}> <Icon iconName="Add"/> Folder </LinkButton>
    </List>
  );
};
