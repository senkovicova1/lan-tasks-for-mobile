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

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

import {
  RepeatsCollection
} from '/imports/api/repeatsCollection';

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
  writeHistoryAndSendNotifications,
} from '/imports/api/handlers/tasksHandlers';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import AddTask from './addContainer';
import EditTask from './editContainer';
import FilterSummary from '/imports/ui/filters/summary';
import Loader from '/imports/ui/other/loadingScreen';

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

const { DateTime } = require("luxon");

let breakPoint = 50;

export default function CalendarList( props ) {

  const dispatch = useDispatch();

  const {
  match,
  tasksLoading,
  showClosed,
  setShowClosed,
  folder,
  tasksWithAdvancedFilters,
  repeats,
  removedTasks,
  tasksHandlerReady
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

const [ draggedEvent, setDraggedEvent ] = useState( null );
const [ displayDragItemInCell, setDisplayDragItemInCell ] = useState( true );

const [ tasksWithDatetimes, setTasksWithDatetimes ] = useState( [] );
const [ activeTasksWithoutDatetimes, setActiveTasksWithoutDatetimes ] = useState([]);
const [ inactiveTasksWithoutDatetimes, setInactiveTasksWithoutDatetimes ] = useState([]);

const [ maxDateReached, setMaxDateReached ] = useState( 0 );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

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

    const tasksIds = [...tasksWithAdvancedFilters].map(task => task._id);
    const history = HistoryCollection.find( {
      task: {
        $in: tasksIds
      }
    }  ).fetch();

    return { history };
  });

  const { subtasks } = useTracker(() => {
    const noDataAvailable = { subtasks: [] };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const subtasksHandler = Meteor.subscribe('subtasks');

    if (!subtasksHandler.ready()) {
      return { ...noDataAvailable };
    }

    const tasksIds = [...tasksWithAdvancedFilters].map(task => task._id);
    const subtasks = SubtasksCollection.find(  {
      task: {
        $in: tasksIds
      }
    }  ).fetch();

    return { subtasks };
  });

  const { comments } = useTracker(() => {
    const noDataAvailable = { comments: [] };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const commentsHandler = Meteor.subscribe('comments');

    if (!commentsHandler.ready()) {
      return { ...noDataAvailable };
    }

    const tasksIds = [...tasksWithAdvancedFilters].map(task => task._id);
    const comments = CommentsCollection.find(  {
      task: {
        $in: tasksIds
      }
    }  ).fetch();

    return { comments };
  });


  useEffect( () => {
    //breakPoint -= 1;

    const mappedAndFilteredTasks = tasksWithAdvancedFilters.filter( task => showClosed || !task.closed ).map( task => {
      let possibleNewerTask = tasksWithDatetimes.find(t => t._id === task._id);
      let possibleNewerTaskChangeID = possibleNewerTask && possibleNewerTask.changeID ? possibleNewerTask.changeID : -1;
      let taskChangeID = task.changeID ? task.changeID : 0;
      if (!possibleNewerTask || (possibleNewerTaskChangeID < taskChangeID )){
        return {
          ...task,
          startDatetime: new Date( task.startDatetime * 1000 ),
          endDatetime: new Date( task.endDatetime * 1000 ),
          tooltip: `Assigned: ${task.assigned ? task.assigned.label : "None"}`
        };
      } else {
        return {
          ...possibleNewerTask
        };
      }
  } );

    //ends with saturday - calendar goes from sun to sat
    const currentWeekEnd = moment().day( 6 ).hour( 0 ).minute( 0 ).second( 0 ).unix();

    let tasksToSave = mappedAndFilteredTasks;

    if ( repeats.length > 0 ) {
      const currentWeekStart = moment().day( 0 ).hour( 0 ).minute( 0 ).second( 0 ).unix();

      let dummyTasks = generateDummyTasks(currentWeekStart, currentWeekEnd, mappedAndFilteredTasks);

      tasksToSave = [ ...mappedAndFilteredTasks, ...dummyTasks ];

    }
    setMaxDateReached( currentWeekEnd );
   setTasksWithDatetimes( tasksToSave );

 }, [ tasksWithAdvancedFilters, (breakPoint < 0 ? false : repeats) ] );

  useEffect(() => {

    const activeTasks = tasksWithAdvancedFilters.filter( task => !task.startDatetime && !task.closed );
    const inactiveTasks = tasksWithAdvancedFilters.filter( task => !task.startDatetime && task.closed );

    setActiveTasksWithoutDatetimes(activeTasks);
    setInactiveTasksWithoutDatetimes(inactiveTasks);

  }, [tasksWithAdvancedFilters, showClosed]);

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

  const handleRangeChange = (range) => {

    const startDateUnix = moment(range[0]).unix();
    const endDateUnix = moment(range[6]).unix();

    if (repeats.length === 0 || maxDateReached >= endDateUnix){
      return;
    }

    let dummyTasks = generateDummyTasks(startDateUnix, endDateUnix, tasksWithDatetimes);

    let newTasksWithDatetimes = [...tasksWithDatetimes, ...dummyTasks];
    setTasksWithDatetimes(newTasksWithDatetimes);
    setMaxDateReached(endDateUnix);
  }

  const generateDummyTasks = (startRange, endRange, tasks) => {

        let tasksWithValidRepeat = tasks
        .filter(task => task.repeat)
        .map(task => ({...task, repeat: task.repeat._id ? {...task.repeat} : repeats.find(repeat => repeat._id === task.repeat) }))
        .filter(task =>
          (!task.repeat.repeatUntil || task.repeat.repeatUntil >= startRange)
          && task.repeat.repeatStart <= endRange
          && moment(task.startDatetime).unix() <= endRange);

        let dummyTasks  = [];

        repeats.forEach((repeat, i) => {
          let tasksWithThisRepeat = tasksWithValidRepeat.filter(task => task.repeat._id === repeat._id);

          if (tasksWithThisRepeat.length === 0){
            return;
          }

          const latestTask = tasksWithThisRepeat.sort((t1,t2) => (moment(t1.startDatetime) < moment(t2.startDatetime) ? 1 : -1))[0];

          let newDummyTask = {...latestTask};
          newDummyTask.isDummy = true;

          while (moment(newDummyTask.startDatetime).unix() <= endRange){

            const newStartUnix = moment(newDummyTask.startDatetime ? newDummyTask.startDatetime : latestTask.startDatetime).add(latestTask.repeat.intervalNumber, latestTask.repeat.intervalFrequency === "m" ? "M" : latestTask.repeat.intervalFrequency).unix();
            newDummyTask.startDatetime = new Date(newStartUnix*1000);
            const newEndUnix = moment(newDummyTask.endDatetime ? newDummyTask.endDatetime : latestTask.endDatetime).add(latestTask.repeat.intervalNumber, latestTask.repeat.intervalFrequency === "m" ? "M" : latestTask.repeat.intervalFrequency).unix();
            newDummyTask.endDatetime = new Date(newEndUnix*1000);

            dummyTasks.push({...newDummyTask});
          }
      });

      return dummyTasks;
  }

  const onEventResize = (data) => {
    const { start, end, event } = data;

    let newTasksWithDatetimes = [...tasksWithDatetimes];
    let oldStart = 0;
    let oldEnd = 0;
    let assigned = [];
    let folderId = null;
    let newChangeID = 0;
    let taskName = "";

    newTasksWithDatetimes = newTasksWithDatetimes.map(task => {
      if (task._id === event._id){
        oldStart = task.startDatetime ? task.startDatetime : "UNSET";
        oldEnd = task.endDatetime ? task.endDatetime : "UNSET";
        assigned = [...task.assigned];
        folderId = task.folder._id;
        newChangeID = (task.changeID ? task.changeID + 1 : 1)%1000;
        taskName = task.name;
        return ({
          ...task,
          changeID: newChangeID,
          startDatetime: start,
          endDatetime: end
        })
      }
      return task;
    });
    setTasksWithDatetimes(newTasksWithDatetimes);

    Meteor.call(
      'tasks.updateSimpleAttribute',
      event._id,
      {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000, changeID: newChangeID}
    );

      let taskHistory = [history.find(entry => entry.task === event._id)];
      if (taskHistory.length === 0){
        taskHistory = [];
      }

    writeHistoryAndSendNotifications(
      userId,
      event._id,
      [SET_START, SET_END],
      [[moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      taskHistory,
      assigned,
      [],
      [[`id__${event._id}__id`, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [`id__${event._id}__id`, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      [[taskName, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [taskName, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      folderId,
      dbUsers,
    );

  };

  const onEventDrop = (data) => {
    const { start, end, event } = data;

    let newTasksWithDatetimes = [...tasksWithDatetimes];
    let oldStart = 0;
    let oldEnd = 0;
    let assigned = [];
    let folderId = null;
    let newChangeID = 0;
    let taskName = "";

    newTasksWithDatetimes = newTasksWithDatetimes.map(task => {
      if (task._id === event._id){
        oldStart = task.startDatetime ? task.startDatetime : "UNSET";
        oldEnd = task.endDatetime ? task.endDatetime : "UNSET";
        assigned = [...task.assigned];
        folderId = task.folder._id;
        newChangeID = (task.changeID ? task.changeID + 1 : 1)%1000;
        taskName = task.name;
        return ({
          ...task,
          changeID: newChangeID,
          startDatetime: start,
          endDatetime: end
        })
      }
      return task;
    });
    setTasksWithDatetimes(newTasksWithDatetimes);

    Meteor.call(
      'tasks.updateSimpleAttribute',
      event._id,
      {startDatetime: start.getTime() / 1000, endDatetime: end.getTime() / 1000, changeID: newChangeID}
    );

      let taskHistory = [history.find(entry => entry.task === event._id)];
      if (taskHistory.length === 0){
        taskHistory = [];
      }

    writeHistoryAndSendNotifications(
      userId,
      event._id,
      [SET_START, SET_END],
      [[moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      taskHistory,
      assigned,
      [],
      [[`id__${event._id}__id`, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [`id__${event._id}__id`, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      [[taskName, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(start.getTime() / 1000).format("D.M.YYYY HH:mm:ss")], [taskName, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(end.getTime() / 1000).format("D.M.YYYY HH:mm:ss")]],
      folderId,
      dbUsers,
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

    if (draggedEvent.closed){

      let newTasksWithDatetimes = [...tasksWithDatetimes];
      const newTask = {
        ...draggedEvent,
        startDatetime: start,
        endDatetime: end,
        allDay,
        changeID: (draggedEvent.changeID ? draggedEvent.changeID + 1 : 1)%1000,
      };
      newTasksWithDatetimes.push(newTask);
      setTasksWithDatetimes(newTasksWithDatetimes);
      setInactiveTasksWithoutDatetimes(inactiveTasksWithoutDatetimes.filter(task => task._id !== draggedEvent._id));

    } else {

      let newTasksWithDatetimes = [...tasksWithDatetimes];
      const newTask = {
        ...draggedEvent,
        startDatetime: start,
        endDatetime: end,
        allDay,
        changeID: (draggedEvent.changeID ? draggedEvent.changeID + 1 : 1)%1000,
      };
      newTasksWithDatetimes.push(newTask);
      setTasksWithDatetimes(newTasksWithDatetimes);
      setActiveTasksWithoutDatetimes(activeTasksWithoutDatetimes.filter(task => task._id !== draggedEvent._id));

    }

    let assigned = [...draggedEvent.assigned];
    let folderId = draggedEvent.folder._id;

    const newStartDatetime = start.getTime() / 1000;
    const newEndDatetime = moment.unix(end.getTime() / 1000).subtract('s', 1).unix();

    Meteor.call(
      'tasks.updateSimpleAttribute',
      draggedEvent._id,
      {
        startDatetime: newStartDatetime,
        endDatetime: newEndDatetime,
        allDay,
        changeID: (draggedEvent.changeID ? draggedEvent.changeID + 1 : 1)%1000,
      }
    );

    let taskHistory = [history.find(entry => entry.task === draggedEvent._id)];
    if (taskHistory.length === 0){
      taskHistory = [];
    }

    writeHistoryAndSendNotifications(
      userId,
      draggedEvent._id,
      [SET_START, SET_END],
      [[moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(newStartDatetime).format("D.M.YYYY HH:mm:ss")], [moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(newEndDatetime).format("D.M.YYYY HH:mm:ss")]],
      taskHistory,
      assigned,
      [],
      [[`id__${draggedEvent._id}__id`, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(newStartDatetime).format("D.M.YYYY HH:mm:ss")], [`id__${draggedEvent._id}__id`, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(newEndDatetime).format("D.M.YYYY HH:mm:ss")]],
      [[draggedEvent.name, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(newStartDatetime).format("D.M.YYYY HH:mm:ss")], [draggedEvent.name, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(newEndDatetime).format("D.M.YYYY HH:mm:ss")]],
      folderId,
      dbUsers,
    );


  }


    if (tasksLoading){
      return   (
        <CalendarContainer style={{position: "relative"}}>
          <Loader />
        </CalendarContainer>
      )
    }

  return (
    <CalendarContainer>

        <FilterSummary
          {...props}
          style={{padding: "0px"}}
          />

        <div className="task-list-and-calendar">
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

                    let taskHistory = [history.find(entry => entry.task === task._id)];
                    if (taskHistory.length === 0){
                      taskHistory = [];
                    }

                    writeHistoryAndSendNotifications(
                      userId,
                      task._id,
                      [CLOSED_STATUS],
                      [[]],
                      taskHistory,
                      task.assigned,
                      [],
                      [[`id__${task._id}__id`]],
                      [[task.name]],
                      task.folder._id,
                      dbUsers,
                    );

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
                  onClick={(e) => {
                    e.preventDefault(); if ( removedTasks.length >= 5 ) {
                     let difference = removedTasks.length - 4;
                     const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
                     const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
                     const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
                     while ( difference > 0 ) {
                       Meteor.call('tasks.removeTask', idsToDelete[ difference - 1 ]);

                     if (task.repeat){
                           Meteor.call(
                             'repeats.removeTaskFromRepeat',
                             task._id,
                             task.repeat
                           )
                         }
                         subtasksToDelete.forEach( ( subtask, i ) => {
                           Meteor.call(
                             'subtasks.removeSubtask',
                             subtask._id
                           )
                         } );
                         commentsToDelete.forEach( ( comment, i ) => {
                           removeComment( comment._id );
                             Meteor.call(
                               'comments.removeComment',
                               comment._id
                             )
                         } );

                         difference -= 1;
                       }
                     }

                     let data = {
                       removedDate: parseInt(DateTime.now().toSeconds()),
                     };
                     Meteor.call(
                       "tasks.updateSimpleAttribute",
                       task._id,
                       data
                     );
                  }}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </div>
              <div>
                <span
                  className="dnd-task-title"
                  htmlFor={`task_name ${task._id}`}
                  onClick={() => dispatch(setChosenTask(task._id))}
                  >
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
                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    task._id,
                    {
                      closed: false
                    }
                  );

                  let taskHistory = [history.find(entry => entry.task === draggedEvent._id)];
                  if (taskHistory.length === 0){
                    taskHistory = [];
                  }

                  writeHistoryAndSendNotifications(
                    userId,
                    task._id,
                    [OPEN_STATUS],
                    [[]],
                    taskHistory,
                    task.assigned,
                    [],
                    [[`id__${task._id}__id`]],
                    [[task.name]],
                    task.folder._id,
                    dbUsers,
                  );
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
                onClick={(e) => {
                  e.preventDefault();
                   if ( removedTasks.length >= 5 ) {
                   let difference = removedTasks.length - 4;
                   const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
                   const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
                   const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
                   while ( difference > 0 ) {
                     Meteor.call('tasks.removeTask', idsToDelete[ difference - 1 ]);

                   if (task.repeat){
                         Meteor.call(
                           'repeats.removeTaskFromRepeat',
                           task._id,
                           task.repeat
                         )
                       }

                       difference -= 1;
                     }
                   }

                   subtasksToDelete.forEach( ( subtask, i ) => {
                     Meteor.call(
                       'subtasks.removeSubtask',
                       subtask._id
                     )
                   } );
                   commentsToDelete.forEach( ( comment, i ) => {
                     removeComment( comment._id );
                     Meteor.call(
                       'comments.removeComment',
                       comment._id
                     )
                   } );

                   let data = {
                     removedDate: parseInt(DateTime.now().toSeconds()),
                   };
                   Meteor.call(
                     "tasks.updateSimpleAttribute",
                     task._id,
                     data
                   );
                }}
                >
                <img
                  className="icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
            </div>
            <div>
              <span
                className="dnd-task-title"
                 htmlFor={`task_name ${task._id}`}
                 onClick={() => dispatch(setChosenTask(task._id))}
                 >
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
      events={tasksWithDatetimes}
      allDayAccessor="allDay"
      startAccessor="startDatetime"
      endAccessor="endDatetime"
      titleAccessor="name"
      tooltipAccessor="tooltip"
      resourceAccessor="name"
      style={{ height: "100%", width: "80%" }}
      defaultDate={moment().toDate()}
      scrollToTime={moment().hours(8).minutes(0).seconds(0).toDate()}
      defaultView="week"
      onSelectEvent={(task) => {
        dispatch(setChosenTask(task._id));
      }}
      onSelecting={(data) => {
        dispatch(setChosenTask(null));
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
      onRangeChange={handleRangeChange}
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
          <EditTask
            {...props}
            taskId={chosenTask}
            tasksHandlerReady={tasksHandlerReady}
            close={() => dispatch(setChosenTask(null))}
            />
        </ModalBody>
      </Modal>
    }

    </CalendarContainer>
  );
};
