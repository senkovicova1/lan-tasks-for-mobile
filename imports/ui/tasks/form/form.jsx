import React, {
  useEffect,
  useState,
} from 'react';

import Select from 'react-select';

import moment from 'moment';

import {
  Spinner
} from 'reactstrap';

import Scheduled from './scheduled';
import Description from './description';
import Files from './files';
import Subtasks from './subtasks';
import Comments from './comments';
import History from './history';

import {
  updateSimpleAttribute,
  writeHistoryAndSendNotifications,
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
    subtasksLoading,
    commentsLoading,
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
  const [ saveInterval, setSaveInterval ] = useState(null);

  useEffect(() => {
    setNewTitle(name);
  }, [name]);

  useEffect(() => {
    window.addEventListener('beforeunload', eventFunction);
    return () => {
      window.removeEventListener('beforeunload', eventFunction);
    }
  }, []);

  function eventFunction(e){
    e.preventDefault();
    e.returnValue = "Are you sure you want to exit?";
    saveUnsavedData();
  }

  const saveUnsavedData = () => {
    if (name !== newTitle){
      const oldName = name;
        Meteor.call(
          'tasks.updateSimpleAttribute',
          taskId,
          {
            name: newTitle
          }
        );
        writeHistoryAndSendNotifications(
          userId,
          taskId,
          [TITLE],
          [[oldName, newTitle]],
          history,
          assigned,
          notifications,
          [[oldName, newTitle]],
          folder._id,
          dbUsers,
        );
    }
  }

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

              writeHistoryAndSendNotifications(
                userId,
                taskId,
                [newClosed ? CLOSED_STATUS : OPEN_STATUS],
                [[]],
                history,
                assigned,
                notifications,
                [[name]],
                folder._id,
                dbUsers,
              );
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
          onBlur={(e) => {
            if (!addNewTask){
              saveUnsavedData();
            }
          }}
          />
      </section>
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
              writeHistoryAndSendNotifications(
                userId,
                taskId,
                [newImportant ? IMPORTANT : NOT_IMPORTANT],
                [[]],
                history,
                assigned,
                notifications,
                [[name]],
                folder._id,
                dbUsers,
              );
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

              writeHistoryAndSendNotifications(
                userId,
                taskId,
                [CONTAINER],
                [[oldContainer.label, e.label]],
                history,
                assigned,
                notifications,
                [[name, oldContainer.label, e.label]],
                folder._id,
                dbUsers,
              );

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

                writeHistoryAndSendNotifications(
                  userId,
                  taskId,
                  [ASSIGNED],
                  [[oldAssigned.map(user => user.label).join(", "), e.map(user => user.label).join(", ")]],
                  history,
                  assigned,
                  notifications,
                  [[name, oldAssigned.map(user => user.label).join(", "), e.map(user => user.label).join(", ")]],
                  folder._id,
                  dbUsers,
                );

            }
            }}
            options={usersWithRights}
            />
        </div>
      </section>

      <Scheduled
        userId={userId}
        closed={closed}
        taskId={taskId}
        folder={folder}
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
        dbUsers={dbUsers}
        history={history}
        notifications={notifications}
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

              writeHistoryAndSendNotifications(
                userId,
                taskId,
                [SET_HOURS],
                [[hours]],
                history,
                assigned,
                notifications,
                [[name, hours]],
                folder._id,
                dbUsers,
              );

            }
          }}
          />
      </section>

      <Description
        userId={userId}
        closed={closed}
        taskId={taskId}
        assigned={assigned}
        description={description}
        setDescription={setDescription}
        folder={folder}
        dbUsers={dbUsers}
        notifications={notifications}
        history={history}
        language={language}
        addNewTask={addNewTask}
        />

      <Files
          userId={userId}
          taskId={taskId}
          files={files}
          setFiles={setFiles}
          folder={folder}
          dbUsers={dbUsers}
          notifications={notifications}
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
            folder={folder}
            dbUsers={dbUsers}
            notifications={notifications}
            history={history}
            language={language}
            addNewTask={addNewTask}
            subtasksLoading={subtasksLoading}
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
          {
            commentsLoading &&
            <Spinner color="primary" size="1em" className="spinner" children="" style={{marginLeft: "0.6em"}}/>
          }
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
            closed={closed}
            taskId={taskId}
            displayedComments={displayedComments}
            comments={comments}
            setComments={setComments}
            folder={folder}
            dbUsers={dbUsers}
            notifications={notifications}
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
