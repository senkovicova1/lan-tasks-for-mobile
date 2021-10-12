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
} from './tasksHandlers';

import AddTask from './addContainer';

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
  CalendarContainer
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
} = props;

const {
  search,
  filter
} = useSelector( ( state ) => state.metadata.value );

const [ selectedInterval, setSelectedInterval ] = useState(null);

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

const dbUsers = useSelector( ( state ) => state.users.value );
const tasks = useSelector( ( state ) => state.tasks.value );
const subtasks = useSelector( ( state ) => state.subtasks.value );
const comments = useSelector( ( state ) => state.comments.value );

const filteredTasks = useMemo( () => {
  return tasks.filter( task => !task.removedDate );
}, [ tasks, userId ] );

const searchedTasks = useMemo( () => {
  return filteredTasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
}, [ search, filteredTasks ] );

const tasksWithAdvancedFilters = useMemo( () => {
  const folderIds = filter.folders.map(folder => folder._id);
  const filteredByFolders = searchedTasks.filter( task => filter.folders.length === 0 || folderIds.includes(task.folder._id));
  const filteredByImportant = filteredByFolders.filter(task => !filter.important || task.important);
  const assignedIds = filter.assigned.map(user => user._id);
  const filteredByAssigned = filteredByImportant.filter(task => filter.assigned.length === 0 || assignedIds.includes(task.assigned._id));
  const filteredByDeadlines = (filter.deadlineMin || filter.deadlineMax) ? filteredByAssigned.filter(task => task.deadline && (!filter.deadlineMin || filter.deadlineMin <= task.deadline) && (!filter.deadlineMax || task.deadline <= filter.deadlineMax)) : filteredByAssigned;
  const filteredByDateCreated = filteredByDeadlines.filter(task => (!filter.dateCreatedMin || filter.dateCreatedMin <= task.dateCreated) && (!filter.dateCreatedMax || task.dateCreated <= filter.dateCreatedMax));
  return filteredByDateCreated;
}, [ filter, searchedTasks ] );

const activeTasks = useMemo( () => {
  return tasksWithAdvancedFilters.filter( task => !task.closed ).map(task => ({...task, startDatetime: new Date(task.startDatetime*1000), endDatetime: new Date(task.endDatetime*1000), tooltip: `Assigned: ${task.assigned ? task.assigned.label : "None"}`}));
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
      <AppliedFilter>
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
      style={{ height: "-webkit-fill-available", minHeight: "500px" }}
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


    </CalendarContainer>
  );
};
