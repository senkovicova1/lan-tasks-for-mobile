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

import { Calendar, momentLocalizer } from 'react-big-calendar';

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  updateSimpleAttribute
} from './tasksHandlers';

import {
  removeSubtask
} from './subtasksHandlers';

import {
  removeComment
} from './commentsHandlers';

import {
  addTask,
  closeTask,
  removeTask,
  restoreLatestTask
} from './tasksHandlers';

import AddTask from './addContainer';
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
  AppliedFilter,
  CalendarContainer,
  LinkButton,
  ItemCard,
  Input,
  ItemContainer
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function CalendarList( props ) {

  const dispatch = useDispatch();

  const {
  match,
  history,
  folder,
  setParentChosenTask,
  chosenTask
} = props;

const {
  folderID
} = match.params;

const {
  search,
  filter
} = useSelector( ( state ) => state.metadata.value );

const [ selectedInterval, setSelectedInterval ] = useState(null);
const [ showClosed, setShowClosed ] = useState( false );

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

const filteredTasks = useMemo( () => {
  return tasks.filter( task => !task.removedDate &&
    ( task.folder._id === folder.value ||
      (folder.value === "important" && task.important) ||
      (
         "all" === folder.value &&
        task.assigned.some(assigned => assigned._id === userId)
       )
    )
  );
}, [ tasks, folder, userId ] );

const searchedTasks = useMemo( () => {
  return filteredTasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
}, [ search, filteredTasks ] );

const tasksWithAdvancedFilters = useMemo( () => {
  const folderIds = filter.folders.map(folder => folder._id);
  const filteredByFolders = searchedTasks.filter( task => filter.folders.length === 0 || folderIds.includes(task.folder._id));
  const filteredByImportant = filteredByFolders.filter(task => !filter.important || task.important);
  const assignedIds = filter.assigned.map(user => user._id);
  const filteredByAssigned = filteredByImportant.filter(task => filter.assigned.length === 0 || task.assigned.some(assigned => assignedIds.includes(assigned._id)));
  const filteredByDatetimes = (filter.deadlineMin || filter.deadlineMax) ? filteredByAssigned.filter(task => {
    const actualDatetimeMin = filter.datetimeMin ? filter.datetimeMin : 0;
    const actualDatetimeMax = filter.datetimeMax ? filter.datetimeMax : 8640000000000000;
    if (!task.startDatetime && !task.endDatetime){
      return false;
    }
    if (task.startDatetime && !task.endDatetime){
      return task.startDatetime <= actualDatetimeMax;
    }
    if (!task.startDatetime && task.endDatetime){
      return actualDatetimeMin <= task.endDatetime;
    }
    return (task.startDatetime <= actualDatetimeMax) && (actualDatetimeMin <= task.endDatetime);
  } ) : filteredByAssigned;
  const filteredByDateCreated = filteredByDatetimes.filter(task => (!filter.dateCreatedMin || filter.dateCreatedMin <= task.dateCreated) && (!filter.dateCreatedMax || task.dateCreated <= filter.dateCreatedMax));
  return filteredByDateCreated;
}, [ filter, searchedTasks ] );

const activeTasks = useMemo( () => {
  return tasksWithAdvancedFilters.filter( task => showClosed || !task.closed ).map(task => ({...task, startDatetime: new Date(task.startDatetime*1000), endDatetime: new Date(task.endDatetime*1000), tooltip: `Assigned: ${task.assigned ? task.assigned.label : "None"}`}));
}, [ tasksWithAdvancedFilters, showClosed ] );

const activeTasksWithoutDatetimes = useMemo( () => {
  return tasksWithAdvancedFilters.filter( task => !task.startDatetime && !task.closed );
}, [ tasksWithAdvancedFilters ] );

const inactiveTasksWithoutDatetimes = useMemo( () => {
  return tasksWithAdvancedFilters.filter( task => !task.startDatetime && task.closed );
}, [ tasksWithAdvancedFilters ] );

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
    return ((filter.folders.length > 0) ? 1 : 0) +
              (filter.important ? 1 : 0) +
              (filter.assigned.length > 0 ? 1 : 0) +
              (filter.deadlineMin ? 1 : 0) +
              (filter.deadlineMax ? 1 : 0) +
              (filter.dateCreatedMin ? 1 : 0) +
              (filter.dateCreatedMax ? 1 : 0);
  }, [filter]);

  const onEventResize = (data) => {
    const { start, end, event } = data;
    updateSimpleAttribute(event._id, {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000});
  };

  const onEventDrop = (data) => {
    const { start, end, event } = data;
    updateSimpleAttribute(event._id, {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000});
  };

  return (
    <CalendarContainer>
      {
        numberOfFilters > 0 &&
      <AppliedFilter style={{padding: "0px"}}>
        {
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

  <div style={{display: "flex", width: "100%"}}>
    <div className="task-list">
      {
        activeTasksWithoutDatetimes.length === 0 &&
        <span className="message">You have no open tasks.</span>
      }
      {
        activeTasksWithoutDatetimes.length > 0 &&
        activeTasksWithoutDatetimes.map(task => (
          <ItemCard>
            <div className="info-bar">
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
              {
                task.assigned.map(assigned => (
                  <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
                ))
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
            </div>
            <div>
              <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
                {task.name}
              </span>
            </div>
          </ItemCard>
        ))
      }
      <hr style={{marginTop: "7px", marginBottom: "7px"}}/>

      <ItemContainer key="commands" style={{padding: "0px"}} >
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
        inactiveTasksWithoutDatetimes.length === 0 &&
        <span className="message">You have no closed tasks.</span>
      }
      {
        showClosed &&
        inactiveTasksWithoutDatetimes.length > 0 &&
        inactiveTasksWithoutDatetimes.map(task => (
          <ItemCard>
            <div className="info-bar">
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
              {
                task.assigned.map(assigned => (
                  <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
                ))
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
            </div>
            <div>
              <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task._id)}>
                {task.name}
              </span>
            </div>
          </ItemCard>
        ))
      }
    </div>
    <DnDCalendar
      selectable
      localizer={localizer}
      events={activeTasks}
      allDayAccessor="allDay"
      startAccessor="startDatetime"
      endAccessor="endDatetime"
      titleAccessor="name"
      tooltipAccessor="tooltip"
      resourceAccessor="name"
      style={{ height: "auto", minHeight: "500px", maxHeight: "1000px", width: "80%" }}
      defaultDate={moment().toDate()}
      defaultView="month"
      onSelectEvent={(data) => {
      }}
      onSelecting={(data) => {
      }}
      onSelectSlot={(data) => {
        setSelectedInterval(data);
      }}
      onEventDrop={onEventDrop}
      resizable
      onEventResize={onEventResize}
    />
</div>

    {
      selectedInterval &&
      <Modal isOpen={true}>
        <ModalBody>
          <AddTask
            {...props}
            startDatetime={selectedInterval.start.getTime() / 1000}
            endDatetime={selectedInterval.end.getTime() / 1000}
            close={() => setSelectedInterval(null)}
            />
        </ModalBody>
      </Modal>
    }

    {
      chosenTask &&
      <Modal isOpen={true}>
        <ModalBody>
          <EditTask {...props} taskId={chosenTask} close={() => setParentChosenTask(null)}/>
        </ModalBody>
      </Modal>
    }

    </CalendarContainer>
  );
};
