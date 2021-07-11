import React, {
  useState
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
import List from './listContainer';
import TaskList from './tasks/taskList';
import FolderList from './folders/folderList';
import FolderEdit from './folders/editFolderContainer';
import FolderAdd from './folders/addFolderContainer';
import EditUserContainer from './users/editUserContainer';

import {
  Content
} from '../other/styles/styledComponents';

export default function MainPage( props ) {
  const user = useTracker( () => Meteor.user() );

  const [ background, setBackground ] = useState("#f6f6f6");

  return (
    <div style={{backgroundColor: background, height: "100vh"}}>
      <BrowserRouter>
        <Route path={"/"} render={(props) => (
          <Header {...props} setBackground={setBackground} />
        )}/>
        {!user &&
          <Content>
            <Route path={"/"} component={Login} />
          </Content>
        }
        {user &&
          <Content>
              <Route exact path={["/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/settings"]} render={(props) => (
                <List {...props} setBackground={setBackground} />
              )}/>
              <Route exact path={"/:folderID/list"} component={TaskList} />
              <Route exact path={"/:folderID/edit"} component={FolderEdit} />
              <Route exact path={"/folders/add"} component={FolderAdd} />
              <Route exact path={"/folders/settings"} component={FolderList} />
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
