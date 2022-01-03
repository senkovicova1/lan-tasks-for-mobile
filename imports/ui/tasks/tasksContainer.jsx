import React, {
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

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import TasksList from '/imports/ui/tasks/list';
import Calendar from '/imports/ui/tasks/calendar';
import Dnd from '/imports/ui/tasks/dnd';
import EditTask from '/imports/ui/tasks/editContainer';
import Loader from '/imports/ui/other/loadingScreen';

import {
  addTask
} from '/imports/api/handlers/tasksHandlers';

import {
  UserIcon
} from "/imports/other/styles/icons";

import {
  PLAIN,
  CALENDAR,
  DND,
  allMyTasksFolder,
  importantTasksFolder
} from "/imports/other/constants";

export default function TasksContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    tasksHandlerReady
  } = props;

  const {
    filterID,
    folderID
  } = match.params;

  const {
    layout,
    search,
    sortBy,
    sortDirection,
    filter,
    chosenTask,
  } = useSelector( ( state ) => state.metadata.value );

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const dbUsers = useSelector( ( state ) => state.users.value );

  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    let group = folders.active;
    if ( match.path.includes( "archived" ) ) {
      group = folders.archived;
    }
    if ( (!folderID && !filterID) || folderID === "all" ) {
      return allMyTasksFolder( language );
    }
    if ( folderID === "important" ) {
      return importantTasksFolder( language );
    }
    const maybeFolder = group.find( folder => folder._id === folderID );
    return maybeFolder ? maybeFolder : {};
  }, [ folders, folderID ] );

  const filters = useSelector( ( state ) => state.filters.value );
  const sidebarFilter = useMemo( () => {
    const maybeFilter = filters.find( filter => filter._id === filterID );
    return maybeFilter;
  }, [ filters, filterID ] );

//  const tasks = useSelector( ( state ) => state.tasks.value );

