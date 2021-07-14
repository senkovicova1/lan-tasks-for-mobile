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
  const user = useTracker( () => Meteor.user() );

  const [ background, setBackground ] = useState("#f6f6f6");

  const [ search, setSearch ] = useState( "" );

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route exact path={["/settings", "/:folderID/edit", "/folders/add", "/:folderID/list", "/folders/archived", "/folders/archived/:folderID"]} render={(props) => (
          <Header {...props} setSearch={setSearch} search={search} setBackground={setBackground} />
        )}/>
        {!user &&
          <Content>
            <Route path={"/"} component={Login} />
          </Content>
        }
        {user &&
          <Content>
            <div style={{backgroundColor: background, height: "100%", position: "relative"}}>
              <Route exact path={"/:folderID/list"} render={(props) => (
                <TaskList {...props} search={search} setBackground={setBackground} />
              )}/>
              <Route exact path={"/:folderID/edit"} component={FolderEdit} />
              <Route exact path={"/folders/add"} component={FolderAdd} />
              <Route exact path={"/folders/archived"} component={FolderList} />
              <Route exact path={"/folders/archived/:folderID"} component={ArchviedTaskList} />
              <Route
                exact
                path={"/settings"}
                render={(props) => (
                  <EditUserContainer {...props} user={user} />
                )}/>
              </div>
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
