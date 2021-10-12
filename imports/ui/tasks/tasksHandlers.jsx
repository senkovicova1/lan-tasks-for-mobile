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
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

export const addTask = ( name, assigned, folder, dateCreated, onSuccess, onFail ) => {
  TasksCollection.insert( {
    name,
    assigned,
    folder,
    dateCreated,
    closed: false
  }, ( error, _id ) => {
    if ( error ) {
      onFail( error );
    } else {
      onSuccess();
    }
  } );
}

export const addFullTask = ( name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, folder, dateCreated ) => {
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
    dateCreated
  };
  TasksCollection.insert({
      ...data
  }, (error, _id) => {
    if (error){
      console.log(error);
    } else {
      const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );

      addedSubtasks.forEach( ( subtask, i ) => {
        addNewSubtask( subtask.name, subtask.closed, _id, subtask.dateCreated );
      } );
    }
  } );
}

export const editTask = ( _id, name, important, assigned, deadline, hours, description, subtasks, comments, files ) => {
  let data = {
    name,
    important,
    assigned,
    deadline,
    hours,
    description,
    files
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

export const updateSimpleAttribute = ( taskId, data ) => {
  TasksCollection.update( taskId, {
    $set: data
  } );
}

export const closeTask = ( task ) => {
  let data = {
    closed: !task.closed,
  };
  TasksCollection.update( task._id, {
    $set: {
      ...data
    }
  } );
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

export const removeTask = ( task, removedTasks, subtasks, comments ) => {
  if ( removedTasks.length >= 5 ) {
    let difference = removedTasks.length - 4;
    const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
    const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
    const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
    while ( difference > 0 ) {
      TasksCollection.remove( {
        _id: idsToDelete[ difference - 1 ]
      } );
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
