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
import List from './list';
import FolderList from './folders/folderList';
import FolderEdit from './folders/editFolderContainer';
import EditUserContainer from './users/editUserContainer';

import {
  Content
} from '../other/styles/styledComponents';

export default function MainPage( props ) {
  const user = useTracker( () => Meteor.user() );
console.log(user);
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
            <Route exact path={["/", "/tasks", "/tasks/:folderID"]} component={List} />
              <Route
                exact
                path={"/settings"}
                render={(props) => (
                  <EditUserContainer {...props} user={user} />
  )}/>
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
