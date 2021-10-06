import React, {
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import TasksList from '/imports/ui/tasks/list';
import AddTask from '/imports/ui/tasks/addContainer';
import EditTask from '/imports/ui/tasks/editContainer';
import Loader from '/imports/ui/other/loadingScreen';

import {
  PLAIN,
  allMyTasksFolder,
  importantTasksFolder
} from "/imports/other/constants";

export default function TasksContainer( props ) {

  const {
    match,
    history,
  } = props;

  const {
    folderID
  } = match.params;

  const {
    layout
  } = useSelector( ( state ) => state.metadata.value );

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );

  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    let group = folders.active;
    if ( match.path.includes( "archived" ) ) {
      group = folders.archived;
    }
    if ( !folderID || folderID === "all" ) {
      return allMyTasksFolder( language );
    }
    if ( folderID === "important" ) {
      return importantTasksFolder( language );
    }
    const maybeFolder = group.find( folder => folder._id === folderID );
    return maybeFolder;
  }, [ folders, folderID ] );

  const [ chosenTask, setChosenTask ] = useState( null );

  if ( !folder ) {
    return <Loader />;
  }

  if ( window.innerWidth <= 820 || layout === PLAIN ) {
    return (
      <TasksList
          {...props}
          setParentChosenTask={setChosenTask}
          chosenTask={chosenTask}
          folder={folder}
          />
    );
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "100%", position: "relative", padding: "20px 15px"}}>
        <TasksList
          {...props}
          setParentChosenTask={setChosenTask}
          chosenTask={chosenTask}
          folder={folder}
          />
      </div>
      <div style={{width: "80%", backgroundColor: "white", height: "-webkit-fill-available", position: "relative",  padding: "5px 15px"}}>
        {
          chosenTask &&
          <EditTask {...props} taskId={chosenTask} setParentChosenTask={setChosenTask}/>
        }
        {
          !chosenTask &&
          <div style={{padding: "15px"}}><h2>No chosen task</h2> </div>
        }
      </div>
    </div>
  );
};
