import React from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

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

const { DateTime } = require("luxon");

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
  emailArgs,
  folderId,
  dbUsers,
) => {
  let historyDataArr = [];
  for (var i = 0; i < historyTypes.length; i++) {
    historyDataArr.push(
      {
        dateCreated: parseInt(DateTime.now().toSeconds()),
        user: userId,
        type: historyTypes[i],
        args: historyArgs[i],
      }
    )
  }

  writeHistory(taskId, historyDataArr, history);
  sendNotifications(taskId, userId, historyDataArr, notificationArgs, emailArgs, folderId, assignedUsers, notifications, dbUsers);
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

const sendNotifications = (taskId, userId, historyDataArr, notificationArgs, emailArgs, folderId, assigned, notifications, dbUsers) => {
  if (assigned.length > 0){
    let notificationDataArr = [];
    for (var i = 0; i < historyDataArr.length; i++) {
      notificationDataArr.push({
          ...historyDataArr[i],
          args: notificationArgs[i],
          emailArgs: emailArgs[i],
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
     if (usersNotifications && usersNotifications.notifications && usersNotifications.notifications.length > 0){
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
