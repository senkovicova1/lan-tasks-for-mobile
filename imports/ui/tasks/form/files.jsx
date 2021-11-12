import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import Select from 'react-select';

import moment from 'moment';

import {
  Spinner
} from 'reactstrap';

import Datetime from 'react-datetime';

import {
  closeTask,
  updateSimpleAttribute,
  addRepeatToTask,
} from './tasksHandlers';

import {
  addNewSubtask,
  editSubtask,
  removeSubtask
} from './subtasksHandlers';

import {
  addNewComment,
  editComment,
  removeComment
} from './commentsHandlers';

import {
  editRepeatInTask,
  removeTaskFromRepeat
} from '/imports/ui/repeats/repeatsHandlers';

import Repeat from '/imports/ui/repeats/form';
//import EditRepeat from '/imports/ui/repeats/editContainer';

import {
  EmptyStarIcon,
  FullStarIcon,
  FolderIcon,
  PlusIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
  DeleteIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  PaperClipIcon,
  TextIcon,
  ColumnsIcon,
  RestoreIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Form,
  TitleInput,
  TitleCheckbox,
  Input,
  InlineInput,
  HiddenInput,
  Textarea,
  HiddenTextarea,
  List,
  ItemContainer,
  ButtonRow,
  LinkButton,
  CircledButton,
  CommentContainer,
  FileContainer,
  FullButton,
  ButtonCol,
  DatetimePicker
} from "/imports/other/styles/styledComponents";

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

import {
  uint8ArrayToImg,
} from '/imports/other/helperFunctions';

