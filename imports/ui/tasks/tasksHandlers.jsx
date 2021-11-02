import React from 'react';
import moment from 'moment';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  addNewSubtask,
  editSubtask,
  removeSubtask
} from './subtasksHandlers';

import {
  addNewComment,
  editComment,
  removeComment
} from './commentsHandlers';

import {
 addRepeat,
 setRepeatTasks,
 addRepeatTask
} from '/imports/ui/repeats/repeatsHandlers';

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

export const addTask = ( name, assigned, folder, dateCreated, container, onSuccess, onFail ) => {
  TasksCollection.insert( {
    name,
    assigned,
    folder,
    dateCreated,
    closed: false,
    container
  }, ( error, _id ) => {
    if ( error ) {
      onFail( error );
    } else {
      onSuccess(_id);
    }
  } );
}

export const addFullTask = ( name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, repeat, folder, container, dateCreated, onSuccess, onFail ) => {

  let repeatId = null;
  if (repeat){
    addRepeat(
      repeat.intervalNumber,
      repeat.intervalFrequency,
      repeat.customInterval,
      repeat.useCustomInterval,
      repeat.repeatStart,
      repeat.repeatUntil,
      [],
      (_id) => { repeatId = _id;},
      (error) => console.log(error)
    );
  }

  let data = {
    name,
    important,
    assigned,
    startDatetime,
    endDatetime,
    hours,
    description,
    files,
    closed: false,
    folder,
    container,
    dateCreated,
    repeatId
  };
  TasksCollection.insert({
      ...data
  }, (error, _id) => {
    if (error){
      onFail(error);
    } else {
      const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );

      addedSubtasks.forEach( ( subtask, i ) => {
        addNewSubtask( subtask.name, subtask.closed, _id, subtask.dateCreated );
      } );

      if (repeatId){
        setRepeatTasks(repeatId, [_id]);
      }

      onSuccess(_id);
    }
  } );
}

export const updateSimpleAttribute = ( taskId, data ) => {
  TasksCollection.update( taskId, {
    $set: data
  } );
}

export const addRepeatToTask = (taskId, repeat) => {
  addRepeat(
    repeat.intervalNumber,
    repeat.intervalFrequency,
    repeat.customInterval,
    repeat.useCustomInterval,
    repeat.repeatStart,
    repeat.repeatUntil,
    [taskId],
    (_id) => {
      TasksCollection.update( taskId, {
        $set: {repeat: _id}
      } );
    },
    (error) => console.log(error)
  );
}

export const editTask = ( _id, name, important, assigned, deadline, hours, description, subtasks, comments, files, repeat ) => {
  let data = {
    name,
    important,
    assigned,
    deadline,
    hours,
    description,
    files,
  };
  TasksCollection.update( _id, {
    $set: {
      ...data
    }
  } );
  const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );
  const editedSubtasks = subtasks.filter( subtask => subtask.change === EDITED );
  const deletedSubtasks = subtasks.filter( subtask => subtask.change === DELETED );

  addedSubtasks.forEach( ( subtask, i ) => {
    addNewSubtask( subtask.name, subtask.closed, subtask.task, subtask.dateCreated );
  } );

  editedSubtasks.forEach( ( subtask, i ) => {
    editSubtask( subtask._id, subtask.name, subtask.closed, subtask.task, subtask.dateCreated );
  } );

  deletedSubtasks.forEach( ( subtask, i ) => {
    removeSubtask( subtask._id );
  } );

  const addedComments = comments.filter( comment => comment.change === ADDED );
  const editedComments = comments.filter( comment => comment.change === EDITED );
  const deletedComments = comments.filter( comment => comment.change === DELETED );

  addedComments.forEach( ( comment, i ) => {
    addNewComment( comment.author, comment.task, comment.dateCreated, comment.body );
  } );

  editedComments.forEach( ( comment, i ) => {
    editComment( comment._id, comment.author, comment.task, comment.dateCreated, comment.body );
  } );

  deletedComments.forEach( ( comment, i ) => {
    removeComment( comment._id );
  } );
}

export const closeTask = ( task, subtasks ) => {
  console.log("HIIII", task);
  let data = {
    closed: !task.closed,
  };
  TasksCollection.update( task._id, {
    $set: {
      ...data
    }
  } );

  console.log("HI");

  let addAmount = task.repeat.intervalNumber;
  let addTimeType = task.repeat.intervalFrequency;
  const newStartDatetime = moment(task.startDatetime*1000).add(addAmount, addTimeType).unix();
  if (!task.closed && task.repeat && (newStartDatetime <= task.repeat.repeatUntil || !repeatUntil)){

    let data = {
      name: task.name,
      important: task.important,
      assigned: task.assigned.map(user => user._id),
      startDatetime: newStartDatetime,
      endDatetime: moment(task.endDatetime*1000).add(addAmount, addTimeType).unix(),
      allDay: task.allDay,
      hours: task.hours,
      description: task.description,
      files: [...task.files],
      closed: false,
      folder: task.folder._id,
      container: 0,
      dateCreated: moment().unix(),
      repeat: task.repeat._id
    };
    console.log("INSERT");
    TasksCollection.insert({
        ...data
    }, (error, _id) => {
      console.log("EH");
      if (error){
        console.log(error);
      } else {

        subtasks.filter( subtask => subtask.task === task._id ).forEach( ( subtask, i ) => {
          addNewSubtask( subtask.name, false, _id, moment().unix() );
        } );

        console.log("ADD REP");
        addRepeatTask(task.repeat._id, _id);
      }
    } );
  }
}

export const restoreLatestTask = ( removedTasks ) => {
  let data = {
    removedDate: null,
  };
  TasksCollection.update( removedTasks[ 0 ]._id, {
    $set: {
      ...data
    }
  } );
}

export const removeTask = ( task, removedTasks, subtasks, comments, allTasks ) => {
  if ( removedTasks.length >= 5 ) {
    let difference = removedTasks.length - 4;
    const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
    const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
    const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
    while ( difference > 0 ) {
      TasksCollection.remove( {
        _id: idsToDelete[ difference - 1 ]
      } );
      if (task.repeat){
        removeTaskFromRepeat(task._id, task.repeat._id, allTasks);
      }
      subtasksToDelete.forEach( ( subtask, i ) => {
        removeSubtask( subtask._id );
      } );
      commentsToDelete.forEach( ( comment, i ) => {
        removeComment( comment._id );
      } );
      difference -= 1;
    }
  }

  let data = {
    removedDate: moment().unix(),
  };
  TasksCollection.update( task._id, {
    $set: {
      ...data
    }
  } );
}
