import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import moment from 'moment';

import Select from 'react-select';

import Switch from "react-switch";

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  removeSubtask
} from './subtasksHandlers';

import {
  removeComment
} from './commentsHandlers';

import {
  addTask,
  closeTask,
  restoreLatestTask,
  removeTask
} from './tasksHandlers';

import {
  addNewHistory
} from './historyHandlers';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import FilterSummary from '/imports/ui/filters/summary';
import EditTask from './editContainer';

import {
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  List,
  FullButton,
  ItemContainer,
  LinkButton,
  Input,
  InlineInput,
  AppliedFilter
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

export default function TaskList( props ) {

  const dispatch = useDispatch();

  const {
  match,
  history,
  folder,
  closedTasks,
  activeTasks,
  removedTasks,
  addQuickTask,
  subtasks,
  comments,
  allTasks,
} = props;

const [ showClosed, setShowClosed ] = useState( false );
const [ newTaskName, setNewTaskName ] = useState( "" );
const [ openNewTask, setOpenNewTask ] = useState( false );

const {
  folderID,
  filterID
} = match.params;
const {
  layout,
  filter,
  chosenTask
} = useSelector( ( state ) => state.metadata.value );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

document.onkeydown = function( e ) {
  e = e || window.event;
  switch ( e.which || e.keyCode ) {
    case 13:
      if ( newTaskName.length > 0 ) {
        const dateCreated = moment().unix();

        addQuickTask(
          newTaskName,
          null,
          dateCreated,
          (_id) => {
            Meteor.call(
              'history.addNewHistory',
              _id,
              [ {
                  dateCreated,
                  user: user._id,
                  message: "created this task!",
              } ]
            );
            setNewTaskName( "" );
            setOpenNewTask( false );
          },
          () => console.log( error )
         );
      }
      break;
  }
};


  return (
    <List>
      <FilterSummary
        {...props}
        />
      {
        activeTasks.length === 0 &&
        <span className="message">{translations[language].noOpenTasks}</span>
      }

      {
        chosenTask &&
        layout === PLAIN &&
        <Modal isOpen={true}>
          <ModalBody>
            <EditTask {...props} taskId={chosenTask} close={() => dispatch(setChosenTask(null))}/>
          </ModalBody>
        </Modal>
      }

      {
        folder &&
        folder._id &&
        !match.path.includes("archived") &&
        !openNewTask &&
        <InlineInput>
          <LinkButton onClick={(e) => {e.preventDefault(); setOpenNewTask(true);}}>
            <img
              className="icon"
              style={{marginLeft: "2px", marginRight: "0.8em"}}
              src={PlusIcon}
              alt="Plus icon not found"
              />
            {translations[language].task}
          </LinkButton>
        </InlineInput>
      }

      {
        folder &&
        folder._id &&
        openNewTask &&
        <InlineInput>
          <input
            id={`add-task`}
            type="text"
            placeholder="New task"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            />
          <LinkButton
            onClick={(e) => {e.preventDefault(); setOpenNewTask(false);}}
            className="connected-btn"
            >
            <img
              className="icon"
              src={CloseIcon}
              alt="Close icon not found"
              />
          </LinkButton>

          {
            newTaskName.length > 0 &&
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                const dateCreated = moment().unix();
                addQuickTask(
                  newTaskName,
                  null,
                  dateCreated,
                   (_id) => {
                     Meteor.call(
                       'history.addNewHistory',
                       _id,
                       [ {
                           dateCreated,
                           user: user._id,
                           message: "created this task!",
                       } ]
                     );
                setNewTaskName( "" );
                setOpenNewTask( false );
              },
              () => console.log( error )
            );
          }}
              >
              <img
                className="icon"
                src={SendIcon}
                alt="Send icon not found"
                />
            </LinkButton>
          }
        </InlineInput>
      }

      {
        activeTasks.map((task) => (
          <ItemContainer
            key={task._id}
            active={chosenTask && task._id === chosenTask._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              checked={task.closed}
              onChange={() => Meteor.call('tasks.closeTask', task, subtasks)}
              />
            {
              task.important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
            {
              !task.important &&
              <img
                className="icon star"
                src={EmptyStarIcon}
                alt="Empty star icon not found"
                />
            }
            <span htmlFor={`task_name ${task._id}`} onClick={() => dispatch(setChosenTask(task._id))}>
              {task.name}
            </span>
            {
              task.assigned.map(assigned => (
                <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
              ))
            }
            <LinkButton
              onClick={(e) => {e.preventDefault(); Meteor.call('tasks.removeTask', task, removedTasks, subtasks, comments, allTasks)}}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
          </ItemContainer>
        ))
      }

      <hr style={{marginTop: "7px", marginBottom: "7px"}}/>

      <ItemContainer key="commands" >
        <Switch
          id="show-closed"
          name="show-closed"
          onChange={() => setShowClosed(!showClosed)}
          checked={showClosed}
          onColor="#0078d4"
          uncheckedIcon={false}
          checkedIcon={false}
          style={{
            marginRight: "0.2em",
            display: "none"
          }}
          />
        <span htmlFor="show-closed">
          {translations[language].showClosed}
        </span>
        {
          removedTasks.length > 0 &&
          <LinkButton
            style={{marginLeft: "auto"}}
            onClick={(e) => {e.preventDefault(); Meteor.call('tasks.restoreLatestTask', removedTasks)}}
            >
            <img
              className="icon"
              src={RestoreIcon}
              alt="Back icon not found"
              />
            <span>
              {translations[language].restoreTask}
            </span>
          </LinkButton>
        }
      </ItemContainer>

      {
        showClosed &&
        closedTasks.length === 0 &&
        <span className="message">{translations[language].noClosedTasks}</span>
      }

      {
        showClosed &&
        closedTasks.map((task) => (
          <ItemContainer
            key={task._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              checked={task.closed}
              onChange={() => Meteor.call('tasks.closeTask', task, subtasks)}
              />
            {
              task.important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
            {
              !task.important &&
              <img
                className="icon star"
                src={EmptyStarIcon}
                alt="Empty star icon not found"
                />
            }
            <span htmlFor={`task_name ${task._id}`} onClick={() => dispatch(setChosenTask(task._id))}>
              {task.name}
            </span>
            {
              task.assigned.map(assigned => (
                <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
              ))
            }
            <LinkButton
              onClick={(e) => {e.preventDefault(); Meteor.call('tasks.removeTask', task, removedTasks, subtasks, comments, allTasks)}}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
          </ItemContainer>
        ))
      }

    </List>
  );
};
