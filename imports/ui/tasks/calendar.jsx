import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
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
import FilterSummary from '/imports/ui/filters/summary';

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

  const {
  match,
  history,
  folder,
  tasksWithAdvancedFilters,
  removedTasks,
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

        <FilterSummary
          {...props}
          style={{padding: "0px"}}
          />

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
