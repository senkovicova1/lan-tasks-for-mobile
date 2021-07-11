import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import moment from 'moment';

import Select from 'react-select';

import {
  invisibleSelectStyle
} from '../other/styles/selectStyles';

import {
  translations
} from '../other/translations.jsx';

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
    location,
    setBackground
  } = props;

  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );
  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);
  const [ openEdit, setOpenEdit ] = useState(false);
  const [ folderListOpen, setFolderListOpen ] = useState(false);
  const [ selectedFolder, setSelectedFolder ] = useState({label: translations[language].allFolders, value: "all"});

  const myFolders = useMemo(() => {
    let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
    newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
    newMyFolders = newMyFolders.sort((f1, f2) => (f1.archived > f2.archived ? 1 : -1));
    return newMyFolders;
  }, [userId, folders]);


  useEffect(() => {
    if (!match.params.folderID || match.params.folderID === "all"){
      setSelectedFolder({label: translations[language].allFolders, value: "all"});
      setBackground("#f6f6f6");
    } else {
      const newFolder = myFolders.find(folder => folder._id === match.params.folderID);
    setSelectedFolder(newFolder);
    setBackground(newFolder.colour);
  }
}, [match.params.folderID, location.pathname, language])


  return (
    <List>

      <div>
      <Select
        styles={invisibleSelectStyle}
        value={selectedFolder}
        onChange={(e) => {
          setSelectedFolder(e);
          setBackground(e.colour ? e.colour : "#f6f6f6");
          props.history.push(`/${e.value}/list`);
        }}
        options={[{label: translations[language].allFolders, value: "all"}, ...myFolders]}
        />

</div>
<hr />

    </List>
  );
};
