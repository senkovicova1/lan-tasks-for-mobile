import React, {
  useState,
  useEffect
} from 'react';
import {
  Route,
  BrowserRouter
} from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { setFolders } from '/imports/redux/foldersSlice';
import { setTasks } from '/imports/redux/tasksSlice';
import { setSubtasks } from '/imports/redux/subtasksSlice';
import { setComments } from '/imports/redux/commentsSlice';
import { setUsers } from '/imports/redux/usersSlice';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  TasksCollection
} from '/imports/api/tasksCollection';
import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';
import {
  CommentsCollection
} from '/imports/api/commentsCollection';
import {
  useTracker
} from 'meteor/react-meteor-data';

import Header from './header';
import Login from './login';
import TaskList from './tasks/taskList';
import ArchviedTaskList from './tasks/archivedTaskList';
import FolderList from './folders/folderList';
import FolderEdit from './folders/editFolderContainer';
import FolderAdd from './folders/addFolderContainer';
import EditUserContainer from './users/editUserContainer';

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';
import {
  Content
} from '/imports/other/styles/styledComponents';

export default function MainPage( props ) {
  const dispatch = useDispatch();

  console.log("All our amazing icons are from FlatIcon (https://www.flaticon.com/). Thank you to all creators whose icons we could use: PixelPerfect (https://www.flaticon.com/authors/pixel-perfect), Dmitri13 (https://www.flaticon.com/authors/dmitri13), Phatplus (https://www.flaticon.com/authors/phatplus), Freepik (https://www.flaticon.com/authors/freepik)");

  const currentUser = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();

  const folders = useTracker( () => FoldersCollection.find( { users:  { $elemMatch: { _id: userId } } } ).fetch() );
  useEffect(() => {
      const newMyFolders = folders.map(folder => ({...folder, label: folder.name, value: folder._id})).sort((f1, f2) => f1.name > f2.name ? 1 : -1);
      dispatch(setFolders(newMyFolders));
}, [folders]);

const foldersIds = folders.map(folder => folder._id);
const tasks = useTracker( () => TasksCollection.find( { folder: {$in: foldersIds}} ).fetch() );
useEffect(() => {
  if (folders.length > 0){
    let newTasks = tasks.map(task =>  ({
      ...task,
      folder: folders.find( folder => folder._id === task.folder ),
    }));
    dispatch(setTasks(newTasks));
  } else {
    dispatch(setTasks([]));
  }
}, [folders, tasks]);

const tasksIds = tasks.map(task => task._id);
const subtasks = useTracker( () => SubtasksCollection.find( { task: {$in: tasksIds}} ).fetch() );
useEffect(() => {
  if (subtasks.length > 0){
    dispatch(setSubtasks(subtasks));
  } else {
    dispatch(setSubtasks([]));
  }
}, [subtasks]);

const comments = useTracker( () => CommentsCollection.find( { task: {$in: tasksIds}} ).fetch() );
useEffect(() => {
  if (comments.length > 0){
    dispatch(setComments(comments));
  } else {
    dispatch(setComments([]));
  }
}, [comments]);

const users = useTracker( () => Meteor.users.find( {} )
.fetch() );
useEffect(() => {
    dispatch(
      setUsers(
        users.map(user => ({
          _id: user._id,
          ...user.profile,
          label:  `${user.profile.name} ${user.profile.surname}`,
          value: user._id,
          img: user.profile.avatar ? uint8ArrayToImg(user.profile.avatar) : null
        }) )
      )
      );
}, [users]);

  const [ search, setSearch ] = useState( "" );
  const [ openSidebar, setOpenSidebar ] = useState( false );
  const [ sortBy, setSortBy ] = useState("name");
  const [ sortDirection, setSortDirection ] = useState("asc");

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={["/", "/login", "/settings", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID"]}
          render={(props) => (
          <Header
            {...props}
            setSearch={setSearch}
            search={search}
            setParentOpenSidebar={setOpenSidebar}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            />
        )}
        />
        {!currentUser &&
          <Content>
            <Route path={["/", "/login"]} component={Login} />
          </Content>
        }
        {currentUser &&
          <Content withSidebar={openSidebar}>
            <div style={{height: "100%", position: "relative"}}>
              <Route
                exact
                path={["/", "/:folderID/list"]}
                render={(props) => (
                <TaskList
                   {...props}
                   search={search}
                   sortBy={sortBy}
                   sortDirection={sortDirection}
                   />
              )}
              />
              <Route exact path={"/:folderID/edit"} component={FolderEdit} />
              <Route exact path={"/folders/add"} component={FolderAdd} />
              <Route
                exact
                path={"/folders/archived"}
                render={(props) => (
                <FolderList {...props} search={search} />
              )}
              />
                <Route
                  exact
                  path={"/folders/archived/:folderID"}
                  render={(props) => (
                  <ArchviedTaskList
                     {...props}
                     search={search}
                     sortBy={sortBy}
                     sortDirection={sortDirection}
                     />
                )}
                />
              <Route
                exact
                path={"/settings"}
                render={(props) => (
                  <EditUserContainer {...props} user={currentUser} />
                )}/>
              </div>
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