const [showClosed, setShowClosed] = useState(false);

  const getFilter = () => {
    let query = {};

    if (folder && folder.value && folder.value !== "all" && folder.value !== "important" ){
      query.folder = folder._id;
    } else if (folder && folder.value === "all"){
      query.assigned = {
        $elemMatch: {
          $eq: userId
        }
      };
      const foldersIds = folders.active.map( folder => folder._id );
      query.folder = {
        $in: foldersIds
      };
    } else if (folder && folder.value === "important"){
      query.important = true;
    } else {
      const foldersIds = folders.active.map( folder => folder._id );
      query.folder = {
        $in: foldersIds
      };
    }

    if (sidebarFilter && sidebarFilter.title){
/*      query.name = {
        $text: {
            $search: sidebarFilter.title,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
      };*/
    }
    if (sidebarFilter && sidebarFilter.folders.length > 0){
      const sidebarFolderIds = sidebarFilter.folders;
      query.folder = {
        $in: sidebarFolderIds
      };
    }
    if (sidebarFilter && sidebarFilter.important){
      query.important = true;
    }
    if (sidebarFilter && sidebarFilter.assigned){
      const sidebarAssignedIds = sidebarFilter.assigned;
      query.assigned = {
        $elemMatch: {
          $in: sidebarAssignedIds
        }
      };
    }
    if (sidebarFilter && (sidebarFilter.datetimeMin || sidebarFilter.datetimeMax)){
      const actualDatetimeMin = sidebarFilter.datetimeMin ? sidebarFilter.datetimeMin : 0;
      const actualDatetimeMax = sidebarFilter.datetimeMax ? sidebarFilter.datetimeMax : 8640000000000000;
      query.startDatetime = {
         $lte: actualDatetimeMax
      };
      query.endDatetime = {
        $gte: actualDatetimeMin
      };
    }
    if (sidebarFilter && (sidebarFilter.dateCreatedMin || sidebarFilter.dateCreatedMax)){
      const actualDateCreatedMin = sidebarFilter.dateCreatedMin ? sidebarFilter.dateCreatedMin : 0;
      const actualDateCreatedMax = sidebarFilter.dateCreatedMax ? sidebarFilter.dateCreatedMax : 8640000000000000;
      query.dateCreated = {
        $and: [
          { $lte: actualDatetimeMax },
          { $gte: actualDatetimeMin },
        ]
      };
    }

    if ((!sidebarFilter || !sidebarFilter.showClosed) && (!filter || !filter.showClosed) && !showClosed){
      query.closed = false;
    }

    query.removedDate = null;

    return query;
  }

  const { tasks, removedTasks, tasksLoading } = useTracker(() => {

    let tasks = [];
    let removedTasks = [];
    let tasksLoading = true;

    const noDataAvailable = { tasks, removedTasks, tasksLoading };

    if ( !tasksHandlerReady ) {
          return noDataAvailable;
    }


      let query = {...getFilter()};
      const fields = {
        name: 1,
        closed: 1,
        important: 1,
        container: 1,
        startDatetime: 1,
        endDatetime: 1,
        allDay: 1,
        assigned: 1,
        dateCreated: 1,
        folder: 1,
        repeat: 1,
      };
      tasks = TasksCollection.find(
        query,
        {
          fields
        }
      ).fetch();

      removedTasks = TasksCollection.find(
        {
          ...query,
          removedDate: {$exists: true},
        },
        {
          fields
        }
      ).fetch();

    if (sidebarFilter && sidebarFilter.title){
      tasks = tasks.filter(task => task.name.toLowerCase().includes(sidebarFilter.title.toLowerCase()));
    }
    tasks = tasks.map( task => {
      let newTask = {
        ...task,
        folder: [...folders.active, ...folders.archived].length > 0 ? [...folders.active, ...folders.archived].find( folder => folder._id === task.folder ) : {},
        container: task.container ? task.container : 0,
        assigned: []
      }
      if ( (Array.isArray(task.assigned) && task.assigned.length > 0) || task.assigned ) {
        const newAssigned = Array.isArray(task.assigned) ? dbUsers.filter( user => task.assigned.includes(user._id) ) : [dbUsers.find( user => user._id === task.assigned )];
        return {
          ...newTask,
          assigned: newAssigned.length > 0 && newAssigned[0] ? newAssigned.sort((a1,a2) => a1.label.toLowerCase() > a2.label.toLowerCase() ? 1 : -1) : [
            {
              _id: "-1",
              label: "No assigned",
              value: "-1",
              img: UserIcon
            }
          ],
        };
      }
      return newTask;
    } );
    tasksLoading = false;

    return { tasks, removedTasks, tasksLoading};
  });

  const searchedTasks = useMemo( () => {
    return tasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
  }, [ search, tasks ] );

  const tasksWithAdvancedFilters = useMemo( () => {
    const folderIds = filter.folders.map(folder => folder._id);
    const filteredByFolders = ["all", "important"].includes(folderID) ? searchedTasks.filter( task => filter.folders.length === 0 || folderIds.includes(task.folder._id)) : searchedTasks;
    const filteredByImportant = filteredByFolders.filter(task => !filter.important || task.important);
    const assignedIds = filter.assigned.map(user => user._id);
    const filteredByAssigned = filteredByImportant.filter(task => filter.assigned.length === 0 || task.assigned.some(user => assignedIds.includes(user._id) ) );
    const filteredByDatetimes = (filter.datetimeMin || filter.datetimeMax) ? filteredByAssigned.filter(task => {
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
  }, [ filter, searchedTasks, folderID, filterID ] );

  const groupBy = (arr, key) => {
    const initialValue = {};
    return arr.reduce((acc, cval) => {
      const myAttribute = cval[key];
      acc[myAttribute] = [...(acc[myAttribute] || []), cval]
      return acc;
    }, initialValue);
  };

  const sortedTasks = useMemo( () => {
    const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
    if ( sortBy === "customOrder" ) {
      const containerOrder = folder.containers ? [{_id: 0}, ...folder.containers.map((c, index) => ({...c, order: c.order ? c.order : index + 1 })).sort((c1, c2) => c1.order < c2.order ? -1 : 1)] : [{_id: 0}];
        let newSorted = groupBy(tasksWithAdvancedFilters, 'container');
        return containerOrder.map(container => {
          return newSorted[container._id] ? newSorted[container._id].sort((t1, t2) => {
            if (!t1.order && !t2.order){
              return 0;
            }
            if (t1.order && !t2.order){
              return ( -1 ) * multiplier;
            }
            if (!t1.order && t2.order){
              return 1 * multiplier;
            }
            return t1.order < t2.order ?  1 * multiplier : ( -1 ) * multiplier;
          }) : [];
        }).flat();
    }
    return tasksWithAdvancedFilters
      .sort( ( t1, t2 ) => {
        if ( sortBy === "assigned" ) {
          return t1.assigned.map(assigned => assigned.label).join(" ").toLowerCase() < t2.assigned.map(assigned => assigned.label).join(" ").toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
        }
        if ( sortBy === "date" ) {
          return t1.dateCreated < t2.dateCreated ? 1 * multiplier : ( -1 ) * multiplier;
        }
        if ( sortBy === "important" ) {
          return t1.important ? 1 * multiplier : ( -1 ) * multiplier;
        }
        return t1.name.toLowerCase() < t2.name.toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
      } );
  }, [ tasksWithAdvancedFilters, sortBy, sortDirection, folder ] );

  const activeTasks = useMemo( () => {
    return sortedTasks.filter( task => !task.closed );
  }, [ sortedTasks, sortBy, sortDirection ] );

  const closedTasks = useMemo( () => {
      return sortedTasks.filter( task => task.closed );
  }, [ sortedTasks, sortBy, sortDirection ] );

  const addQuickTask = (newTaskName, container, dateCreated, onSuccess, onFail) => {
    addTask(
      newTaskName,
      [userId],
      folderID,
      dateCreated,
      container,
      onSuccess,
      onFail
    );
  }

  if ( (!folder && !filter)  ) {
    return <Loader />;
  }

  if ( window.innerWidth <= 820 || layout === PLAIN ) {
    return (
      <TasksList
          {...props}
          tasksLoading={tasksLoading}
          showClosed={showClosed}
          setShowClosed={setShowClosed}
          activeTasks={activeTasks}
          closedTasks={closedTasks}
          removedTasks={removedTasks}
          sidebarFilter={sidebarFilter ? sidebarFilter : {}}
          addQuickTask={addQuickTask}
          folder={folder}
          tasksHandlerReady={tasksHandlerReady}
          />
    );
  }

  if ( layout === CALENDAR ) {
    return (
      <Calendar
          {...props}
          tasksLoading={tasksLoading}
          showClosed={showClosed}
          setShowClosed={setShowClosed}
          tasksWithAdvancedFilters={tasksWithAdvancedFilters}
          removedTasks={removedTasks}
          folder={folder}
          sidebarFilter={sidebarFilter ? sidebarFilter : {}}
          tasksHandlerReady={tasksHandlerReady}
          />
    );
  }

  if ( layout === DND ) {
    return (
      <Dnd
          {...props}
          tasksLoading={tasksLoading}
          showClosed={showClosed}
          setShowClosed={setShowClosed}
          sortedTasks={sortedTasks}
          removedTasks={removedTasks}
          sidebarFilter={sidebarFilter ? sidebarFilter : {}}
          addQuickTask={addQuickTask}
          folder={folder}
          tasksHandlerReady={tasksHandlerReady}
          />
    );
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "100%", position: "relative", padding: "20px 15px"}}>
        <TasksList
          {...props}
          tasksLoading={tasksLoading}
          showClosed={showClosed}
          setShowClosed={setShowClosed}
          activeTasks={activeTasks}
          closedTasks={closedTasks}
          removedTasks={removedTasks}
          sidebarFilter={sidebarFilter ? sidebarFilter : {}}
          addQuickTask={addQuickTask}
          folder={folder}
          tasksHandlerReady={tasksHandlerReady}
          />
      </div>
      <div style={{width: "50%", borderLeft: "1px solid #d6d6d6", height: "-webkit-fill-available", position: "relative",  padding: "5px 15px"}}>
        {
          chosenTask &&
          <EditTask {...props} tasksHandlerReady={tasksHandlerReady} taskId={chosenTask}/>
        }
        {
          !chosenTask &&
          <div style={{padding: "15px"}}><h2>No chosen task</h2> </div>
        }
      </div>
    </div>
  );
};
