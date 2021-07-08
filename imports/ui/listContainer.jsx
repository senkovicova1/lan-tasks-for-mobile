import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import moment from 'moment';

import Select from 'react-select';

import {
  selectStyle
} from '../other/styles/selectStyles';

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
} from "../other/styles/styledComponents";

export default function ListContainer( props ) {

  const {
    match,
    location
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);
  const [ openEdit, setOpenEdit ] = useState(false);
  const [ folderListOpen, setFolderListOpen ] = useState(false);
  const [ selectedFolder, setSelectedFolder ] = useState({label: "All folders", value: "all"});

  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );
  const userId = Meteor.userId();

  const myFolders = useMemo(() => {
    let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
    newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
    newMyFolders = newMyFolders.sort((f1, f2) => (f1.archived > f2.archived ? 1 : -1));
    return newMyFolders;
  }, [userId, folders]);

  useEffect(() => {
    if (!match.params.folderID || match.params.folderID === "all"){
      setSelectedFolder({label: "All folders", value: "all"});
    } else {
    setSelectedFolder(myFolders.find(folder => folder._id === match.params.folderID));
  }
}, [match.params.folderID, location.pathname])

  return (
    <List>

      <Select
        styles={selectStyle}
        value={selectedFolder}
        onChange={(e) => {
          setSelectedFolder(e);
          props.history.push(`/${e.value}/list`);
        }}
        options={[{label: "All folders", value: "all"}, ...myFolders]}
        />
      {
      (  selectedFolder.value === "all" || selectedFolder.users.find(user => user._id === userId).admin )&& 
      <LinkButton onClick={(e) => {
          e.preventDefault();
          if (selectedFolder.value === "all") {
          props.history.push(`/folders/settings`);
          } else {
          props.history.push(`/${selectedFolder.value}/edit`);
        }
        }}>
      <Icon iconName="Settings"/>
    </LinkButton>
  }

    </List>
  );
};
