import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
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

import EditTask from './editContainer';

import {
  setFilter
} from '/imports/redux/metadataSlice';

import {
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  SettingsIcon,
  UserIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  AsteriskIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  List,
  ItemContainer,
  LinkButton,
  Input,
  InlineInput,
  FloatingButton,
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
  setParentChosenTask,
  chosenTask
} = props;

const [ showClosed, setShowClosed ] = useState( false );
const [ newTaskName, setNewTaskName ] = useState( "" );
const [ openNewTask, setOpenNewTask ] = useState( false );

const {
  folderID
} = match.params;
const {
  layout,
  search,
  sortBy,
  sortDirection,
  filter
} = useSelector( ( state ) => state.metadata.value );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

const dbUsers = useSelector( ( state ) => state.users.value );
const tasks = useSelector( ( state ) => state.tasks.value );
const subtasks = useSelector( ( state ) => state.subtasks.value );
const comments = useSelector( ( state ) => state.comments.value );

const removedTasks = useMemo( () => {
  if ( folder._id ) {
    return tasks.filter( t => t.folder._id === folder._id && t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
  }
  return tasks.filter( t => t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
}, [ tasks, folder._id ] );

const addQuickTask = () => {
  addTask(
    newTaskName,
    userId,
    folderID,
    moment().unix(),
    () => {
      setNewTaskName( "" );
      setOpenNewTask( false );
    },
    () => console.log( error )
  );
}

const filteredTasks = useMemo( () => {
  return tasks.filter( task => !task.removedDate && ( task.folder._id === folder.value || (folder.value === "important" && task.important) || ( "all" === folder.value && task.assigned && task.assigned._id === userId ) ) );
}, [ tasks, folder, userId ] );

const searchedTasks = useMemo( () => {
  return filteredTasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
}, [ search, filteredTasks ] );

const tasksWithAdvancedFilters = useMemo( () => {
  const folderIds = filter.folders.map(folder => folder._id);
  const filteredByFolders = ["all", "important"].includes(folderID) ? searchedTasks.filter( task => filter.folders.length === 0 || folderIds.includes(task.folder._id)) : searchedTasks;
  const filteredByImportant = filteredByFolders.filter(task => !filter.important || task.important);
  const assignedIds = filter.assigned.map(user => user._id);
  const filteredByAssigned = filteredByImportant.filter(task => filter.assigned.length === 0 || assignedIds.includes(task.assigned._id));
  const filteredByDeadlines = (filter.deadlineMin || filter.deadlineMax) ? filteredByAssigned.filter(task => task.deadline && (!filter.deadlineMin || filter.deadlineMin <= task.deadline) && (!filter.deadlineMax || task.deadline <= filter.deadlineMax)) : filteredByAssigned;
  const filteredByDateCreated = filteredByDeadlines.filter(task => (!filter.dateCreatedMin || filter.dateCreatedMin <= task.dateCreated) && (!filter.dateCreatedMax || task.dateCreated <= filter.dateCreatedMax));
  return filteredByDateCreated;
}, [ filter, searchedTasks, folderID ] );

const sortedTasks = useMemo( () => {
  const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
  return tasksWithAdvancedFilters
    .sort( ( t1, t2 ) => {
      if ( sortBy === "assigned" ) {
        return t1.assigned.label.toLowerCase() < t2.assigned.label.toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
      }
      if ( sortBy === "date" ) {
        return t1.dateCreated < t2.dateCreated ? 1 * multiplier : ( -1 ) * multiplier;
      }
      if ( sortBy === "important" ) {
        return t1.important ? 1 * multiplier : ( -1 ) * multiplier;
      }
      return t1.name.toLowerCase() < t2.name.toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
    } );
}, [ tasksWithAdvancedFilters, sortBy, sortDirection ] );

const activeTasks = useMemo( () => {
  return sortedTasks.filter( task => !task.closed );
}, [ sortedTasks, sortBy, sortDirection ] );

const closedTasks = useMemo( () => {
  if ( showClosed ) {
    return sortedTasks.filter( task => task.closed );
  }
  return [];
}, [ sortedTasks, showClosed, sortBy, sortDirection ] );

document.onkeydown = function( e ) {
  e = e || window.event;
  switch ( e.which || e.keyCode ) {
    case 13:
      if ( newTaskName.length > 0 ) {
        addQuickTask();
      }
      break;
  }
};

  const numberOfFilters = useMemo(() => {
    return ((["all", "important"].includes(folderID) && filter.folders.length > 0) ? 1 : 0) +
              (filter.important ? 1 : 0) +
              (filter.assigned.length > 0 ? 1 : 0) +
              (filter.deadlineMin ? 1 : 0) +
              (filter.deadlineMax ? 1 : 0) +
              (filter.dateCreatedMin ? 1 : 0) +
              (filter.dateCreatedMax ? 1 : 0);
  }, [filter]);

  return (
    <List>
      {
        numberOfFilters > 0 &&
      <AppliedFilter>
        {
          ["all", "important"].includes(folderID) &&
          filter.folders.length > 0 &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={FolderIcon}
              alt="FolderIcon icon not found"
              />
            <label>{filter.folders.map(folder => folder.name).join(", ")}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, folders: []}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          filter.important &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={EmptyStarIcon}
              alt="EmptyStarIcon icon not found"
              />
            <label>Important</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, important: false}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          filter.assigned.length > 0 &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={UserIcon}
              alt="UserIcon icon not found"
              />
            <label>{filter.assigned.map(user => user.label).join(", ")}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, assigned: []}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          (filter.deadlineMin || filter.deadlineMax)  &&
          <section className="filter">
            <div className="filter-container">
            <img
              className="label-icon"
              src={CalendarIcon}
              alt="CalendarIcon icon not found"
              />
            <label>{`${filter.deadlineMin ? moment.unix(filter.deadlineMin).format("D.M.YYYY HH:mm:ss") : "No start date"} - ${filter.deadlineMax ? moment.unix(filter.deadlineMax).format("D.M.YYYY HH:mm:ss") : "No end date"}`}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, deadlineMin: "", deadlineMax: ""}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }
        {
          (filter.dateCreatedMin || filter.dateCreatedMax)  &&
          <section className="filter">
            <div className="filter-container">
            <img
              style={{width: "auto"}}
              className="label-icon"
              src={AsteriskIcon}
              alt="AsteriskIcon icon not found"
              />
            <label>{`${filter.dateCreatedMin ? moment.unix(filter.dateCreatedMin).format("D.M.YYYY HH:mm:ss") : "No start date"} - ${filter.dateCreatedMax ? moment.unix(filter.dateCreatedMax).format("D.M.YYYY HH:mm:ss") : "No end date"}`}</label>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setFilter({...filter, dateCreatedMin: "", dateCreatedMax: ""}));
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
          </div>
          </section>
        }

        {
          numberOfFilters >= 2 &&
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(setFilter({
                folders: [],
                important: false,
                deadlineMin: "",
                deadlineMax: "",
                assigned: [],
                dateCreatedMin: "",
                dateCreatedMax: "",
              }));
            }}
            >
            Remove all filters
          </LinkButton>
        }
      </AppliedFilter>
    }

      {
        activeTasks.length === 0 &&
        <span className="message">You have no open tasks.</span>
      }

      {
        chosenTask &&
        layout === PLAIN &&
        <Modal isOpen={true}>
          <ModalBody>
            <EditTask {...props} taskId={chosenTask} close={() => setParentChosenTask(null)}/>
          </ModalBody>
        </Modal>
      }

      {
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
            Task
          </LinkButton>
        </InlineInput>
      }

      {
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
              onClick={(e) => {e.preventDefault(); addQuickTask();}}
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
              onChange={() => closeTask(task)}
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
            <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
              {task.name}
            </span>
            {
              task.assigned &&
              task.assigned.img &&
              <img className="avatar" src={task.assigned.img} alt="" title={task.assigned.label}/>
            }
            {
              task.assigned &&
              !task.assigned.img &&
              <img className="usericon" src={UserIcon} alt="" title={task.assigned.label}/>
            }
            <LinkButton
              onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
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
            onClick={(e) => {e.preventDefault(); restoreLatestTask(removedTasks)}}
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
        <span className="message">You have no closed tasks.</span>
      }

      {
        closedTasks.map((task) => (
          <ItemContainer
            key={task._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              checked={task.closed}
              onChange={() => closeTask(task)}
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
            <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task)}>
              {task.name}
            </span>
            {
              task.assigned &&
              task.assigned.img &&
              <img className="avatar" src={task.assigned.img} alt="" title={task.assigned.label}/>
            }
            {
              task.assigned &&
              !task.assigned.img &&
              <img className="usericon" src={UserIcon} alt="" title={task.assigned.label}/>
            }
            <LinkButton
              onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
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
