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

  console.log( "All our amazing icons are from FlatIcon (https://www.flaticon.com/). Thank you to all creators whose icons we could use: PixelPerfect (https://www.flaticon.com/authors/pixel-perfect), Dmitri13 (https://www.flaticon.com/authors/dmitri13), Phatplus (https://www.flaticon.com/authors/phatplus), Freepik (https://www.flaticon.com/authors/freepik), Muhazdinata (https://www.flaticon.com/authors/muhazdinata)" );

  const [loggingOut, setLoggingOut] = useState(false);

  const currentUser = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();
  const {
    layout,
    sidebarOpen,
    filter
  } = useSelector( ( state ) => state.metadata.value );

  const { tasksHandlerReady } = useTracker(() => {

    if (!Meteor.user()) {
      return { tasksHandlerReady: false };
    }

    const tasksHandler = Meteor.subscribe('tasks');

    if (!tasksHandler.ready()) {
      return { tasksHandlerReady: false };
    }

    return { tasksHandlerReady: true };
  });

  const { folders, foldersLoading } = useTracker(() => {

    let folders = [];
    let foldersLoading = true;

    const noDataAvailable = { folders, foldersLoading };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const foldersHandler = Meteor.subscribe('folders');

    if (!foldersHandler.ready()) {
      return noDataAvailable;
    }

      folders = FoldersCollection.find({}, {
          sort: { name: 1 },
        }
      ).fetch();

    return { folders, foldersLoading: false };
  });

  const { users, usersLoading } = useTracker(() => {

    let users = [];
    let usersLoading = true;

    const noDataAvailable = { users, usersLoading };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const usersHandler = Meteor.subscribe('users');

    if (!usersHandler.ready()) {
      return noDataAvailable;
    }

    users = Meteor.users.find( {} ).fetch();

    return { users, usersLoading: false };
  });

    const { notifications } = useTracker(() => {

      let notifications = [];

      const noDataAvailable = { notifications };
      if (!Meteor.user()) {
        return noDataAvailable;
      }

      const notificationsHandler = Meteor.subscribe('notifications');

      if (!notificationsHandler.ready()) {
        return noDataAvailable;
      }

      notifications = NotificationsCollection.findOne(
        {
          _id: userId
        }, {
          sort: { dateCreated: 1 },
        }
      );

      return { notifications };
    });

    const { filters, filtersLoading } = useTracker(() => {

      let filters = [];
      let filtersLoading = true;

      const noDataAvailable = { filtersLoading, filters };
      if (!Meteor.user()) {
        return noDataAvailable;
      }

      const filtersHandler = Meteor.subscribe('filters');

      if (!filtersHandler.ready()) {
        return noDataAvailable;
      }

      filters = FiltersCollection.find({}, {
          sort: { name: 1 },
        }
      ).fetch();

      return { filtersLoading: false, filters };
    });

  useEffect( () => {
    const newMyFolders = folders.map( folder => ( {
      ...folder,
      label: folder.name,
      value: folder._id
    } ) );
    const activeFolders = newMyFolders.filter( folder => !folder.archived );
    const archivedFolders = newMyFolders.filter( folder => folder.archived );
    dispatch( setActive( newMyFolders ) );
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
        dispatch( setFilters( filters ) );
      }, [ filters ] );

    useEffect( () => {
    if (notifications.length === 0){
      dispatch( setNotifications( [] ) );
    } else {
      dispatch( setNotifications( notifications ) );
    }
    }, [notifications]);

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={["/", "/login", "/settings", "/calendar", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID", "/filters/:filterID/list"]}
          render={(props) => (
            <Header
              {...props}
              foldersLoading={foldersLoading}
              filtersLoading={filtersLoading}
              loggingOut={loggingOut}
              setLoggingOut={setLoggingOut}
              />
          )}
          />
        {
          !currentUser &&
          <Content withSidebar={false}>
            <Route
              path={["/", "/login"]}
              render={(props) => (
                <Login
                  {...props}
                  setLoggingOut={setLoggingOut}
                  />
              )}
              />
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
                render={(props) => (
                  <TaskContainer
                    {...props}
                    tasksHandlerReady={tasksHandlerReady}
                    />
                )}
                />
            }

            {
              layout === COLUMNS &&
              <Route
                exact
                path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
                render={(props) => (
                  <TaskContainer
                    {...props}
                    tasksHandlerReady={tasksHandlerReady}
                    />
                )}
                />
            }

            {
                layout === DND &&
                <Route
                  exact
                  path={["/", "/:folderID/list", "/folders/archived/:folderID", "/filters/:filterID/list"]}
                  render={(props) => (
                    <TaskContainer
                      {...props}
                      tasksHandlerReady={tasksHandlerReady}
                      />
                  )}
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
                  render={(props) => (
                    <TaskContainer
                      {...props}
                      tasksHandlerReady={tasksHandlerReady}
                      />
                  )}
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
