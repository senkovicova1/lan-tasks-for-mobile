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
  writeHistoryAndSendNotifications,
} from '/imports/api/handlers/tasksHandlers';

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
    closed,
    displayedSubtasks,
    addedSubtasks,
    setAddedSubtasks,
    folder,
    dbUsers,
    notifications,
    history,
    language,
    addNewTask,
    onCancel,
    subtasksLoading,
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
        e.preventDefault();
        setOpenNewSubtask( false );
        if (!addNewTask){
          const dateCreated = moment().unix();
          setUpToDateSubtasks([...upToDateSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated} ]);

          Meteor.call('subtasks.addNewSubtask', newSubtaskName, false, taskId, dateCreated);

          writeHistoryAndSendNotifications(
            userId,
            taskId,
            [ADD_SUBTASK],
            [[newSubtaskName]],
            history,
            assigned,
            notifications,
            [[newSubtaskName, name]],
            folder._id,
            dbUsers,
          );

        } else{
          setAddedSubtasks([...addedSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated: moment().unix()}]);
        }
        setNewSubtaskName( "" );
      } else if (editedSubtask && !addNewTask){
        e.preventDefault();

        let newSubtasks = [...upToDateSubtasks];
        let subtask = upToDateSubtasks.find(st => st._id === editedSubtask ||  st.dateCreated === editedSubtask);
        newSubtasks = newSubtasks.map(st => {
          if ( (!st._id && st.dateCreated === editedSubtask) ||
          (st._id === subtask._id) ){
            return ({
              ...st,
              name: possibleSubtaskName,
            });
          }
          return st;
        });
        setUpToDateSubtasks(newSubtasks);

        const oldName = subtask.name;
        const newName = possibleSubtaskName;

        Meteor.call('subtasks.editSubtask', subtask._id, possibleSubtaskName, subtask.closed, subtask.task, subtask.dateCreated);

       setPossibleSubtaskName("");
        setEditedSubtask(null);

        writeHistoryAndSendNotifications(
          userId,
          taskId,
          [RENAME_SUBTASK],
          [[oldName, newName]],
          history,
          assigned,
          notifications,
          [[oldName, name, newName]],
          folder._id,
          dbUsers,
        );

        upToDateSubtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );
        addedSubtasks.forEach( ( subtask, i ) => {
          document.getElementById( `subtask_name ${subtask._id}` ).blur();
        } );

      } else {

        setEditedSubtask(null);
        setPossibleSubtaskName("");
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

      {
        !addNewTask &&
        subtasksLoading &&
        <Spinner color="primary" size="1em" className="spinner" children=""/>
      }

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

                    let newSubtasks = [...upToDateSubtasks];
                    newSubtasks = newSubtasks.map(st => {
                      if ( (!st._id && st.dateCreated === subtask.dateCreated) ||
                      (st._id === subtask._id) ){
                        return ({
                          ...st,
                          closed: !subtask.closed,
                        });
                      }
                      return st;
                    })
                    setUpToDateSubtasks(newSubtasks);

                    const oldClosed = subtask.closed;
                    Meteor.call(
                      'subtasks.editSubtask',
                      subtask._id,
                      subtask.name,
                      !subtask.closed,
                      subtask.task,
                      subtask.dateCreated
                    );

                    writeHistoryAndSendNotifications(
                      userId,
                      taskId,
                      [oldClosed ? SUBTASK_OPENED : SUBTASK_CLOSED],
                      [[subtask.name]],
                      history,
                      assigned,
                      notifications,
                      [[subtask.name, name]],
                      folder._id,
                      dbUsers,
                    );

                  }
                }
                  />
                <HiddenInput
                  id={`subtask_name ${subtask._id}`}
                  type="text"
                  disabled={closed}
                  value={editedSubtask === subtask._id ? possibleSubtaskName : subtask.name}
                  onFocus={() => {
                    setEditedSubtask(subtask._id ? subtask._id : subtask.dateCreated);
                    setPossibleSubtaskName(subtask.name);
                  }}
                  onChange={(e) => {
                    setPossibleSubtaskName(e.target.value);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
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

                      writeHistoryAndSendNotifications(
                        userId,
                        taskId,
                        [REMOVE_SUBTASK],
                        [[oldName]],
                        history,
                        assigned,
                        notifications,
                        [[oldName, name]],
                        folder._id,
                        dbUsers,
                      );

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

                      let newSubtasks = [...upToDateSubtasks];
                      newSubtasks = newSubtasks.map(st => {
                        if ( (!st._id && st.dateCreated === subtask.dateCreated) ||
                        (st._id === subtask._id) ){
                          return ({
                            ...st,
                            name: possibleSubtaskName,
                          });
                        }
                        return st;
                      });
                      setUpToDateSubtasks(newSubtasks);

                    const oldName = subtask.name;
                    const newName = possibleSubtaskName;

                    Meteor.call('subtasks.editSubtask', subtask._id, possibleSubtaskName, subtask.closed, subtask.task, subtask.dateCreated);

                    setPossibleSubtaskName("");
                    setEditedSubtask(null);

                    writeHistoryAndSendNotifications(
                      userId,
                      taskId,
                      [RENAME_SUBTASK],
                      [[oldName, newName]],
                      history,
                      assigned,
                      notifications,
                      [[oldName, name, newName]],
                      folder._id,
                      dbUsers,
                    );

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

                    setUpToDateSubtasks([...upToDateSubtasks, {change: ADDED, name: newSubtaskName, closed: false, dateCreated} ]);

                    Meteor.call('subtasks.addNewSubtask', newSubtaskName, false, taskId, dateCreated);

                    writeHistoryAndSendNotifications(
                      userId,
                      taskId,
                      [ADD_SUBTASK],
                      [[newSubtaskName]],
                      history,
                      assigned,
                      notifications,
                      [[newSubtaskName, name]],
                      folder._id,
                      dbUsers,
                    );

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
