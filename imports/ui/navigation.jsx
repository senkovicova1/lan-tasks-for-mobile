import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import {
  Route,
  BrowserRouter
} from 'react-router-dom';
import {
  useTracker
} from 'meteor/react-meteor-data';

import Header from './header';
import Login from './login';
import Sidebar from './sidebar';
import TaskList from './tasks/taskList';
import UserList from './users/userList';

import {
  Content
} from '../other/styles/styledComponents';

export default function MainPage( props ) {
  const user = useTracker( () => Meteor.user() );

  return (
    <div>
      <BrowserRouter>
        <Route path={"/"} component={Header} />
        {!user &&
          <Content>
            <Route path={"/"} component={Login} />
          </Content>
        }
        {user &&
          <Content>
            <Route exact path={["/", "/tasks", "/tasks/:tagID", "/tasks/:tagID/:listType", "/users", "/users/:userID"]} component={Sidebar} />
            <Route exact path={["/", "/tasks", "/tasks/:tagID", "/tasks/:tagID/:listType"]} component={TaskList} />
            <Route exact path={["/users", "/users/:userID"]} component={UserList} />
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
