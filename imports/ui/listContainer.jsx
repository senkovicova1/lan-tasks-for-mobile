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
    return newMyFolders;
  }, [userId, folders]);

  const myActiveFolders = useMemo(() => {
    return myFolders.filter(folder => !folder.archived);
  }, [myFolders]);

  useEffect(() => {
    if (!match.params.folderID || match.params.folderID === "all"){
      setSelectedFolder({label: translations[language].allFolders, value: "all"});
      setBackground("#f6f6f6");
    } else if (location.pathname == "/folders/archived"){
      setSelectedFolder({label: translations[language].archivedFolders, value: "archived"});
      setBackground("#f6f6f6");
    } else {
      const newFolder = myFolders.find(folder => folder._id === match.params.folderID);
      setBackground(newFolder.colour);
      setSelectedFolder(newFolder);
  }
}, [match.params.folderID, location.pathname, language]);

  return (
    <List>

      <div>
      <Select
        styles={invisibleSelectStyle}
        value={selectedFolder}
        onChange={(e) => {
          setSelectedFolder(e);
          setBackground(e.colour ? e.colour : "#f6f6f6");
          if (e.value === "archived"){
          props.history.push(`/folders/archived`);
        } else {
          props.history.push(`/${e.value}/list`);
        }
        }}
        options={[{label: translations[language].allFolders, value: "all"}, ...myActiveFolders, {label: translations[language].archivedFolders, value: "archived"}]}
        />

</div>
<hr />

    </List>
  );
};
