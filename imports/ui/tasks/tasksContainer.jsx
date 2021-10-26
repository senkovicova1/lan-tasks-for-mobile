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

import TasksList from '/imports/ui/tasks/list';
import Calendar from '/imports/ui/tasks/calendar';
import Dnd from '/imports/ui/tasks/dnd';
import EditTask from '/imports/ui/tasks/editContainer';
import Loader from '/imports/ui/other/loadingScreen';

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
    return maybeFolder;
  }, [ folders, folderID ] );

  const filters = useSelector( ( state ) => state.filters.value );
  const sidebarFilter = useMemo( () => {
    const maybeFilter = filters.find( filter => filter._id === filterID );
    return maybeFilter;
  }, [ filters, filterID ] );

  const tasks = useSelector( ( state ) => state.tasks.value );
  const dbUsers = useSelector( ( state ) => state.users.value );
  const subtasks = useSelector( ( state ) => state.subtasks.value );
  const comments = useSelector( ( state ) => state.comments.value );

  const removedTasks = useMemo( () => {
    if ( folderID ) {
      return tasks.filter( t => t.folderID === folderID && t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
    }
    return tasks.filter( t => t.removedDate ).sort( ( t1, t2 ) => ( t1.removedDate < t2.removedDate ? 1 : -1 ) );
  }, [ tasks, folderID ] );

  const filteredTasks = useMemo( () => {
    if (!folder && !sidebarFilter){
      return [];
    }
    if (folder){
      return tasks.filter( task => !task.removedDate &&
        ( task.folder._id === folder.value ||
          (folder.value === "important" && task.important) ||
          (
             "all" === folder.value &&
            task.assigned.some(assigned => assigned._id === userId)
           )
        )
      );
    }
    if (sidebarFilter){
      const notRemovedTasks = tasks.filter( task => !task.removedDate);
      const filteredByTitle = notRemovedTasks.filter( task => !sidebarFilter.title || task.name.toLowerCase().includes(sidebarFilter.title.toLowerCase()));
      const folderIds = sidebarFilter.folders;
      const filteredByFolders = filteredByTitle.filter( task => sidebarFilter.folders.length === 0 || folderIds.includes(task.folder._id));
      const filteredByImportant = filteredByFolders.filter(task => !sidebarFilter.important || task.important);
      const assignedIds = sidebarFilter.assigned;
      const filteredByAssigned = filteredByImportant.filter(task => sidebarFilter.assigned.length === 0 || task.assigned.some(user => assignedIds.includes(user._id) ) );
      const filteredByDatetimes = (sidebarFilter.datetimeMin || sidebarFilter.datetimeMax) ? filteredByAssigned.filter(task => {
        const actualDatetimeMin = sidebarFilter.datetimeMin ? sidebarFilter.datetimeMin : 0;
        const actualDatetimeMax = sidebarFilter.datetimeMax ? sidebarFilter.datetimeMax : 8640000000000000;
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
      const filteredByDateCreated = filteredByDatetimes.filter(task => (!sidebarFilter.dateCreatedMin || sidebarFilter.dateCreatedMin <= task.dateCreated) && (!sidebarFilter.dateCreatedMax || task.dateCreated <= sidebarFilter.dateCreatedMax));
      return filteredByDateCreated;
    }
    return [];
  }, [ tasks, folder, userId, sidebarFilter ] );

  const searchedTasks = useMemo( () => {
    return filteredTasks.filter( task => task.name.toLowerCase().includes( search.toLowerCase() ) );
  }, [ search, filteredTasks ] );

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

  if ( !folder && !filter  ) {
    return <Loader />;
  }

  if ( window.innerWidth <= 820 || layout === PLAIN ) {
    return (
      <TasksList
          {...props}
          activeTasks={activeTasks}
          closedTasks={closedTasks}
          removedTasks={removedTasks}
          folder={folder}
          />
    );
  }

  if ( layout === CALENDAR ) {
    return (
      <Calendar
          {...props}
          tasksWithAdvancedFilters={tasksWithAdvancedFilters}
          removedTasks={removedTasks}
          folder={folder}
          />
    );
  }

  if ( layout === DND ) {
    return (
      <Dnd
          {...props}
          sortedTasks={sortedTasks}
          removedTasks={removedTasks}
          subtasks={subtasks}
          comments={comments}
          folder={folder}
          />
    );
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "100%", position: "relative", padding: "20px 15px"}}>
        <TasksList
          {...props}
          activeTasks={activeTasks}
          closedTasks={closedTasks}
          removedTasks={removedTasks}
          folder={folder}
          />
      </div>
      <div style={{width: "50%", borderLeft: "1px solid #d6d6d6", height: "-webkit-fill-available", position: "relative",  padding: "5px 15px"}}>
        {
          chosenTask &&
          <EditTask {...props} taskId={chosenTask}/>
        }
        {
          !chosenTask &&
          <div style={{padding: "15px"}}><h2>No chosen task</h2> </div>
        }
      </div>
    </div>
  );
};
