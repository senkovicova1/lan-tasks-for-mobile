import React from 'react';
import moment from 'moment';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

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
} from '/imports/api/handlers/repeatsHandlers';

import {
  NO_CHANGE,
  ADDED,
  EDITED,
  DELETED
} from '/imports/other/constants';

import {
  ADD_TASK,
  ADD_AND_ASSIGN,
} from '/imports/other/messages';

export const addTask = ( name, assigned, folder, dateCreated, container, onSuccess, onFail ) => {
  Meteor.call(
    'tasks.addTask',
    name,
    assigned,
    folder,
    dateCreated,
    container,
    (err, response) => {
    if (err) {
      onFail(err);
    } else if (response) {
      Meteor.call(
        'history.addNewHistory',
        response,
        [ {
            dateCreated,
            user: assigned[0],
            type: ADD_TASK,
            args: [],
        } ]
      );
      onSuccess(response);
    }
  }
  );
}

export const addFullTask = ( createdBy, name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, repeat, folder, container, dateCreated, dbUsers, notifications, onSuccess, onFail ) => {

    var repeatId = null;
    if (repeat){
      Meteor.call(
        'repeats.addRepeat',
        repeat.intervalNumber,
        repeat.intervalFrequency,
        repeat.customInterval,
        repeat.useCustomInterval,
        repeat.repeatStart,
        repeat.repeatUntil,
        [],
        (error, response) => {
          if (error) {
            console.log(error);
          } else {
            repeatId = response;
          }
        }
      );
    }

    var newTaskId = null;

  Meteor.call(
    'tasks.addFullTask',
    name,
    important,
    assigned,
    startDatetime,
    endDatetime,
    hours,
    description,
    files,
    repeatId,
    folder,
    container,
    dateCreated,
    (err, response) => {
    if (err) {
      console.log(err);
    } else if (response) {
      const addedSubtasks = subtasks.filter( subtask => subtask.change === ADDED );

      addedSubtasks.forEach( ( subtask, i ) => {
        Meteor.call(
          "subtasks.addNewSubtask",
          subtask.name,
          subtask.closed,
          response,
          subtask.dateCreated
        )
      } );

      if (repeatId){
        Meteor.call(
          "repeats.setRepeatTasks",
          repeatId,
          [response]
        )
      }

      const historyData = {
        dateCreated,
        user: createdBy,
        type: ADD_TASK,
        args: [],
      };

      Meteor.call(
        'history.addNewHistory',
        response,
        [ historyData ]
      );

      assigned.filter(assigned => assigned !== createdBy).map(assigned => {
        let usersNotifications = notifications.find( notif => notif._id === assigned );
        const user = dbUsers.find(user => user._id === assigned);
        const notificationData = {
          ...historyData,
          type: ADD_AND_ASSIGN,
          read: false,
          args: [name],
          taskId: response,
          folderId: folder,
        }
        if (usersNotifications && usersNotifications.notifications.length > 0){
          Meteor.call(
            'notifications.editNotifications',
            assigned,
            user.email,
            notificationData,
            dbUsers
          )
        } else {
          Meteor.call(
            'notifications.addNewNotification',
            assigned,
            user.email,
            [
              notificationData
            ],
            dbUsers
          )
        }
      });

      onSuccess(response);
    }
    }
  );

}

export const writeHistoryAndSendNotifications = (
  userId,
  taskId,
  historyTypes,
  historyArgs,
  history,
  assignedUsers,
  notifications,
  notificationArgs,
  folderId,
  dbUsers,
) => {
  let historyDataArr = [];
  for (var i = 0; i < historyTypes.length; i++) {
    historyDataArr.push(
      {
        dateCreated: moment().unix(),
        user: userId,
        type: historyTypes[i],
        args: historyArgs[i],
      }
    )
  }
  writeHistory(taskId, historyDataArr, history);
  sendNotifications(taskId, userId, historyDataArr, notificationArgs, folderId, assignedUsers, notifications, dbUsers);
}

const writeHistory = (taskId, historyDataArr, history) => {
  if (history.length === 0){
    Meteor.call(
      'history.addNewHistory',
      taskId,
      historyDataArr
    );
  } else {
    for (var i = 0; i < historyDataArr.length; i++) {
      Meteor.call(
        'history.editHistory',
        history[0]._id,
        historyDataArr[i]
      )
    }
  }
}

const sendNotifications = (taskId, userId, historyDataArr, notificationArgs, folderId, assigned, notifications, dbUsers) => {
  if (assigned.length > 0){
    let notificationDataArr = [];
    for (var i = 0; i < historyDataArr.length; i++) {
      notificationDataArr.push({
          ...historyDataArr[i],
          args: notificationArgs[i],
          read: false,
          taskId,
          folderId,
        })
    };
    const userIds = assigned.filter(assigned => assigned._id !== userId).map(assigned => assigned._id);
    const assignedNotifications = NotificationsCollection.find(
      {
        _id: { $in: userIds }
      }
    ).fetch();
    assigned.filter(assigned => assigned._id !== userId).map(assigned => {
      let usersNotifications = assignedNotifications.find(notif => notif._id === assigned._id);
     if (usersNotifications.notifications.length > 0){
       for (var i = 0; i < notificationDataArr.length; i++) {
         Meteor.call(
           'notifications.editNotifications',
           assigned._id,
           assigned.email,
           notificationDataArr[i],
           dbUsers
         );
       }
      } else {
        Meteor.call(
          'notifications.addNewNotification',
          assigned._id,
          assigned.email,
          notificationDataArr,
           dbUsers
         );
      }
    })
  }
}

export const updateSimpleAttribute = ( taskId, userId, attribute, newValue, oldValue, changeType, taskName, history, assigned, folderId, notifications, dbUsers ) => {

  Meteor.call(
    'tasks.updateSimpleAttribute',
    taskId,
    {
      attribute: newValue
    }
  );

  const historyData = {
    dateCreated: moment().unix(),
    user: userId,
    type: changeType,
    args: [],
  };
  if (history.length === 0){
    Meteor.call(
      'history.addNewHistory',
      taskId,
      [
        historyData
      ]
    );
  } else {
    Meteor.call(
      'history.editHistory',
      history[0]._id,
      historyData
    )
  }
  if (assigned.length > 0){
    assigned.filter(assigned => assigned._id !== userId).map(assigned => {
      let usersNotifications = notifications.find( notif => notif._id === assigned._id );
      const notificationData = {
        ...historyData,
        args: [taskName],
        read: false,
        taskId,
        folderId,
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
  let data = {
    closed: !task.closed,
  };
  TasksCollection.update( task._id, {
    $set: {
      ...data
    }
  } );

  if (task.repeat){
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
      TasksCollection.insert({
          ...data
      }, (error, _id) => {
        if (error){
          console.log(error);
        } else {

          subtasks.filter( subtask => subtask.task === task._id ).forEach( ( subtask, i ) => {
            addNewSubtask( subtask.name, false, _id, moment().unix() );
          } );

          addRepeatTask(task.repeat._id, _id);
        }
      } );
    }
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
