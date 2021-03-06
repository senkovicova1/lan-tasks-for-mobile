import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import Form from './form';

import {
  NO_CHANGE,
  DELETED
} from '/imports/other/constants';

const { DateTime } = require("luxon");
// DateTime.fromSeconds(change.dateCreated).toFormat("dd.LL.y HH:mm")

export default function FormIndex( props ) {

  const {
    match,
    _id: taskId,
    changeID,
    closed: taskClosed,
    name: taskName,
    important: taskImportant,
    assigned: taskAssigned,
    description: taskDescription,
    allDay: taskAllDay,
    startDatetime: taskStartDatetime,
    endDatetime: taskEndDatetime,
    deadline: taskDeadline,
    hours: taskHours,
    folder: taskFolder,
    container: taskContainer,
    files: taskFiles,
    repeat: taskRepeat,
    allSubtasks,
    allComments,
    subtasksLoading,
    commentsLoading,
    history,
    title,
    language,
    addNewTask,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
  const notifications = useSelector( ( state ) => state.notifications.value );
  const folders = useSelector( ( state ) => state.folders.value ).active;

  const [ name, setName ] = useState( "" );
  const [ important, setImportant ] = useState( false );
  const [ folder, setFolder ] = useState( null );
  const [ container, setContainer ] = useState( null );
  const [ closed, setClosed ] = useState( false );
  const [ assigned, setAssigned ] = useState( [] );
  const [ description, setDescription ] = useState( "" );
  const [ newDescription, setNewDescription ] = useState( "" );
  const [ descriptionInFocus, setDescriptionInFocus ] = useState( false );
  const [ deadline, setDeadline ] = useState( "" );
  const [ allDay, setAllDay ] = useState( false );
  const [ startDatetime, setStartDatetime ] = useState( "" );
  const [ endDatetime, setEndDatetime ] = useState( "" );
  const [ possibleStartDatetime, setPossibleStartDatetime ] = useState( "" );
  const [ possibleEndDatetime, setPossibleEndDatetime ] = useState( "" );
  const [ openDatetime, setOpenDatetime ] = useState( false );
  const [ hours, setHours ] = useState( "" );

  const [ repeat, setRepeat ] = useState( null );
  const [ possibleRepeat, setPossibleRepeat ] = useState( null );
  const [ openRepeat, setOpenRepeat ] = useState( false );

  const [ addedSubtasks, setAddedSubtasks ] = useState( [] );

  const [ comments, setComments ] = useState( [] );

  const [ files, setFiles ] = useState( [] );

  useEffect( () => {

    if ( taskName ) {
      setName( taskName );
    } else {
      setName( "" );
    }

    if ( taskFolder ) {
      setFolder( taskFolder );

      if ( taskContainer ) {
        const container = taskFolder.containers ? taskFolder.containers.find( container => container._id === taskContainer ) : null;
        setContainer( container ? {
          ...container,
          value: container._id
        } : null );
      } else {
        setContainer( null );
      }
    } else {
      setFolder( null );
    }

    if ( taskImportant ) {
      setImportant( taskImportant );
    } else {
      setImportant( false );
    }

    if ( taskClosed ) {
      setClosed( taskClosed );
    } else {
      setClosed( false );
    }

    if ( taskAssigned ) {
      setAssigned( taskAssigned );
    } else {
      setAssigned( [ dbUsers.find( user => user._id === userId ) ] );
    }

    if ( taskDescription ) {
      setDescription( taskDescription );
    } else {
      setDescription( "" );
    }

    if ( taskAllDay ) {
      setAllDay( taskAllDay );
    } else {
      setAllDay( false );
    }

    if ( taskStartDatetime ) {
      setStartDatetime( taskStartDatetime );
    } else {
      setStartDatetime( "" );
    }

    if ( !taskEndDatetime && taskDeadline ) {
      setEndDatetime( taskDeadline );
      setDeadline( "" );
    } else {
      setDeadline( "" );
    }

    if ( taskEndDatetime ) {
      setEndDatetime( taskEndDatetime );
    } else {
      setEndDatetime( "" );
    }

    if ( taskHours ) {
      setHours( taskHours );
    } else {
      setHours( "" );
    }

    if ( taskFiles ) {
      setFiles( taskFiles );
    } else {
      setFiles( [] );
    }

    if ( taskRepeat ) {
      setRepeat( {
        ...taskRepeat,
        intervalFrequency: [ {
          label: parseInt( taskRepeat.intervalNumber ) === 1 ? "day" : "days",
          value: "d"
        }, {
          label: parseInt( taskRepeat.intervalNumber ) === 1 ? "week" : "weeks",
          value: "w"
        }, {
          label: parseInt( taskRepeat.intervalNumber ) === 1 ? "month" : "months",
          value: "m"
        }, {
          label: parseInt( taskRepeat.intervalNumber ) === 1 ? "year" : "years",
          value: "y"
        } ].find( interval => interval.value === taskRepeat.intervalFrequency )
      } );
    } else {
      setRepeat( null );
    }

  }, [ taskName, taskFolder, taskContainer, taskClosed, taskImportant, taskAssigned, taskDescription, taskDeadline, taskAllDay, taskStartDatetime, taskEndDatetime, taskHours, taskFiles, taskRepeat, dbUsers, userId ] );

  useEffect( () => {
    if ( startDatetime ) {
      setPossibleStartDatetime( startDatetime );
    }
    if ( endDatetime ) {
      setPossibleEndDatetime( endDatetime );
    }
    if ( !startDatetime ) {
      let now = DateTime.now().plus({days: 1});
      if ( now.minute <= 15 ) {
        now.set( {minute: 15} );
      } else if ( now.minute <= 30 ) {
        now.set( {minute: 30} );
      } else if ( now.minute <= 45 ) {
        now.set( {minute: 45} );
      } else if ( now.minute <= 60 ) {
        now.plus({hours: 1});
        now.set( {minute: 0} );
      }
      setPossibleStartDatetime( parseInt(now.toSeconds()) );
      setPossibleEndDatetime( parseInt(now.plus({minutes: 30}).toSeconds()) );
    }

    if ( repeat ) {
      setPossibleRepeat( {
        ...repeat
      } );
    }
  }, [ openDatetime ] );

  const mappedHistory = useMemo( () => {
    if ( !history || history.length === 0 || !dbUsers || dbUsers.length === 0 ) {
      return [];
    }
    return history[ 0 ].changes.map( change => ( {
      ...change,
      user: dbUsers.find( dbUser => dbUser._id === change.user )
    } ) ).reverse();
  }, [ history, dbUsers ] );

  const subtasks = useMemo( () => {
    return allSubtasks ? allSubtasks.filter( subtask => subtask.task === taskId ) : [];
  }, [ taskId, allSubtasks ] );

  const containers = useMemo( () => {
    if ( folder ) {
      return folder.containers && folder.containers.length > 0 ? [ {
        value: 0,
        _id: 0,
        label: "New"
      }, ...folder.containers.map( container => ( {
        ...container,
        vlaue: container._id
      } ) ) ] : [ {
        value: 0,
        _id: 0,
        label: "New"
      } ];
    }
    return [ {
      value: 0,
      _id: 0,
      label: "New"
    } ];
  }, [ taskId, folder ] );

  useEffect( () => {
    let newComments = allComments ? allComments.filter( comment => comment.task === taskId ).map( comment => ( {
      ...comment,
      change: NO_CHANGE
    } ) ) : [];
    setComments( newComments );
  }, [ taskId, allComments ] );

  const displayedSubtasks = useMemo( () => {
    return addedSubtasks.length > 0 ? addedSubtasks.sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 ) : subtasks.filter( subtask => subtask.change !== DELETED ).sort( ( st1, st2 ) => st1.dateCreated > st2.dateCreated ? 1 : -1 );
  }, [ subtasks, addedSubtasks ] );

  const displayedComments = useMemo( () => {
    return comments.filter( comment => comment.change !== DELETED ).map( comment => {
      const author = dbUsers.find( user => user._id === comment.author );
      if ( author ) {
        return ( {
          ...comment,
          author
        } );
      }
      return ( {
        ...comment,
        author: {}
      } );
    } ).sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 );
  }, [ comments, dbUsers ] );

  const usersWithRights = useMemo( () => {
    if ( folder ) {
      return folder.users.map( user => {
        let newUser = {
          ...dbUsers.find( u => u._id === user._id ),
          ...user
        };
        return newUser;
      } );
    }
    return [];
  }, [ folder, dbUsers ] );



  return (
    <Form
      {...props}

    userId={userId}
    language={language}

    addNewTask={addNewTask}
    openDatetime={openDatetime}
    setOpenDatetime={setOpenDatetime}

    wholeTask={{
        _id: taskId,
        closed: taskClosed,
        name: taskName,
        important: taskImportant,
        assigned: taskAssigned,
        description: taskDescription,
        allDay: taskAllDay,
        startDatetime: taskStartDatetime,
        endDatetime: taskEndDatetime,
        deadline: taskDeadline,
        hours: taskHours,
        folder: taskFolder,
        container: taskContainer,
        files: taskFiles,
        repeat: taskRepeat,
        changeID
      }}
      history={history}

    taskId={taskId}
    changeID={changeID}
    closed={closed}
    setClosed={setClosed}
    name={name}
    setName={setName}
    important={important}
    setImportant={setImportant}
    folder={folder}
    setFolder={setFolder}
    container={container}
    setContainer={setContainer}
    defaultContainer={{
        value: 0,
        _id: 0,
        label: "New"
      }}
    assigned={assigned}
    setAssigned={setAssigned}
    hours={hours}
    setHours={setHours}

    allDay={allDay}
    setAllDay={setAllDay}
    startDatetime={startDatetime}
    setStartDatetime={setStartDatetime}
    possibleStartDatetime={possibleStartDatetime}
    setPossibleStartDatetime={setPossibleStartDatetime}
    endDatetime={endDatetime}
    setEndDatetime={setEndDatetime}
    possibleEndDatetime={possibleEndDatetime}
    setPossibleEndDatetime={setPossibleEndDatetime}
    repeat={repeat}
    setRepeat={setRepeat}
    possibleRepeat={possibleRepeat}
    setPossibleRepeat={setPossibleRepeat}

    description={description}
    setDescription={setDescription}

    files={files}
    setFiles={setFiles}

    displayedSubtasks={displayedSubtasks}
    addedSubtasks={addedSubtasks}
    setAddedSubtasks={setAddedSubtasks}
    allSubtasks={allSubtasks}
    subtasksLoading={subtasksLoading}

    displayedComments={displayedComments}
    comments={comments}
    commentsLoading={commentsLoading}
    setComments={setComments}

    mappedHistory={mappedHistory}
    history={history}

    folders={folders}
    dbUsers={dbUsers}
    notifications={notifications}
    usersWithRights={usersWithRights}
    containers={containers}
    onCancel={onCancel}
    />
  );
};