import {
  CLOSED_STATUS,
  OPEN_STATUS,
  TITLE,
  IMPORTANT,
  NOT_IMPORTANT,
  CONTAINER,
  ASSIGNED,
  REMOVED_START_END,
  SET_START,
  SET_END,
  SET_HOURS,
  CHANGE_HOURS,
  DESCRIPTION,
  REMOVE_FILE,
  ADD_FILE,
  SUBTASK_CLOSED,
  SUBTASK_OPENED,
  REMOVE_SUBTASK,
  RENAME_SUBTASK,
  ADD_SUBTASK,
  ADD_COMMENT,
  EDIT_COMMENT,
 REMOVE_COMMENT,
 REMOVED_REPEAT,
 CHANGE_REPEAT,
 SET_REPEAT,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function TaskForm( props ) {

  const {
    match,
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
    allTasks,
    history,
    title,
    language,
    addNewTask,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
  const allSubtasks = useSelector( ( state ) => state.subtasks.value );
  const allComments = useSelector( ( state ) => state.comments.value );
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

  const [ repeat, setRepeat ] = useState( null);
  const [ possibleRepeat, setPossibleRepeat ] = useState( null);
  const [ openRepeat, setOpenRepeat ] = useState(false);

  const [ possibleSubtaskName, setPossibleSubtaskName ] = useState("");
  const [ editedSubtask, setEditedSubtask ] = useState("");
  const [ addedSubtasks, setAddedSubtasks ] = useState( [] );
  const [ newSubtaskName, setNewSubtaskName ] = useState( "" );
  const [ openNewSubtask, setOpenNewSubtask ] = useState( false );

  const [ comments, setComments ] = useState( [] );
  const [ newCommentBody, setNewCommentBody ] = useState( "" );
  const [ editedComment, setEditedComment ] = useState( null );
  const [ editedCommentBody, setEditedCommentBody ] = useState( "" );
  const [ showComments, setShowComments ] = useState( true );

  const [ files, setFiles ] = useState( [] );
  const [ showSpinner, setShowSpinner ] = useState( false );

  useEffect( () => {

    if ( taskName ) {
      setName( taskName );
    } else {
      setName( "" );
    }

    if ( taskFolder ) {
      setFolder( taskFolder );

      if ( taskContainer ) {
        const container = taskFolder.containers ? taskFolder.containers.find(container => container._id === taskContainer) : null;
        setContainer( container ? {...container, value: container._id} : null );
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
      setAssigned( [dbUsers.find( user => user._id === userId )] );
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
        intervalFrequency: [
          {
            label: parseInt(taskRepeat.intervalNumber) === 1 ? "day" : "days",
            value: "d"
          }, {
            label: parseInt(taskRepeat.intervalNumber) === 1 ? "week" : "weeks",
            value: "w"
          }, {
            label: parseInt(taskRepeat.intervalNumber) === 1 ? "month" : "months",
            value: "m"
          }, {
            label: parseInt(taskRepeat.intervalNumber) ? "y" : "years",
            value: "years"
          }
        ].find(interval => interval.value === taskRepeat.intervalFrequency)
      } );
    } else {
      setRepeat( null );
    }

  }, [ taskName, taskFolder, taskContainer, taskClosed, taskImportant, taskAssigned, taskDescription, taskDeadline, taskAllDay, taskStartDatetime, taskEndDatetime, taskHours, taskFiles, taskRepeat, dbUsers, userId ] );

  useEffect(() => {
    if (startDatetime){
      setPossibleStartDatetime(startDatetime);
    }
    if (endDatetime){
      setPossibleEndDatetime(endDatetime);
    }
    if (!startDatetime) {
      let now = moment().add(1, 'days');
      if (now.minutes() <= 15){
        now.minutes(15);
      } else if (now.minutes() <= 30){
        now.minutes(30);
      } else if (now.minutes() <= 45){
        now.minutes(45)
      } else if (now.minutes <= 60){
        now.add(1, 'h');
        now.minutes(0);
      }
      setPossibleStartDatetime(now.unix());
      setPossibleEndDatetime(now.add(30, 'minutes').unix());
    }

    if (repeat){
      setPossibleRepeat({...repeat});
    }
  }, [openDatetime]);

  const mappedHistory = useMemo( () => {
    if (!history || history.length === 0 || !dbUsers || dbUsers.length === 0){
      return [];
    }
    return history[0].changes.map(change => ({...change, user: dbUsers.find(dbUser => dbUser._id === change.user)})).reverse();
  }, [ history, dbUsers ] );

  const subtasks = useMemo( () => {
    return allSubtasks.filter( subtask => subtask.task === taskId );
  }, [ taskId, allSubtasks ] );

  const containers = useMemo( () => {
    if (folder){
      return folder.containers && folder.containers.length > 0 ? [{value: 0, _id: 0, label: "New"}, ...folder.containers.map(container => ({...container, vlaue: container._id}))] : [{value: 0, _id: 0, label: "New"}];
    }
    return [{value: 0, _id: 0, label: "New"}];
  }, [ taskId, folder ] );

  useEffect( () => {
    let newComments = allComments.filter( comment => comment.task === taskId ).map( comment => ( {
      ...comment,
      change: NO_CHANGE
    } ) );
    setComments( newComments );
  }, [ taskId, allComments ] );

  const displayedSubtasks = useMemo( () => {
    return addedSubtasks.length > 0 ? addedSubtasks.sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 ) : subtasks.filter( subtask => subtask.change !== DELETED ).sort( ( st1, st2 ) => st1.dateCreated < st2.dateCreated ? 1 : -1 );
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

  const hoursAndMinutes = () => {
    let options = [];
    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 59; m = m+15) {
        options.push({label: `${h}:${m}`, value: `${h}:${m}`, hours: h, minutes: m});
      }
    }
    return options;
  };

  const getLabelFromRepeatFrequency = (value, number) => {
    switch (value) {
      case "d":
        return parseInt(number) === 1 ? "day" : "days";
        break;
          case "w":
            return parseInt(number) === 1 ? "week" : "weeks";
            break;
              case "m":
              return parseInt(number) === 1 ? "month" : "months";
                break;
        case "y":
          return parseInt(number) === 1 ? "year" : "years";
          break;

    }
  }

  document.onkeydown = function( e ) {
    e = e || window.event;
    if ( e.which === 13 || e.keyCode === 13 ) {
      if ( openNewSubtask ) {
        if (!addNewTask){
          addNewSubtask( newSubtaskName, false, taskId, moment().unix() );
          const historyData = {
            dateCreated: moment().unix(),
            user: userId,
            type: ADD_SUBTASK,
            args: [newSubtaskName],
          };
          if (history.length === 0){
            Meteor.call(
              'history.addNewHistory',
              taskId,
              [
                historyData
              ]
            );
          } else {
            Meteor.call(
              'history.editHistory',
              history[0]._id,
              historyData
            )
          }
          const notificationData = {
            ...historyData,
            args: [newSubtaskName, name],
            read: false,
            taskId,
            folderId: folder._id,
          };
          if (assigned.length > 0){
            assigned.filter(assigned => assigned._id !== userId).map(assigned => {
              let usersNotifications = notifications.find( notif => notif._id === assigned._id );
             if (usersNotifications && usersNotifications.notifications.length > 0){
               Meteor.call(
                 'notifications.editNotifications',
                  assigned._id,
                  assigned.email,
                  notificationData,
                  dbUsers
                );
              } else {
                Meteor.call(
                  'notifications.addNewNotification',
                  assigned._id,
                  assigned.email,
                  [
                    notificationData
                   ],
                   dbUsers
                 );
              }
            })
          }
        } else{
          setAddedSubtasks([...addedSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated: moment().unix()}]);
        }
        setNewSubtaskName( "" );
        setOpenNewSubtask( false );
      } else {
        subtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
        addedSubtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
      }
    }
  }

  const txHeight = 40;
  const tx = document.getElementsByTagName( "textarea" );
  for ( let i = 0; i < tx.length; i++ ) {
    if ( tx[ i ].value == '' || (tx[i].id === "task-title" && tx[ i ].scrollHeight < 76) || (tx[i].id !== "task-title" && tx[ i ].scrollHeight < 51) ) {
      tx[ i ].setAttribute( "style", "height:" + txHeight + "px;overflow-y:hidden;" );
    } else {
      tx[ i ].setAttribute( "style", "height:" + ( tx[ i ].scrollHeight ) + "px;overflow-y:hidden;" );
    }
    tx[ i ].addEventListener( "input", OnInput, false );
  }

  function OnInput( e ) {
    this.style.height = "auto";
    this.style.height = ( this.scrollHeight ) + "px";
  }

  let timeout = null;

  return (
    <Form excludeBtn={true}>

      {
        onCancel &&
        <CircledButton
          left={true}
          onClick={(e) => {e.preventDefault(); onCancel()}}
          >
          <img
            className="icon"
            src={CloseIcon}
            alt="Close icon not found"
            />
        </CircledButton>
      }


      <section className="inline" style={{marginTop: "0.3em"}}>
        <TitleCheckbox
          id="task-checked"
          type="checkbox"
          checked={closed}
          onChange={() => {
            const newClosed = !closed;
            setClosed(newClosed);
            if (!addNewTask){
              if (newClosed){
                Meteor.call(
                  'tasks.closeTask',
                  {
                  _id: taskId,
                  name,
                  closed: !newClosed,
                  important,
                  assigned,
                  startDatetime,
                  endDatetime,
                  allDay,
                  hours,
                  description,
                  files,
                  folder,
                  repeat,
                },
                allSubtasks
              );
              } else {
                Meteor.call(
                  'tasks.updateSimpleAttribute',
                  taskId,
                  {closed: newClosed}
                );
              }
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: newClosed ? CLOSED_STATUS : OPEN_STATUS,
                args: [],
              };
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                      Meteor.call(
                        'notifications.editNotifications',
                         assigned._id,
                         assigned.email,
                         notificationData,
                         dbUsers
                       );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
          }}
          />
        <TitleInput
          type="text"
          id="task-title"
          placeholder="Name"
          value={name}
          disabled={closed}
          onChange={(e) => {
            const oldName = name;
            setName(e.target.value);
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  name: e.target.value
                }
              );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: TITLE,
                args: [oldName, e.target.value],
              };
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [oldName, e.target.value],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
          }}
          />
      </section>

            <div style={{position: "relative"}}>
      <section className="inline fit">
        <LinkButton
          style={{color: "#f3d053"}}
          height="fit"
          disabled={closed}
          onClick={(e) => {
            e.preventDefault();
            const newImportant = !important;
            setImportant(newImportant);
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  important: newImportant
                }
              );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: newImportant ? IMPORTANT : NOT_IMPORTANT,
                args: [],
              };
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }

              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  }
                 if (usersNotifications && usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
          }}
          >
          {
            important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={FullStarIcon}
              alt="Full star icon not found"
              />
          }
          {
            !important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={EmptyStarIcon}
              alt="Empty star icon not found"
              />
          }
          <span style={{marginLeft: "10px"}}>
            Important
          </span>
        </LinkButton>
      </section>

      {
        addNewTask &&
      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={FolderIcon}
            alt="FolderIcon icon not found"
            />
        </span>
        <div style={{width: "100%"}}>
          <Select
            id="folder"
            name="folder"
            isDisabled={closed}
            styles={selectStyle}
            value={folder}
            onChange={(e) => {
              setFolder(e);
            }}
            options={folders}
            />
        </div>
      </section>
    }

    <section className="inline">
      <span className="icon-container">
        <img
          className="label-icon"
          htmlFor="container"
          src={ColumnsIcon}
          alt="ColumnsIcon icon not found"
          />
      </span>
      <div style={{width: "100%"}}>
        <Select
          id="container"
          name="container"
          styles={selectStyle}
          isDisabled={closed}
          value={container ? container : {value: 0, _id: 0, label: "New"}}
          onChange={(e) => {
            const oldContainer = container ? container : {value: 0, _id: 0, label: "New"};
            setContainer(e);
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  container: e._id
                }
              );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: CONTAINER,
                args: [oldContainer.label, e.label],
              }
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                 if (usersNotifications.notifications.length > 0){
                     const notificationData = {
                       ...historyData,
                       args: [name, oldContainer.label, e.label],
                       read: false,
                       taskId,
                       folderId: folder._id,
                     }
                       Meteor.call(
                         'notifications.editNotifications',
                          assigned._id,
                          assigned.email,
                          notificationData,
                          dbUsers
                        );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
          }}
          options={containers}
          />
      </div>
    </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={UserIcon}
            alt="User icon not found"
            />
        </span>
        <div style={{width: "100%"}}>
          <Select
            id="assigned"
            name="assigned"
            styles={selectStyle}
            isMulti
            value={assigned}
            isDisabled={closed}
            onChange={(e) => {
              const oldAssigned = assigned;
              setAssigned(e);
              if ( !addNewTask ) {
                Meteor.call(
                  'tasks.updateSimpleAttribute',
                  taskId,
                  {
                    assigned: e.map(user => user._id)
                  }
                );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: ASSIGNED,
                args: [oldAssigned.map(user => user.label).join(", "), e.map(user => user.label).join(", ")]
              }
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [name, oldAssigned.map(user => user.label).join(", "), e.map(user => user.label).join(", ")],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
            }}
            options={usersWithRights}
            />
        </div>
      </section>

      {
        (closed || !openDatetime) &&
      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="deadline"
            src={CalendarIcon}
            alt="Calendar icon not found"
            />
        </span>
        <span className={"datetime-span" + (closed ? " closed" : "")} >
        <span
          onClick={() => setOpenDatetime(true)}
          >
          {
            !closed &&
            !startDatetime &&
            !endDatetime &&
            translations[language].setScheduled
          }
          {
            closed &&
            !startDatetime &&
            !endDatetime &&
            translations[language].notScheduled
          }
          {
            (startDatetime || endDatetime) &&
            !allDay &&
            (`${moment.unix(startDatetime).format("D.M.YYYY HH:mm")} - ${moment.unix(endDatetime).format("HH:mm")}` + (repeat ? ` (repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? "until" : ""} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""})` : "")
          )
          }
          {
            (startDatetime || endDatetime) &&
            allDay &&
            (`${moment.unix(startDatetime).format("D.M.YYYY")} - ${moment.unix(endDatetime).format("D.M.YYYY")}` + ( repeat ? ` (repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? "until" : ""} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""})` : "")
          )
          }
        </span>
        {
          !closed &&
        <LinkButton
          style={{height: "40px", marginLeft: "auto"}}
          className="left"
          height="fit"
          disabled={closed}
          onClick={(e) => {
            e.preventDefault();
            const oldStart = startDatetime;
            const oldEnd = endDatetime;
            setStartDatetime("");
            setEndDatetime("");
            setRepeat(null);
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  name: e.target.value,
                  startDatetime: "",
                  endDatetime: "",
                  repeat: null
                }
              );
              removeTaskFromRepeat(taskId, repeat._id, dbTasks);

              const historyData1 = {
                dateCreated: moment().unix(),
                user: userId,
                type: REMOVED_START_END,
                args: [],
              }
              const historyData2 = {
                dateCreated: moment().unix(),
                user: userId,
                type: REMOVED_REPEAT,
                args: [],
              }
              if (history.length === 0){
                  Meteor.call(
                    'history.addNewHistory',
                    taskId,
                    [
                      historyData1,
                      historyData2
                    ]
                  );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData1
                )
                  Meteor.call(
                    'history.editHistory',
                    history[0]._id,
                    historyData2
                  )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData1 = {
                    ...historyData1,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                  const notificationData2 = {
                    ...historyData2,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData1,
                      dbUsers
                    );
                      Meteor.call(
                        'notifications.editNotifications',
                         assigned._id,
                         assigned.email,
                         notificationData2,
                         dbUsers
                       );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData1,
                        notificationData2
                      ],
                      dbUsers
                     );
                  }
                })
              }
            }
          }}
          >
            <img
              style={{margin: "0px"}}
              className="icon"
              src={CloseIcon}
              alt="CloseIcon star icon not found"
              />
        </LinkButton>
      }
      </span>
      </section>
    }

        {
          !closed &&
          openDatetime &&
          <div>
          <DatetimePicker>
            <section>
            <h3>{translations[language].setScheduled}</h3>
          </section>
          <section className="inline">
              {
                allDay &&
                <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                From:
                </span>
              }
                  {
                    !allDay &&
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    Date:
                    </span>
                  }
              <Datetime
                className="full-width"
                dateFormat={"DD.MM.yyyy"}
                value={possibleStartDatetime ? moment.unix(possibleStartDatetime) : possibleStartDatetime}
                timeFormat={false}
                name="startDate"
                id="startDate"
                inputProps={{
                  placeholder: translations[language].setDate,
                }}
                onChange={(date) => {
                  if (typeof date !== "string"){
                      const newYear = date.year();
                      const newMonth = date.month();
                      const newDay = date.date();
                      const newEndDatetime = moment(endDatetime ? endDatetime*1000 : date.unix()).year(newYear).month(newMonth).date(newDay);
                      setPossibleStartDatetime(date.unix());
                      setPossibleEndDatetime(newEndDatetime.unix());
                  } else {
                      setPossibleStartDatetime(date);
                  }
                }}
                renderInput={(props) => {
                    return <Input
                      {...props}
                      disabled={closed}
                      value={possibleStartDatetime ? props.value : ''}
                      />
                }}
                />
                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    setPossibleStartDatetime("");
                  }}
                  >
                    <img
                      style={{margin: "0px"}}
                      className="icon"
                      src={CloseIcon}
                      alt="CloseIcon star icon not found"
                      />
                </LinkButton>
              </section>
              {
                !allDay &&
                <section className="inline">
                  <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    {translations[language].from}
                  </span>

                  <div style={{width: "100%"}}>
                    <Select
                      name="startTime"
                      id="startTime"
                      isDisabled={closed}
                      styles={selectStyle}
                      value={possibleStartDatetime ? {label: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, value: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, hours: moment(possibleStartDatetime*1000).hours(), minutes: moment(possibleStartDatetime*1000).minutes()} : null}
                      placeholder={"Set time"}
                      onChange={(e) => {
                        const newStartDatetime = moment(possibleStartDatetime*1000).hours(e.hours).minutes(e.minutes);
                        if (typeof newStartDatetime !== "string"){
                            setPossibleStartDatetime(newStartDatetime.unix());
                        } else {
                            setPossibleStartDatetime(newStartDatetime);
                        }
                      }}
                      options={hoursAndMinutes()}
                      />
                  </div>

                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    const newHour = 0;
                    const newMinute = 0;
                    const newSecond = 0;
                    const newStartDatetime = moment(possibleStartDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                    setPossibleStartDatetime(newStartDatetime.unix());
                  }}
                  >
                    <img
                      style={{margin: "0px"}}
                      className="icon"
                      src={CloseIcon}
                      alt="CloseIcon star icon not found"
                      />
                </LinkButton>
              </section>
              }
                {
                  !allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      {translations[language].to}
                    </span>
                    <div style={{width: "100%"}}>
                      <Select
                        name="endTime"
                        id="endTime"
                        isDisabled={closed}
                        styles={selectStyle}
                        value={possibleEndDatetime ? {label: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, value: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, hours: moment(possibleEndDatetime*1000).hours(), minutes: moment(possibleEndDatetime*1000).minutes()} : null}
                        placeholder={"Set time"}
                        onChange={(e) => {
                          let newEndDatetime = moment(possibleEndDatetime*1000).hours(e.hours).minutes(e.minutes);
                          if (typeof newEndDatetime !== "string"){
                              setPossibleEndDatetime(newEndDatetime.unix());
                          } else {
                              setPossibleEndDatetime(newEndDatetime);
                          }
                        }}
                        options={hoursAndMinutes()}
                        />
                    </div>

                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      const newHour = 0;
                      const newMinute = 0;
                      const newSecond = 0;
                      const newEndDatetime = moment(possibleEndDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                      setPossibleEndDatetime(newEndDatetime.unix());
                    }}
                    >
                      <img
                        style={{margin: "0px"}}
                        className="icon"
                        src={CloseIcon}
                        alt="CloseIcon star icon not found"
                        />
                  </LinkButton>
                </section>
                }
                {
                  allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      {translations[language].to}
                    </span>
                  <Datetime
                    className="full-width"
                    dateFormat={"DD.MM.yyyy"}
                    value={possibleEndDatetime ? moment.unix(possibleEndDatetime) : possibleEndDatetime}
                    timeFormat={false}
                    name="endDate"
                    id="endDate"
                    inputProps={{
                    placeholder: translations[language].setDate,
                    }}
                    onChange={(date) => {
                      if (typeof date !== "string"){
                          setPossibleEndDatetime(date.unix());
                      } else {
                          setPossibleEndDatetime(date);
                      }
                    }}
                    renderInput={(props) => {
                        return <Input
                          {...props}
                          disabled={closed}
                           value={possibleEndDatetime ? props.value : ''}
                          />
                    }}
                    />
                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      setPossibleEndDatetime(possibleStartDatetime);
                    }}
                    >
                      <img
                        style={{margin: "0px"}}
                        className="icon"
                        src={CloseIcon}
                        alt="CloseIcon star icon not found"
                        />
                  </LinkButton>
                  </section>
                }

          <section>
            <Input
              id='taskAllDay'
              type="checkbox"
              style={{width: "1.5em", marginLeft: "9px", marginRight: "9px"}}
              checked={allDay}
              disabled={closed}
              onChange={() =>  {
                const newAllDay = !allDay;
                setAllDay(newAllDay);

                if (!newAllDay){
                  const newYear = moment(possibleStartDatetime*1000).year();
                  const newMonth = moment(possibleStartDatetime*1000).month();
                  const newDay = moment(possibleStartDatetime*1000).date();
                  const newEndDatetime = moment(possibleEndDatetime*1000).year(newYear).month(newMonth).date(newDay);
                  setPossibleEndDatetime(newEndDatetime.unix());
                }

              }}
              />
            <span style={{marginLeft: "10px"}}>
              {translations[language].allDay}
            </span>
          </section>

            <section>
            <h3>{translations[language].setRepeat}</h3>
          </section>
        <section className="inline">
            <span className="icon-container" style={{width: "150px"}}>
          {translations[language].repeatEvery}
          </span>
          <Input
            id="intervalNumber"
            name="intervalNumber"
            style={{width: "50%", marginRight: "0.6em"}}
            type="number"
            placeholder={translations[language].setRepeat}
            value={possibleRepeat ? possibleRepeat.intervalNumber : ""}
            onChange={(e) => setPossibleRepeat({...possibleRepeat, intervalNumber: e.target.value})}
            />
          <div style={{width: "50%"}}>
            <Select
              styles={selectStyle}
              value={possibleRepeat ? possibleRepeat.intervalFrequency : ""}
              onChange={(e) => {
                setPossibleRepeat({...possibleRepeat, intervalFrequency: e})
              }}
              options={[
                {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "day" : "days",
                  value: "d"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "week" : "weeks",
                  value: "w"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "month" : "months",
                  value: "m"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) ? "year" : "years",
                   value: "y"
                 }
               ]}
              />
          </div>
        </section>

        <section className="inline">
              <span className="icon-container" style={{width: "150px"}}>
            {translations[language].repeatUntil}
            </span>
          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            value={possibleRepeat ? moment.unix(possibleRepeat.repeatUntil) : ""}
            timeFormat={false}
            name="repeatUntil"
            id="repeatUntil"
            inputProps={{
            placeholder: translations[language].setDate,
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setPossibleRepeat({...possibleRepeat, repeatUntil: date.unix()});
                } else {
                  setPossibleRepeat({...possibleRepeat, repeatUntil: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    disabled={closed}
                     value={props.value}
                    />
              }}
                />
        </section>

        <section>
          <ButtonRow>
          <LinkButton
            style={{marginRight: "auto", marginLeft: "0px"}}
            onClick={(e) => {
              e.preventDefault();
              setOpenDatetime(false);
            }}
            >
            {translations[language].close}
          </LinkButton>
          <FullButton
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();

              const oldStart = startDatetime;
              const oldEnd = endDatetime;

              const oldRepeat = repeat ? `Repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""}` : "";
              const newHistoryRepeat = possibleRepeat ?  `Repeat every ${possibleRepeat.intervalNumber} ${getLabelFromRepeatFrequency(possibleRepeat.intervalFrequency.value, possibleRepeat.intervalNumber)} ${possibleRepeat.repeatUntil ? moment.unix(possibleRepeat.repeatUntil).format("D.M.YYYY") : ""}` : "";

              setStartDatetime(possibleStartDatetime);
              setEndDatetime(possibleEndDatetime);

              if (oldRepeat !== newHistoryRepeat){
                setRepeat({...possibleRepeat});
              }

              if ( !addNewTask ) {
                if (oldRepeat !== newHistoryRepeat){
                  if (repeat && repeat._id ){
                    editRepeatInTask(taskRepeat, {...possibleRepeat, intervalFrequency: possibleRepeat.intervalFrequency.value , repeatStart: startDatetime ? startDatetime: possibleStartDatetime}, allTasks);
                  } else {
                    addRepeatToTask(taskId, {...possibleRepeat, intervalFrequency: possibleRepeat.intervalFrequency.value, repeatStart: startDatetime ? startDatetime: possibleStartDatetime});
                  }
                }

                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    taskId,
                    {
                      allDay: allDay,
                      startDatetime: possibleStartDatetime,
                      endDatetime: possibleEndDatetime
                    }
                  );

                const historyData1 = {
                  dateCreated: moment().unix(),
                  user: userId,
                  type: SET_START,
                  args: [moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleStartDatetime).format("D.M.YYYY HH:mm:ss")]
                };
                const historyData2 = {
                  dateCreated: moment().unix(),
                  user: userId,
                  type: SET_END,
                  args: [moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleEndDatetime).format("D.M.YYYY HH:mm:ss")]
                };

                let historyData3 = null;
                if (oldRepeat !== newHistoryRepeat){
                  historyData3 = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: repeat && repeat._id ? CHANGE_REPEAT : SET_REPEAT,
                    args: repeat && repeat._id ? [oldRepeat, newHistoryRepeat] : [newHistoryRepeat],
                  }
                }

                if (history.length === 0){
                  if (oldRepeat !== newHistoryRepeat){
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData1,
                        historyData2,
                        historyData3
                      ]
                    );
                  } else {
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData1,
                        historyData2
                      ]
                    );
                  }
                } else {
                  Meteor.call(
                    'history.editHistory',
                    history[0]._id,
                    historyData1
                  )
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData2
                    )
                  if (oldRepeat !== newHistoryRepeat){
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData3
                    )
                  }
                }

                if (assigned.length > 0){
                  assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                    let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                    const notificationData1 = {
                      ...historyData1,
                      args: [name, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleStartDatetime).format("D.M.YYYY HH:mm:ss")],
                      read: false,
                      taskId,
                      folderId: folder._id,
                    };
                    const notificationData2 = {
                      ...historyData2,
                      args: [name, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleEndDatetime).format("D.M.YYYY HH:mm:ss")],
                      read: false,
                      taskId,
                      folderId: folder._id,
                    };

                    let notificationData3 = null;
                    if (oldRepeat !== newHistoryRepeat){
                      notificationData3 = {
                        ...historyData3,
                        args: repeat && repeat._id ? [oldRepeat, possibleRepeat, name] : [possibleRepeat, name],
                        read: false,
                        taskId,
                        folderId: folder._id,
                      };
                    }
                   if (usersNotifications && usersNotifications.notifications.length > 0){
                     Meteor.call(
                       'notifications.editNotifications',
                        assigned._id,
                        assigned.email,
                        notificationData1,
                        dbUsers
                      );
                        Meteor.call(
                          'notifications.editNotifications',
                           assigned._id,
                           assigned.email,
                           notificationData2,
                           dbUsers
                         );
                       if (oldRepeat !== newHistoryRepeat){
                         Meteor.call(
                           'notifications.editNotifications',
                            assigned._id,
                            assigned.email,
                            notificationData3,
                            dbUsers
                          );
                      }
                    } else {
                      if (oldRepeat !== newHistoryRepeat){
                        Meteor.call(
                          'notifications.addNewNotification',
                          assigned._id,
                          assigned.email,
                          [
                            notificationData1,
                            notificationData2,
                            notificationData3
                           ],
                           dbUsers
                         );
                    } else {
                      Meteor.call(
                        'notifications.addNewNotification',
                        assigned._id,
                        assigned.email,
                        [
                          notificationData1,
                          notificationData2
                         ],
                         dbUsers
                       );
                    }
                    }
                  })
                }
              }
              setOpenDatetime(false);
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      </section>
        </DatetimePicker>
      </div>
        }


      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="hours"
            src={ClockIcon}
            alt="Clock icon not found"
            />
        </span>
        <Input
          type="number"
          name="hours"
          id="hours"
          placeholder={closed ? translations[language].unset : translations[language].hours}
          value={hours}
          disabled={closed}
          onChange={(e) => {
            const oldHours = hours;
            setHours(e.target.value);
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  hours: e.target.value
                }
              );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: oldHours ? CHANGE_HOURS : SET_HOURS,
                args: oldHours ? [oldHours, e.target.value] : [e.target.value],
              }
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }

              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );

                  const notificationData = {
                    ...historyData,
                    args: oldHours ? [name, oldHours, e.target.value] : [name, e.target.value],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }
          }}
          />
      </section>


      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="description"
            src={TextIcon}
            alt="Text icon not found"
            />
        </span>
        <Textarea
          type="text"
          placeholder={closed ? translations[language].noDescription : translations[language].writeDescription}
          value={newDescription ? newDescription : description}
          disabled={closed}
          onFocus={() => {
            setDescriptionInFocus(true);
          }}
          onChange={(e) => {
            setNewDescription(e.target.value);
          }}
          onBlur={() => {
            if ( !addNewTask) {
              const oldDesc = description;
              timeout  = setTimeout(() => {
                if (newDescription){
                  setDescription(newDescription);
                    Meteor.call(
                      'tasks.updateSimpleAttribute',
                      taskId,
                      {
                        description: newDescription
                      }
                    );
                  setDescriptionInFocus(false);
                  const historyData = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: DESCRIPTION,
                    args: [newDescription],
                  };
                  if (history.length === 0){
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData
                      ]
                    );
                  } else {
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData
                    )
                  }
                  if (assigned.length > 0){
                    assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                      let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                      const notificationData = {
                        ...historyData,
                        args: [name],
                        read: false,
                        taskId,
                        folderId: folder._id,
                      };
                     if (usersNotifications.notifications.length > 0){
                       Meteor.call(
                         'notifications.editNotifications',
                          assigned._id,
                          assigned.email,
                          notificationData,
                          dbUsers
                        );
                      } else {
                        Meteor.call(
                          'notifications.addNewNotification',
                          assigned._id,
                          assigned.email,
                          [
                            notificationData
                           ],
                           dbUsers
                         );
                      }
                    })
                  }
                }
              }, 1500);
            }
          }}
          />
      </section>
      {
        !addNewTask &&
        descriptionInFocus &&
        <ButtonRow>
          <LinkButton
            style={{marginLeft: "auto", marginRight: "0.6em"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              clearTimeout(timeout);
              setNewDescription("");
              setDescriptionInFocus(false);
            }}
            >
            <img
              className="icon"
              style={{width: "1.6em", margin: "0em"}}
              src={CloseIcon}
              alt="CloseIcon icon not found"
              />
          </LinkButton>
          <FullButton
            colour=""
            style={{marginRight: "0px", width: "100px", paddingLeft: "0px"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              const oldDesc = description;
              clearTimeout(timeout);
              setDescription(newDescription);
                Meteor.call(
                  'tasks.updateSimpleAttribute',
                  taskId,
                  {
                    description: newDescription
                  }
                );
              setDescriptionInFocus(false);
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: DESCRIPTION,
                args: [newDescription],
              };
              if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData
                  ]
                );
              } else {
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData
                )
              }
              if (assigned.length > 0){
                assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                  let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                  const notificationData = {
                    ...historyData,
                    args: [name],
                    read: false,
                    taskId,
                    folderId: folder._id,
                  };
                 if (usersNotifications.notifications.length > 0){
                   Meteor.call(
                     'notifications.editNotifications',
                      assigned._id,
                      assigned.email,
                      notificationData,
                      dbUsers
                    );
                  } else {
                    Meteor.call(
                      'notifications.addNewNotification',
                      assigned._id,
                      assigned.email,
                      [
                        notificationData
                       ],
                       dbUsers
                     );
                  }
                })
              }
            }}
            >
            <img
              className="icon"
              style={{width: "1.6em", margin: "0em"}}
              src={SendIcon}
              alt="Send icon not found"
              />
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      }

      <section  className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="files"
            src={PaperClipIcon}
            alt="PaperClip icon not found"
            />
        </span>
        <div className="files">
          {
            files.map(file => (
              <FileContainer key={file.dateCreated}>
                <a href={file.data} download={file.name}>{file.name}</a>
                <LinkButton
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    if ( !addNewTask ) {
                      const oldFile = file;
                        Meteor.call(
                          'tasks.updateSimpleAttribute',
                          taskId,
                          {
                            files: files.filter(f => f.dateCreated !== file.dateCreated)
                          }
                        );
                      const historyData = {
                        dateCreated: moment().unix(),
                        user: userId,
                        type: REMOVE_FILE,
                        args: [oldFile.name],
                      };
                      if (history.length === 0){
                        Meteor.call(
                          'history.addNewHistory',
                          taskId,
                          [
                            historyData
                          ]
                        );
                      } else {
                        Meteor.call(
                          'history.editHistory',
                          history[0]._id,
                          historyData
                        )
                      }
                      if (assigned.length > 0){
                        assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                          let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                          const notificationData = {
                            ...historyData,
                            args: [oldFile.name, name],
                            read: false,
                            taskId,
                            folderId: folder._id,
                          };
                         if (usersNotifications.notifications.length > 0){
                           Meteor.call(
                             'notifications.editNotifications',
                              assigned._id,
                              assigned.email,
                              notificationData,
                              dbUsers
                            );
                          } else {
                            Meteor.call(
                              'notifications.addNewNotification',
                              assigned._id,
                              assigned.email,
                              [
                                notificationData
                               ],
                               dbUsers
                             );
                          }
                        })
                      }
                    }
                  }}
                  className="connected-btn"
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </FileContainer>
            ))
          }
          {
            showSpinner &&
            <Spinner color="primary" size="1em" className="spinner" children=""/>
          }
          {
            closed &&
            <span className={"datetime-span" + (closed ? " closed" : "")} >
              <span>
                {translations[language].noFiles}
              </span>
            </span>
          }
          {
            !closed &&
          <Input
            id="files"
            name="files"
            type="file"
            disabled={closed}
            onChange={(e) =>  {
              e.persist();
              var file = e.target.files[0];
              setShowSpinner(true);
              if (!file) return;
              var reader = new FileReader();
              reader.onload = e => {
                var newFile = {
                  dateCreated: moment().unix(),
                  name: file.name,
                  data: reader.result
                };
                setShowSpinner(false);
                if ( !addNewTask ) {
                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    taskId,
                    {
                      files: [...files, newFile]
                    }
                  );
                  const historyData = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: ADD_FILE,
                    args: [newFile.name]
                  };
                  if (history.length === 0){
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData
                      ]
                    );
                  } else {
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData
                    )
                  }
                  if (assigned.length > 0){
                    assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                      let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                      const notificationData = {
                        ...historyData,
                        args: [newFile.name, name],
                        read: false,
                        taskId,
                        folderId: folder._id,
                      };
                     if (usersNotifications.notifications.length > 0){
                       Meteor.call(
                         'notifications.editNotifications',
                          assigned._id,
                          assigned.email,
                          notificationData,
                          dbUsers
                        );
                      } else {
                        Meteor.call(
                          'notifications.addNewNotification',
                          assigned._id,
                          assigned.email,
                          [
                            notificationData
                           ],
                           dbUsers
                         );
                      }
                    })
                  }
                } else {
                  setFiles([...files, newFile]);
                }
              };
              reader.readAsDataURL(file);
            }}
            />
        }
        </div>
      </section>


      </div>

      <section className="subtasks">
        <label htmlFor="subtasks">{translations[language].subtasks}</label>

        <List style={{height: "auto"}}>
          {
            displayedSubtasks.length > 0 &&
            displayedSubtasks.map((subtask) => (
              <ItemContainer
                style={{padding: "0px", margin: "0px"}}
                key={subtask._id ? subtask._id : subtask.dateCreated}
                >
                <Input
                  id={`subtask_closed ${subtask._id}`}
                  type="checkbox"
                  disabled={closed}
                  checked={subtask.closed}
                  onChange={() =>  {
                    const oldClosed = subtask.closed;
                    editSubtask(subtask._id, subtask.name, !subtask.closed, subtask.task, subtask.dateCreated);
                    const historyData = {
                      dateCreated: moment().unix(),
                      user: userId,
                      type: oldClosed ? SUBTASK_OPENED : SUBTASK_CLOSED,
                      args: [subtask.name],
                    };
                    if (history.length === 0){
                      Meteor.call(
                        'history.addNewHistory',
                        taskId,
                        [
                          historyData
                        ]
                      );
                    } else {
                      Meteor.call(
                        'history.editHistory',
                        history[0]._id,
                        historyData
                      )
                    }
                    if (assigned.length > 0){
                      assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                        let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                        const notificationData = {
                          ...historyData,
                          args: [subtask.name, name],
                          read: false,
                          taskId,
                          folderId: folder._id,
                        };
                       if (usersNotifications.notifications.length > 0){
                         Meteor.call(
                           'notifications.editNotifications',
                            assigned._id,
                            assigned.email,
                            notificationData,
                            dbUsers
                          );
                        } else {
                          Meteor.call(
                            'notifications.addNewNotification',
                            assigned._id,
                            assigned.email,
                            [
                              notificationData
                             ],
                             dbUsers
                           );
                        }
                      })
                    }
                  }
                }
                  />
                <HiddenInput
                  id={`subtask_name ${subtask._id}`}
                  type="text"
                  disabled={closed}
                  value={editedSubtask === subtask._id ? possibleSubtaskName : subtask.name}
                  onFocus={() => {
                    setEditedSubtask(subtask._id);
                    setPossibleSubtaskName(subtask.name);
                  }}
                  onChange={(e) => {
                    setPossibleSubtaskName(e.target.value);
                  }}
                  onBlur={() => {
                    timeout  = setTimeout(() => {
                              setEditedSubtask(null);
                              setPossibleSubtaskName("");
                    }, 300);
                  }}
                  />

                <LinkButton
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    if (editedSubtask === subtask._id){
                      setPossibleSubtaskName("");
                      setEditedSubtask(null);
                    } else {
                      const oldName = subtask.name;
                      Meteor.call('subtasks.removeSubtask', subtask._id);
                      const historyData =  {
                        dateCreated: moment().unix(),
                        user: userId,
                        type: REMOVE_SUBTASK,
                        args: [oldName],
                      };
                      if (history.length === 0){
                        Meteor.call(
                          'history.addNewHistory',
                          taskId,
                          [
                            historyData
                          ]
                        );
                      } else {
                        Meteor.call(
                          'history.editHistory',
                          history[0]._id,
                          historyData
                        )
                      }
                      if (assigned.length > 0){
                        assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                          let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                          const notificationData = {
                            ...historyData,
                            args: [oldName, name],
                            read: false,
                            taskId,
                            folderId: folder._id,
                          };
                          if (usersNotifications.notifications.length > 0){
                            Meteor.call(
                              'notifications.editNotifications',
                               assigned._id,
                               assigned.email,
                               notificationData,
                               dbUsers
                             );
                          } else {
                            Meteor.call(
                              'notifications.addNewNotification',
                              assigned._id,
                              assigned.email,
                              [
                                notificationData
                               ],
                               dbUsers
                             );
                          }
                        })
                      }
                    }
                  }}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>

                {
                  !addNewTask &&
                  editedSubtask === subtask._id &&
                <LinkButton
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    const oldName = subtask.name;
                    const newName = possibleSubtaskName;
                    Meteor.call('subtasks.editSubtask', subtask._id, possibleSubtaskName, subtask.closed, subtask.task, subtask.dateCreated);
                    setPossibleSubtaskName("");
                    setEditedSubtask(null);
                    const historyData = {
                      dateCreated: moment().unix(),
                      user: userId,
                      type: RENAME_SUBTASK,
                      args: [oldName, newName],
                    };
                    if (history.length === 0){
                      Meteor.call(
                        'history.addNewHistory',
                        taskId,
                        [
                          historyData
                        ]
                      );
                    } else {
                      Meteor.call(
                        'history.editHistory',
                        history[0]._id,
                        historyData
                      )
                    }
                    if (assigned.length > 0){
                      assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                        let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                        const notificationData = {
                          ...historyData,
                          args: [oldName, name, newName],
                          read: false,
                          taskId,
                          folderId: folder._id,
                        };
                       if (usersNotifications.notifications.length > 0){
                         Meteor.call(
                           'notifications.editNotifications',
                            assigned._id,
                            assigned.email,
                            notificationData,
                            dbUsers
                          );
                        } else {
                          Meteor.call(
                            'notifications.addNewNotification',
                            assigned._id,
                            assigned.email,
                            [
                              notificationData
                             ],
                             dbUsers
                           );
                        }
                      })
                    }
                  }}
                  >
                  <img
                    className="icon"
                    src={SendIcon}
                    alt="SendIcon icon not found"
                    />
                </LinkButton>
              }

              </ItemContainer>
            ))
          }
          {
            closed &&
            <span className={"datetime-span" + (closed ? " closed" : "")} >
              <span>
                {translations[language].noSubtasks}
              </span>
            </span>
          }
          {
            !closed &&
            !openNewSubtask &&
            <InlineInput style={{padding: "0px"}}>
              <LinkButton
              disabled={closed}
                 onClick={(e) => {e.preventDefault(); setOpenNewSubtask(true);}}
                 >
                <img
                  className="icon"
                  style={{marginLeft: "0px", marginRight: "0.8em", height: "1.3em"}}
                  src={PlusIcon}
                  alt="Plus icon not found"
                  />
                {translations[language].subtask}
              </LinkButton>
            </InlineInput>
          }

          {
            openNewSubtask &&
            <InlineInput
              style={{padding: "0px"}}
              >
              <input
                id={`add-task`}
                type="text"
                placeholder={translations[language].newTask}
                disabled={closed}
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                />
              <LinkButton
                disabled={closed}
                onClick={(e) => {e.preventDefault(); setOpenNewSubtask(false);}}
                className="connected-btn"
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>

              <LinkButton
                disabled={closed}
                onClick={(e) => {
                  e.preventDefault();
                  if (!addNewTask){
                    const dateCreated = moment().unix();
                    Meteor.call('subtasks.addNewSubtask', newSubtaskName, false, taskId, dateCreated);
                    const historyData = {
                      dateCreated,
                      user: userId,
                      type: ADD_SUBTASK,
                      args: [newSubtaskName],
                    };
                    if (history.length === 0){
                      Meteor.call(
                        'history.addNewHistory',
                        taskId,
                        [
                          historyData
                        ]
                      );
                    } else {
                      Meteor.call(
                        'history.editHistory',
                        history[0]._id,
                        historyData
                      )
                    }
                    if (assigned.length > 0){
                      assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                        let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                        const notificationData = {
                          ...historyData,
                          args: [newSubtaskName, name],
                          read: false,
                          taskId,
                          folderId: folder._id,
                        };
                       if (usersNotifications.notifications.length > 0){
                         Meteor.call(
                           'notifications.editNotifications',
                            assigned._id,
                            assigned.email,
                            notificationData,
                            dbUsers
                          );
                        } else {
                          Meteor.call(
                            'notifications.addNewNotification',
                            assigned._id,
                            assigned.email,
                            [
                              notificationData
                             ],
                             dbUsers
                           );
                        }
                      })
                    }
                  } else{
                    setAddedSubtasks([...addedSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated: moment().unix()}]);
                  }
                  setNewSubtaskName("");
                  setOpenNewSubtask(false);
                }}
                >
                <img
                  className="icon"
                  src={SendIcon}
                  style={{marginLeft: "0px", marginRight: "0.3em", width: "1.6em"}}
                  alt="Send icon not found"
                  />
              </LinkButton>
            </InlineInput>
          }
        </List>
      </section>

      <section className="pipe">
        <LinkButton
          className={showComments ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            setShowComments(true);
          }}
          >
          {translations[language].comments}
        </LinkButton>
        |
        <LinkButton
          className={!showComments ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            setShowComments(false);
          }}
          >
          {translations[language].history}
        </LinkButton>
      </section>

      {
        showComments &&
        !addNewTask &&
        <section className="comments">
          <HiddenTextarea
            type="text"
            disabled={closed}
            id="comments"
            name="comments"
            placeholder="Write a comment"
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            />
          <ButtonRow>
            {newCommentBody.length > 0 &&
              <LinkButton
                colour="grey"
                disabled={closed}
                onClick={(e) => {
                  e.preventDefault();
                  setNewCommentBody("")
                }}
                >
                {translations[language].eraseBody}
              </LinkButton>
            }
            <LinkButton
              colour=""
              style={{marginLeft: "auto", marginRight: "0px", marginTop: "0.6em"}}
              disabled={newCommentBody.length === 0 || closed}
              onClick={(e) => {
                e.preventDefault();
                const dateCreated = moment().unix();
                Meteor.call(
                  'comments.addComment',
                  userId,
                  taskId,
                  dateCreated,
                  newCommentBody
                );
                const historyData = {
                  dateCreated,
                  user: userId,
                  type: ADD_COMMENT,
                  args: [],
                };
                if (history.length === 0){
                  Meteor.call(
                    'history.addNewHistory',
                    taskId,
                    [
                      historyData
                    ]
                  );
                } else {
                  Meteor.call(
                    'history.editHistory',
                    history[0]._id,
                    historyData
                  )
                }
                if (assigned.length > 0){
                  assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                    let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                    const notificationData = {
                      ...historyData,
                      args: [name],
                      read: false,
                      taskId,
                      folderId: folder._id,
                    };
                   if (usersNotifications.notifications.length > 0){
                     Meteor.call(
                       'notifications.editNotifications',
                        assigned._id,
                        assigned.email,
                        notificationData,
                        dbUsers
                      );
                    } else {
                      Meteor.call(
                        'notifications.addNewNotification',
                        assigned._id,
                        assigned.email,
                        [
                          notificationData
                        ],
                        dbUsers
                       );
                    }
                  })
                }
                setNewCommentBody("");
              }}
              >
              <img
                className="icon"
                style={{width: "1.6em", margin: "0em"}}
                src={SendIcon}
                alt="Send icon not found"
                />
              {translations[language].sendComment}
            </LinkButton>
          </ButtonRow>

          {
            displayedComments.length > 0 &&
            displayedComments.map(comment => (
              <CommentContainer key={comment._id ? comment._id : comment.dateCreated }>
                <div>
                  {
                    comment.author &&
                    comment.author.avatar &&
                    <img className="avatar" src={comment.author.img} alt="" />
                  }
                  {
                    comment.author &&
                    !comment.author.avatar &&
                    <img className="avatar" className="" src={UserIcon} alt="" />
                  }
                  <label className="name">
                    {`${comment.author.name} ${comment.author.surname}`}
                  </label>
                  <span className="dateCreated">{moment.unix(comment.dateCreated).add((new Date).getTimezoneOffset(), 'minutes').format("DD.MM.yyyy hh:mm")}</span>
                  {
                    comment.author._id === userId &&
                    <LinkButton
                    disabled={closed}
                      onClick={(e) => {
                        e.preventDefault();
                        setEditedComment(comment._id ? comment._id : comment.dateCreated);
                      }}
                      >
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={PencilIcon}
                        alt="Pencil icon not found"
                        />
                    </LinkButton>
                  }
                  {
                    comment.author._id === userId &&
                    <LinkButton
                    disabled={closed}
                      onClick={(e) => {
                        e.preventDefault();
                        Meteor.call(
                          'comments.removeComment',
                          comment._id
                        )
                        const historyData = {
                          dateCreated: moment().unix(),
                          user: userId,
                          type: REMOVE_COMMENT,
                          args: [],
                        };
                        if (history.length === 0){
                          Meteor.call(
                            'history.addNewHistory',
                            taskId,
                            [
                              historyData
                            ]
                          );
                        } else {
                          Meteor.call(
                            'history.editHistory',
                            history[0]._id,
                            historyData
                          )
                        }
                        if (assigned.length > 0){
                          assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                            let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                            const notificationData = {
                              ...historyData,
                              args: [name],
                              read: false,
                              taskId,
                              folderId: folder._id,
                            };
                           if (usersNotifications.notifications.length > 0){
                             Meteor.call(
                               'notifications.editNotifications',
                                assigned._id,
                                assigned.email,
                                notificationData,
                                dbUsers
                              );
                            } else {
                              Meteor.call(
                                'notifications.addNewNotification',
                                assigned._id,
                                assigned.email,
                                [
                                  notificationData
                                 ],
                                 dbUsers
                               );
                            }
                          })
                        }
                      }}
                      >
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={DeleteIcon}
                        alt="Delete icon not found"
                        />
                    </LinkButton>
                  }
                </div>
                {
                  editedComment !== comment._id &&
                  editedComment !== comment.dateCreated &&
                  <p className="body">{comment.body}</p>
                }
                {
                  (editedComment === comment._id || editedComment === comment.dateCreated) &&
                  <Textarea
                    type="text"
                    id="comments"
                    name="comments"
                    placeholder="Comment"
                    disabled={closed}
                    value={editedCommentBody.length > 0 ? editedCommentBody : comment.body}
                    onChange={(e) => {
                      setEditedCommentBody(e.target.value);
                    }}
                    />
                }
                {
                  (editedComment === comment._id || editedComment === comment.dateCreated) &&
                  <ButtonRow>
                    {
                      editedCommentBody &&
                      <LinkButton
                        colour="grey"
                        disabled={closed}
                        onClick={(e) => {
                          e.preventDefault();
                          setNewCommentBody("")
                        }}
                        >
                        {translations[language].eraseBody}
                      </LinkButton>
                    }
                    <LinkButton
                      colour=""
                      style={{marginLeft: "auto", marginRight: "0px"}}
                      disabled={editedCommentBody.length === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        Meteor.call(
                          'comments.editComment',
                          comment._id,
                          comment.author._id,
                          comment.task,
                          comment.dateCreated,
                          editedCommentBody
                        );
                        const historyData = {
                          dateCreated: moment().unix(),
                          user: userId,
                          type: EDIT_COMMENT,
                          args: [],
                        }
                        if (history.length === 0){
                          Meteor.call(
                            'history.addNewHistory',
                            taskId,
                            [
                              historyData
                            ]
                          );
                        } else {
                          Meteor.call(
                            'history.editHistory',
                            history[0]._id,
                            historyData
                          )
                        }
                        if (assigned.length > 0){
                          assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                            let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                            const notificationData = {
                              ...historyData,
                              args: [name],
                              read: false,
                              taskId,
                              folderId: folder._id,
                            };
                           if (usersNotifications.notifications.length > 0){
                             Meteor.call(
                               'notifications.editNotifications',
                                assigned._id,
                                assigned.email,
                                notificationData,
                                dbUsers
                              );
                            } else {
                              Meteor.call(
                                'notifications.addNewNotification',
                                assigned._id,
                                assigned.email,
                                [
                                  notificationData
                                 ],
                                 dbUsers
                               );
                            }
                          })
                        }
                        setEditedComment(null);
                        setEditedCommentBody("");
                      }}
                      >
                      {translations[language].save}
                      <img
                        className="icon"
                        style={{width: "1em", marginLeft: "0.3em"}}
                        src={SendIcon}
                        alt="Send icon not found"
                        />
                    </LinkButton>
                  </ButtonRow>
                }
              </CommentContainer>
            ))
          }
        </section>
      }

      {
        !showComments &&
        <section>
          {
              history.length === 0 &&
              <span>No changes have been made yet.</span>
          }
          {
            history.length > 0 &&
            mappedHistory.map(change => {
              const historyEntry = historyEntryTypes.find(entry => entry.type === change.type);
              let message = historyEntry.message[language];
              change.args.forEach((arg, i) => {
                message = message.replace(`[${i}]`, arg);
              });
              return (
              <p className="history">
                <p>{`${moment.unix(change.dateCreated).format("D.M.YYYY HH:mm:ss")}`}</p>
                <p>{`${change.user.label} ${message}`}</p>
              </p>
            )})
          }
        </section>
      }

      {
        addNewTask &&
        <ButtonCol>
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>{translations[language].cancel}</FullButton>
          <FullButton
            colour=""
            disabled={name.length === 0 || !folder}
            onClick={(e) => {
              e.preventDefault();
              addNewTask(
                name,
                important,
                assigned.map(user => user._id),
                startDatetime,
                endDatetime,
                hours,
                description,
                subtasks,
                comments,
                files,
                taskRepeat,
                repeat,
                folder._id,
                container ? container._id : 0,
                moment().unix()
              );
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonCol>
      }
    </Form>
  );
};
