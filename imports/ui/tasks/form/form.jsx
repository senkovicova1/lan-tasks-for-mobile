import React, {
  useState,
} from 'react';

import Select from 'react-select';

import moment from 'moment';

import Scheduled from './scheduled';
import Description from './description';

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
    history,
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
    folders,
    containers,
    dbUsers,
    usersWithRights,
    allSubtasks,
    onCancel,
  } = props;

  const [ showComments, setShowComments ] = useState( true );

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

      <Description
        taskId={taskId}
        assigned={assigned}
        description={description}
        setDescription={setDescription}
        history={history}
        language={language}
        addNewTask={addNewTask}
        />

      <section  className="inline">
        files
      </section>


      </div>

      <section className="subtasks">
        subtasks
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
          comments
        </section>
      }

      {
        !showComments &&
        <section>
          history
        </section>
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
              /*
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
              */
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonCol>
      }
    </Form>
  );
};
