import React, {
  useState,
} from 'react';

import Select from 'react-select';

import moment from 'moment';

import Scheduled from './scheduled';
import Description from './description';
import Files from './files';
import Subtasks from './subtasks';
import Comments from './comments';
import History from './history';

import {
  updateSimpleAttribute
} from '/imports/api/handlers/tasksHandlers';

import {
  EmptyStarIcon,
  FullStarIcon,
  FolderIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
  ClockIcon,
  ColumnsIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Form,
  TitleInput,
  TitleCheckbox,
  Input,
  LinkButton,
  CircledButton,
  FullButton,
  ButtonCol,
  ButtonRow,
} from "/imports/other/styles/styledComponents";

import {
  CLOSED_STATUS,
  OPEN_STATUS,
  TITLE,
  IMPORTANT,
  NOT_IMPORTANT,
  CONTAINER,
  ASSIGNED,
  SET_HOURS,
  CHANGE_HOURS,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function TaskForm( props ) {

  const {
    userId,
    language,
    addNewTask,
    wholeTask,
    taskId,
    closed,
    setClosed,
    name,
    setName,
    important,
    setImportant,
    folder,
    setFolder,
    container,
    setContainer,
    defaultContainer,
    assigned,
    setAssigned,
    hours,
    setHours,
    description,
    setDescription,
    files,
    setFiles,
    displayedSubtasks,
    addedSubtasks,
    setAddedSubtasks,
    displayedComments,
    comments,
    setComments,
    mappedHistory,
    history,
    folders,
    notifications,
    containers,
    dbUsers,
    usersWithRights,
    allSubtasks,
    onCancel,
  } = props;

  const [ showComments, setShowComments ] = useState( true );
  const [ newTitle, setNewTitle ] = useState( "" );
  const [ titleInFocus, setTitleInFocus ] = useState( false );

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


      <section>
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
                  wholeTask,
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
          value={newTitle && !addNewTask ? newTitle : name}
          disabled={closed}
          onFocus={() => {
            setTitleInFocus(true);
          }}
          onChange={(e) => {
            if (addNewTask){
              setName(e.target.value);
            } else {
              setNewTitle(e.target.value);
            }
          }}
          onBlur={() => {
          /*  if ( !addNewTask) {
              const oldName = name;
              timeout  = setTimeout(() => {
                if (newTitle){
                  setName(newTitle);
                  setTitleInFocus(false);
                    updateSimpleAttribute(
                      taskId,
                      userId,
                      "name",
                      newTitle,
                      oldName,
                      TITLE,
                      name,
                      history,
                      assigned,
                      folder._id,
                      notifications,
                      dbUsers
                    );
                }
              }, 500);
            }
            */
          }}
          />
      </section>
      {
        !addNewTask &&
        titleInFocus &&
        <ButtonRow>
          <LinkButton
            style={{marginLeft: "auto", marginRight: "0.6em"}}
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();
              setNewTitle("");
              setTitleInFocus(false);
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
              const oldName = name;
              setName(newTitle);
              if ( !addNewTask ) {
                Meteor.call(
                  'tasks.updateSimpleAttribute',
                  taskId,
                  {
                    name: newTitle
                  }
                );
                const historyData = {
                  dateCreated: moment().unix(),
                  user: userId,
                  type: TITLE,
                  args: [oldName, newTitle],
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
                      args: [oldName, newTitle],
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
              style={{width: "1.6em", margin: "0em"}}
              src={SendIcon}
              alt="Send icon not found"
              />
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      }
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
          value={container ? container : defaultContainer}
          onChange={(e) => {
            const oldContainer = container ? container : defaultContainer;
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

      <Scheduled
        userId={userId}
        taskId={taskId}
        allDay={props.allDay}
        setAllDay={props.setAllDay}
        startDatetime={props.startDatetime}
        setStartDatetime={props.setStartDatetime}
        possibleStartDatetime={props.possibleStartDatetime}
        setPossibleStartDatetime={props.setPossibleStartDatetime}
        endDatetime={props.endDatetime}
        setEndDatetime={props.setEndDatetime}
        possibleEndDatetime={props.possibleEndDatetime}
        setPossibleEndDatetime={props.setPossibleEndDatetime}
        repeat={props.repeat}
        setRepeat={props.setRepeat}
        possibleRepeat={props.possibleRepeat}
        setPossibleRepeat={props.setPossibleRepeat}
        editRepeatInTask={props.editRepeatInTask}
        allTasks={props.allTasks}
        history={history}
        language={language}
        addNewTask={addNewTask}
        openDatetime={props.openDatetime}
        setOpenDatetime={props.setOpenDatetime}
        />

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
            setHours(e.target.value);
          }}
          onBlur={() => {
            if ( !addNewTask ) {
              Meteor.call(
                'tasks.updateSimpleAttribute',
                taskId,
                {
                  hours: hours
                }
              );
              const historyData = {
                dateCreated: moment().unix(),
                user: userId,
                type: SET_HOURS,
                args: [hours],
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
                    args: [name, hours],
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

      <Description
        userId={userId}
        taskId={taskId}
        assigned={assigned}
        description={description}
        setDescription={setDescription}
        history={history}
        language={language}
        addNewTask={addNewTask}
        />

      <Files
          userId={userId}
          taskId={taskId}
          files={files}
          setFiles={setFiles}
          history={history}
          language={language}
          addNewTask={addNewTask}
          />


        <Subtasks
            userId={userId}
            taskId={taskId}
            displayedSubtasks={displayedSubtasks}
            addedSubtasks={addedSubtasks}
            setAddedSubtasks={setAddedSubtasks}
            history={history}
            language={language}
            addNewTask={addNewTask}
            />
      </div>

      {
        !addNewTask &&
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
    }

      {
        showComments &&
        !addNewTask &&
        <Comments
            userId={userId}
            taskId={taskId}
            displayedComments={displayedComments}
            comments={comments}
            setComments={setComments}
            history={history}
            language={language}
            addNewTask={addNewTask}
            />
      }

      {
        !showComments &&
        <History
            mappedHistory={mappedHistory}
            history={history}
            language={language}
            />
      }

      {
        addNewTask &&
        <ButtonCol>
          <FullButton
            colour="grey"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            >
            {translations[language].cancel}
          </FullButton>
          <FullButton
            colour=""
            disabled={name.length === 0 || !folder}
            onClick={(e) => {
              e.preventDefault();
              addNewTask(
                name,
                important,
                assigned.map(user => user._id),
                props.startDatetime,
                props.endDatetime,
                hours,
                description,
                props.addedSubtasks,
                props.comments,
                files,
                {},
                props.repeat,
                folder._id,
                container ? container._id : 0,
                moment().unix(),
                onCancel
              )
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonCol>
      }
    </Form>
  );
};
