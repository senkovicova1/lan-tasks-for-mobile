import React, {
  useEffect,
  useState,
} from 'react';

import {
  Route,
  BrowserRouter
} from 'react-router-dom';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  setComments
} from '/imports/redux/commentsSlice';

import {
  setActive,
  setArchived
} from '/imports/redux/foldersSlice';

import {
  setLanguage,
  setUser
} from '/imports/redux/metadataSlice';

import {
  setSubtasks
} from '/imports/redux/subtasksSlice';

import {
  setTasks
} from '/imports/redux/tasksSlice';

import {
  setUsers
} from '/imports/redux/usersSlice';

import Header from './header';
import Login from './login';
import TaskContainer from './tasks/tasksContainer';
import FolderList from './folders/folderList';
import FolderEdit from './folders/editFolderContainer';
import FolderAdd from './folders/addFolderContainer';
import EditUserContainer from './users/editUserContainer';

import {
  UserIcon
} from "/imports/other/styles/icons";

import {
  Content,
  InnerContent
} from '/imports/other/styles/styledComponents';

import {
  PLAIN,
  COLUMNS,
  CALENDAR,
  DND
} from "/imports/other/constants";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function MainPage( props ) {

  const dispatch = useDispatch();

  console.log( "All our amazing icons are from FlatIcon (https://www.flaticon.com/). Thank you to all creators whose icons we could use: PixelPerfect (https://www.flaticon.com/authors/pixel-perfect), Dmitri13 (https://www.flaticon.com/authors/dmitri13), Phatplus (https://www.flaticon.com/authors/phatplus), Freepik (https://www.flaticon.com/authors/freepik)" );

  const currentUser = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();
  const {
    layout,
    sidebarOpen
  } = useSelector( ( state ) => state.metadata.value );

  const folders = useTracker( () => FoldersCollection.find( {
    users: {
      $elemMatch: {
        _id: userId
      }
    }
  } ).fetch() );
  useEffect( () => {
    const newMyFolders = folders.map( folder => ( {
      ...folder,
      label: folder.name,
      value: folder._id
    } ) ).sort( ( f1, f2 ) => f1.name > f2.name ? 1 : -1 );
    const activeFolders = newMyFolders.filter( folder => !folder.archived );
    const archivedFolders = newMyFolders.filter( folder => folder.archived );
    dispatch( setActive( activeFolders ) );
    dispatch( setArchived( archivedFolders ) );
  }, [ folders ] );

  const users = useTracker( () => Meteor.users.find( {} )
    .fetch() );
  useEffect( () => {
    dispatch(
      setUsers(
        users.map( user => ( {
          _id: user._id,
          ...user.profile,
          label: `${user.profile.name} ${user.profile.surname}`,
          value: user._id,
          img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
        } ) )
      )
    );
  }, [ users ] );

  const foldersIds = folders.map( folder => folder._id );
  const tasks = useTracker( () => TasksCollection.find( {
    folder: {
      $in: foldersIds
    }
  } ).fetch() );
  useEffect( () => {
    if ( folders.length > 0 && users.length > 0 ) {
      let newTasks = tasks.map( task => {
        if ( (Array.isArray(task.assigned) && task.assigned.length > 0) || task.assigned ) {
          const newAssigned = Array.isArray(task.assigned) ? users.filter( user => task.assigned.includes(user._id) ) : [users.find( user => user._id === task.assigned )];
          return {
            ...task,
            folder: folders.find( folder => folder._id === task.folder ),
            assigned: newAssigned.length > 0 && newAssigned[0] ? newAssigned.map(user => ({
              _id: user._id,
              ...user.profile,
              label: `${user.profile.name} ${user.profile.surname}`,
              value: user._id,
              img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
            })).sort((a1,a2) => a1.label.toLowerCase() > a2.label.toLowerCase() ? 1 : -1) : [
              {
                _id: "-1",
                label: "No assigned",
                value: "-1",
                img: UserIcon
              }
            ],
          };
        }
        return {
          ...task,
          folder: folders.find( folder => folder._id === task.folder ),
          assigned: [],
        }
      } );
      dispatch( setTasks( newTasks ) );
    } else {
      dispatch( setTasks( [] ) );
    }
  }, [ folders, tasks, users ] );

  const tasksIds = tasks.map( task => task._id );
  const subtasks = useTracker( () => SubtasksCollection.find( {
    task: {
      $in: tasksIds
    }
  } ).fetch() );
  useEffect( () => {
    if ( subtasks.length > 0 ) {
      dispatch( setSubtasks( subtasks ) );
    } else {
      dispatch( setSubtasks( [] ) );
    }
  }, [ subtasks ] );

  const comments = useTracker( () => CommentsCollection.find( {
    task: {
      $in: tasksIds
    }
  } ).fetch() );
  useEffect( () => {
    if ( comments.length > 0 ) {
      dispatch( setComments( comments ) );
    } else {
      dispatch( setComments( [] ) );
    }
  }, [ comments ] );

  console.log(layout);

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={["/", "/login", "/settings", "/calendar", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID"]}
          render={(props) => (
            <Header
              {...props}
              />
          )}
          />
        {
          !currentUser &&
          <Content withSidebar={false}>
            <Route path={["/", "/login"]} component={Login} />
          </Content>
        }
        {
          currentUser &&
            <Content
              withSidebar={sidebarOpen}
              columns={layout === COLUMNS}
              >

            {
              layout === CALENDAR &&
              <Route
                exact
                path={["/", "/:folderID/list", "/folders/archived/:folderID"]}
                component={TaskContainer}
                />
            }

            {
              layout === COLUMNS &&
              <Route
                exact
                path={["/", "/:folderID/list", "/folders/archived/:folderID"]}
                component={TaskContainer}
                />
            }

            {
                layout === DND &&
                <Route
                  exact
                  path={["/", "/:folderID/list", "/folders/archived/:folderID"]}
                  component={TaskContainer}
                  />
              }

            <InnerContent
              withSidebar={sidebarOpen}
              >

              <Route exact path={"/folders/add"} component={FolderAdd} />
              <Route exact path={"/:folderID/edit"} component={FolderEdit} />

              <Route
                exact
                path={"/folders/archived"}
                component={FolderList}
                />

              {
                layout === PLAIN &&
                <Route
                  exact
                  path={["/", "/:folderID/list", "/folders/archived/:folderID"]}
                  component={TaskContainer}
                  />
              }

              <Route
                exact
                path={"/settings"}
                render={(props) => (
                  <EditUserContainer {...props} user={currentUser} />
                )}
                />
          </InnerContent>
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
