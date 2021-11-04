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
  FiltersCollection
} from '/imports/api/filtersCollection';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

import {
  setNotifications
} from '/imports/redux/notificationsSlice';

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
  setFilters
} from '/imports/redux/filtersSlice';

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

  const { folders, tasks, users, repeats, isLoading } = useTracker(() => {
    const noDataAvailable = { folders: [], tasks: [], users: [], repeats: [] };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const foldersHandler = Meteor.subscribe('folders');
    const tasksHandler = Meteor.subscribe('tasks');
    const usersHandler = Meteor.subscribe('users');
    const repeatsHandler = Meteor.subscribe('repeats');

    if (!foldersHandler.ready() || !tasksHandler.ready() || !tasksHandler.ready() || !repeatsHandler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const folders = FoldersCollection.find(
      {}, {
        sort: { name: 1 },
      }
    ).fetch();
    const foldersIds = folders.map( folder => folder._id );

    const users = Meteor.users.find( {} ).fetch();
    const repeats = RepeatsCollection.find({}).fetch();
    let tasks = TasksCollection.find(
      {
        folder: {
          $in: foldersIds
        }
      }
    ).fetch();

      tasks = tasks.map( task => {
        let newTask = {
          ...task,
          folder: folders.find( folder => folder._id === task.folder ),
          repeat: repeats.find(repeat => repeat._id === task.repeat),
          container: task.container ? task.container : 0,
          assigned: []
        }
        if ( (Array.isArray(task.assigned) && task.assigned.length > 0) || task.assigned ) {
          const newAssigned = Array.isArray(task.assigned) ? users.filter( user => task.assigned.includes(user._id) ) : [users.find( user => user._id === task.assigned )];
          return {
            ...newTask,
            assigned: newAssigned.length > 0 && newAssigned[0] ? newAssigned.map(user => ({
              _id: user._id,
              ...user.profile,
              email: user.emails[0].address,
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
        return newTask;
      } );

    return { folders, tasks, users, repeats };
  });


    const { notifications, filters } = useTracker(() => {
      const noDataAvailable = { notifications: [], filters: []};
      if (!Meteor.user()) {
        return noDataAvailable;
      }

      const notificationsHandler = Meteor.subscribe('notifications');
      const filtersHandler = Meteor.subscribe('filters');

      if (!notificationsHandler.ready() || !filtersHandler.ready()) {
        return { ...noDataAvailable };
      }

      const notifications = NotificationsCollection.find(
        {}, {
          sort: { dateCreated: 1 },
        }
      ).fetch();
      const filters = FiltersCollection.find(
        {}, {
          sort: { name: 1 },
        }
      ).fetch();

      return { notifications, filters };
    });

        const { comments, subtasks } = useTracker(() => {
          const noDataAvailable = { comments: [], subtasks: []};
          if (!Meteor.user()) {
            return noDataAvailable;
          }

          const commentsHandler = Meteor.subscribe('comments');
          const subtasksHandler = Meteor.subscribe('subtasks');

          if (!commentsHandler.ready() || !subtasksHandler.ready() || tasks.length === 0) {
            return { ...noDataAvailable };
          }

          const tasksIds = tasks.map( task => task._id );
          const comments = CommentsCollection.find( {
            task: {
              $in: tasksIds
            }
          }, {
          sort: {
            dateCreated: -1
          }
        } ).fetch();
          const subtasks = SubtasksCollection.find( {
            task: {
              $in: tasksIds
            }
          } ).fetch();

          return { comments, subtasks };
        });

      useEffect( () => {
        dispatch( setFilters( filters ) );
      }, [ filters ] );

    useEffect( () => {
    if (notifications.length === 0){
      dispatch( setNotifications( [] ) );
    } else {
      dispatch( setNotifications( notifications ) );
    }
    }, [notifications]);

  useEffect( () => {
    const newMyFolders = folders.map( folder => ( {
      ...folder,
      label: folder.name,
      value: folder._id
    } ) );
    const activeFolders = newMyFolders.filter( folder => !folder.archived );
    const archivedFolders = newMyFolders.filter( folder => folder.archived );
    dispatch( setActive( activeFolders ) );
    dispatch( setArchived( archivedFolders ) );
  }, [ folders ] );

  useEffect( () => {
    dispatch(
      setUsers(
        users.map( user => ( {
          _id: user._id,
          ...user.profile,
          email: user.emails[0].address,
          label: `${user.profile.name} ${user.profile.surname}`,
          value: user._id,
          img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
        } ) )
      )
    );
  }, [ users ] );

  useEffect( () => {
      dispatch( setTasks( tasks ) );
    }, [ tasks ] );

  useEffect( () => {
      dispatch( setSubtasks( subtasks ) );
  }, [ subtasks ] );

  useEffect( () => {
      dispatch( setComments( comments ) );
  }, [ comments ] );


  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={["/", "/login", "/settings", "/calendar", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID", "/filters/:filterID/list"]}
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
                path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
                component={TaskContainer}
                />
            }

            {
              layout === COLUMNS &&
              <Route
                exact
                path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
                component={TaskContainer}
                />
            }

            {
                layout === DND &&
                <Route
                  exact
                  path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
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
                  path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
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
