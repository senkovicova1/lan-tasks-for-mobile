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

import AddFolderContainer from './folders/addFolderContainer';
import EditFolderContainer from './folders/editFolderContainer';
/*
import {
  TasksCollection
} from '/imports/api/tasksCollection';
import {
  UsersCollection
} from '/imports/api/usersCollection';*/

// import AddTaskContainer from './addTaskContainer';
// import EditTaskContainer from './editTaskContainer';

import {
  List,
  SearchSection,
  Input,
  LinkButton
} from "../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);
  const [ openEdit, setOpenEdit ] = useState(false);
  const [ selectedFolder, setSelectedFolder ] = useState({label: "All folders", value: "all"});

  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );
  const userId = Meteor.userId();

  const myFolders = useMemo(() => {
    let newMyFolders = folders.filter(folder => folder.users.find(user => user._id === userId));
    newMyFolders = newMyFolders.map(folder => ({...folder, label: folder.name, value: folder._id}));
    newMyFolders = newMyFolders.sort((f1, f2) => (f1.archived > f2.archived ? 1 : -1));
    return [{label: "All folders", value: "all"}, ...newMyFolders];
  }, [userId, folders]);

  useEffect(() => {
    if (match.params.folderID === "all"){
      setSelectedFolder({label: "All folders", value: "all"});
    } else {
    setSelectedFolder(myFolders.find(folder => folder._id === match.params.folderID));
  }
  }, [match.params.folderID])

/*
  const findFolder = match.params.folderID === 'all' ? null : match.params.folderID;
  const tasks = useTracker( () => TasksCollection.find( findFolder ? {
      folder: findFolder
    } : {} )
    .fetch() );
  const users = useTracker( () => Meteor.users.find( {} )
    .fetch() );

  const joinedTasks = useMemo( () =>
    tasks.map( task => ( {
      ...task,
      folder: folders.find( folder => folder._id === task.folder ),
      assigned: users.filter( user => task.assigned.includes( user._id ) ),
      status: statuses.find(s => s.value === task.status),
    } ) ), [ tasks, folders, users ] );
*/

  return (
    <List>

      <Select
        styles={selectStyle}
        value={selectedFolder}
        onChange={(e) => setSelectedFolder(e)}
        options={myFolders}
        />
      <LinkButton onClick={(e) => {e.preventDefault(); setOpenEdit(true);}}>
      <Icon iconName="Settings"/>
    </LinkButton>

    <AddFolderContainer />

  {
    openEdit &&
    <EditFolderContainer folderID={selectedFolder._id} closeEdit={() => setOpenEdit(false)} /> 
  }

      <SearchSection>
        <Input width="30%" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <section key="allStatuses">
          <Input
            id="allStatuses"
            type="checkbox"
            name="allStatuses"
            style={{
              marginRight: "0.2em"
            }}
            checked={showClosed}
            onChange={() => setShowClosed(!showClosed)}
            />
          <label htmlFor="allStatuses">Show closed</label>
        </section>
      </SearchSection>


    </List>
  );
};
