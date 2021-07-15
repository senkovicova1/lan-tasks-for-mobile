import React, {
  useState,
  useEffect
} from 'react';
import {
  Route,
  BrowserRouter
} from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { setFolders } from '../redux/foldersSlice';
import { setTasks } from '../redux/tasksSlice';
import { setUsers } from '../redux/usersSlice';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  TasksCollection
} from '/imports/api/tasksCollection';
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
  Content
} from '../other/styles/styledComponents';

export default function MainPage( props ) {
  const dispatch = useDispatch();

  const folders = useTracker( () => FoldersCollection.find( {} ).fetch() );
  const tasks = useTracker( () => TasksCollection.find( {} ).fetch() );
  const users = useTracker( () => Meteor.users.find( {} )
    .fetch() );
  const currentUser = useTracker( () => Meteor.user() );

  useEffect(() => {
    if (currentUser && folders.length > 0){
      const newMyFolders = folders.filter(folder => folder.users.find(user => user._id  === currentUser._id));
    dispatch(setFolders(newMyFolders));
  }
}, [folders, currentUser]);

useEffect(() => {
  if (currentUser && tasks.length > 0 && folders.length > 0){
    let newTasks = tasks.map(task =>  ({
      ...task,
      folder: folders.find( folder => folder._id === task.folder ),
    }));
    newTasks = newTasks.filter(task => task.folder.users.find(user => user._id  === currentUser._id));
    dispatch(setTasks(newTasks));
  }
}, [folders, tasks, currentUser]);

useEffect(() => {
    dispatch(setUsers(users));
}, [users]);


  const [ background, setBackground ] = useState("#f6f6f6");

  const [ search, setSearch ] = useState( "" );

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={["/login", "/settings", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID"]}
          render={(props) => (
          <Header
            {...props}
            setSearch={setSearch}
            search={search}
            setBackground={setBackground}
            />
        )}
        />
        {!currentUser &&
          <Content>
            <Route path={"/login"} component={Login} />
          </Content>
        }
        {currentUser &&
          <Content>
            <div style={{backgroundColor: background, height: "100%", position: "relative"}}>
              <Route
                exact
                path={"/:folderID/list"}
                render={(props) => (
                <TaskList
                   {...props}
                   search={search}
                   setBackground={setBackground}
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
              <Route exact path={"/folders/archived/:folderID"} component={ArchviedTaskList} />
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
