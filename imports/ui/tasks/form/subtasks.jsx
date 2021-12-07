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
  SUBTASK_CLOSED,
  SUBTASK_OPENED,
  REMOVE_SUBTASK,
  RENAME_SUBTASK,
  ADD_SUBTASK,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function Subtasks( props ) {

  const {
    userId,
    taskId,
    displayedSubtasks,
    addedSubtasks,
    setAddedSubtasks,
    history,
    language,
    addNewTask,
    onCancel,
  } = props;

  const [ possibleSubtaskName, setPossibleSubtaskName ] = useState("");
  const [ editedSubtask, setEditedSubtask ] = useState("");
  const [ newSubtaskName, setNewSubtaskName ] = useState( "" );
  const [ openNewSubtask, setOpenNewSubtask ] = useState( false );

  const [ upToDateSubtasks, setUpToDateSubtasks ] = useState( [] );

  useEffect(() => {
    setUpToDateSubtasks(displayedSubtasks);
  }, [displayedSubtasks]);

  document.onkeydown = function( e ) {
    e = e || window.event;
    if ( e.which === 13 || e.keyCode === 13 ) {
      if ( openNewSubtask && newSubtaskName) {
        setNewSubtaskName( "" );
        setOpenNewSubtask( false );
        if (!addNewTask){
          const dateCreated = moment().unix();
          Meteor.call('subtasks.addNewSubtask', newSubtaskName, false, taskId, dateCreated);
          const historyData = {
            dateCreated: dateCreated,
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
      } else {
        upToDateSubtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
        addedSubtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
      }
    }
  }

  return (
      <section className="subtasks">
        <label htmlFor="subtasks">{translations[language].subtasks}</label>

        <List style={{height: "auto", padding: "0px"}}>
          {
            upToDateSubtasks.length > 0 &&
            upToDateSubtasks.map((subtask) => (
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
                    Meteor.call(
                      'subtasks.editSubtask',
                      subtask._id,
                      subtask.name,
                      !subtask.closed,
                      subtask.task,
                      subtask.dateCreated
                    );
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
                      setUpToDateSubtasks(upToDateSubtasks.filter(st => st._id !== subtask._id));
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
  );
};
