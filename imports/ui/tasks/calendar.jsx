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

import {
  HistoryCollection
} from '/imports/api/historyCollection';

import moment from 'moment';

import Select from 'react-select';

import Switch from "react-switch";

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';

import {
  DndProvider
} from 'react-dnd';

import {
  HTML5Backend
} from 'react-dnd-html5-backend';

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

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
  closeTask,
  removeTask,
  restoreLatestTask,
  updateSimpleAttribute
} from './tasksHandlers';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

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

import {
  CLOSED_STATUS,
  OPEN_STATUS,
  SET_START,
  SET_END,
} from '/imports/other/messages';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function CalendarList( props ) {

  const dispatch = useDispatch();

  const {
  match,
  folder,
  tasksWithAdvancedFilters,
  removedTasks,
  subtasks,
  comments,
  allTasks
} = props;

const {
  folderID
} = match.params;

const {
  search,
  filter,
  chosenTask
} = useSelector( ( state ) => state.metadata.value );

const [ selectedInterval, setSelectedInterval ] = useState(null);
const [ showClosed, setShowClosed ] = useState( false );



const [ draggedEvent, setDraggedEvent ] = useState( null );
const [ displayDragItemInCell, setDisplayDragItemInCell ] = useState( true );



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

const dbUsers = useSelector( ( state ) => state.users.value );
const notifications = useSelector( ( state ) => state.notifications.value );

const { history } = useTracker(() => {
  const noDataAvailable = { history: []};
  if (!Meteor.user()) {
    return noDataAvailable;
  }

  const historyHandler = Meteor.subscribe('history');

  if (!historyHandler.ready()) {
    return { ...noDataAvailable };
  }

  const history = HistoryCollection.find(  {}  ).fetch();

  return { history };
});

document.onkeydown = function( e ) {
  e = e || window.event;
  switch ( e.which || e.keyCode ) {
    case 13:
      if ( newTaskName.length > 0 ) {
      //  addQuickTask();
      }
      break;
  }
};

  const onEventResize = (data) => {
    const { start, end, event } = data;
    Meteor.call(
      'tasks.updateSimpleAttribute',
      event._id,
      {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000}
    );
  };

  const onEventDrop = (data) => {
    const { start, end, event } = data;
    Meteor.call(
      'tasks.updateSimpleAttribute',
      event._id,
      {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000}
    );
  };

  const handleDragStart = (event) => {
    setDraggedEvent(event);
  }

  const handleDisplayDragItemInCell  = (event) => {
    setDisplayDragItemInCell(!displayDragItemInCell);
  }

  const dragFromOutsideItem = () => {
    return draggedEvent;
  }

  const onDropFromOutside = ({ start, end, allDay }) => {
    const oldStart = draggedEvent.startDatetime;
    const oldEnd = draggedEvent.endDatetime;
    Meteor.call('tasks.updateSimpleAttribute', draggedEvent._id, {startDatetime: start.getTime() / 1000, endDatetime: moment.unix(end.getTime() / 1000).subtract('s', 1).unix()});

    const taskHistory = history.find(entry => entry.task === draggedEvent._id);
    const historyData1 = {
      dateCreated: moment().unix(),
      user: userId,
      type: SET_START,
      args: [],
    };
    const historyData2 = {
      dateCreated: moment().unix(),
      user: userId,
      type: SET_END,
      args: [],
    };
    if (taskHistory.length === 0){
      Meteor.call(
        'history.addNewHistory',
        draggedEvent._id,
        [
          historyData1,
          historyData2
        ]
      );
    } else {
      Meteor.call(
        'history.editHistory',
        taskHistory._id,
        historyData1
      );
      Meteor.call(
        'history.editHistory',
        taskHistory._id,
        historyData2
      );
    }

    if (draggedEvent.assigned.length > 0){
      draggedEvent.assigned.filter(assigned => assigned._id !== userId).map(assigned => {
        let usersNotifications = notifications.find( notif => notif._id === assigned._id );
        const notificationData1 = {
          ...historyData1,
          args: [name, moment.unix(oldStart).format("D.M.YYYY HH:mm"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm")],
          read: false,
          taskId: draggedEvent._id,
        };
        const notificationData2 = {
          ...historyData2,
          args: [name, moment.unix(oldEnd).format("D.M.YYYY HH:mm"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm")],
          read: false,
          taskId: draggedEvent._id,
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

  return (
    <CalendarContainer>

        <FilterSummary
          {...props}
          style={{padding: "0px"}}
          />

  <div style={{display: "flex", width: "100%"}}>
    <div className="task-list">

      <DndProvider backend={HTML5Backend}>
        <h2 style={{fontSize: "1.5em", height: "35px", marginBottom: "11px"}}>{translations[language].unscheduled}</h2>
        {
          activeTasksWithoutDatetimes.length === 0 &&
          <span className="message">{translations[language].noOpenTasks}</span>
        }
        {
          activeTasksWithoutDatetimes.length > 0 &&
          activeTasksWithoutDatetimes.map(task => (
            <ItemCard
              key={task._id}
              draggable="true"
              onDragStart={() => {
                handleDragStart(task);
              }}
              >
              <div className="info-bar">
                <Input
                  id={`task_name ${task._id}`}
                  type="checkbox"
                  checked={task.closed}
                  onChange={() => {
                    Meteor.call('tasks.closeTask', task, subtasks);
                    const taskHistory = history.find(entry => entry.task === task._id);
                    const historyData = {
                      dateCreated: moment().unix(),
                      user: userId,
                      type: CLOSED_STATUS,
                      args: [],
                    };
                    if (taskHistory.length === 0){
                      Meteor.call(
                        'history.addNewHistory',
                        task._id,
                        [
                          historyData
                        ]
                      );
                    } else {
                      Meteor.call(
                        'history.editHistory',
                        taskHistory._id,
                        historyData
                      )
                    }

                    if (task.assigned.length > 0){
                      task.assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                        let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                        const notificationData = {
                          ...historyData,
                          args: [name],
                          read: false,
                          taskId: task._id,
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
                  onClick={(e) => {e.preventDefault(); Meteor.call('tasks.removeTask' , task, removedTasks, subtasks, comments, allTasks)}}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </div>
              <div>
                <span htmlFor={`task_name ${task._id}`} onClick={() => dispatch(setChosenTask(task._id))}>
                  {task.name}
                </span>
              </div>
            </ItemCard>
          ))
        }
      </DndProvider>

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
        inactiveTasksWithoutDatetimes.length === 0 &&
        <span className="message">{translations[language].noClosedTasks}</span>
      }
      {
        showClosed &&
        inactiveTasksWithoutDatetimes.length > 0 &&
        inactiveTasksWithoutDatetimes.map(task => (
          <ItemCard key={task._id}>
            <div className="info-bar">
              <Input
                id={`task_name ${task._id}`}
                type="checkbox"
                checked={task.closed}
                onChange={() => {
                  Meteor.call('tasks.updateSimpleAttribute', task._id, {closed: false})
                }}
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
                onClick={(e) => {e.preventDefault(); Meteor.call('tasks.removeTask', task, removedTasks, subtasks, comments, allTasks)}}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
            </div>
            <div>
              <span htmlFor={`task_name ${task._id}`} onClick={() => dispatch(setChosenTask(task._id))}>
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
      dragFromOutsideItem={() => {
        if (displayDragItemInCell){
          return dragFromOutsideItem();
        }
        return null;
      }}
      onDropFromOutside={onDropFromOutside}
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
          <EditTask {...props} taskId={chosenTask} close={() => dispatch(setChosenTask(null))}/>
        </ModalBody>
      </Modal>
    }

    </CalendarContainer>
  );
};
