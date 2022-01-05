import React from 'react';

import { check } from 'meteor/check';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

import {
  CLOSED_STATUS,
  OPEN_STATUS,
  TITLE,
  IMPORTANT,
  NOT_IMPORTANT,
  CONTAINER,
  ASSIGNED,
  REMOVED_START_END,
  SET_START,
  SET_END,
  SET_HOURS,
  CHANGE_HOURS,
  DESCRIPTION,
  REMOVE_FILE,
  ADD_FILE,
  SUBTASK_CLOSED,
  SUBTASK_OPENED,
  REMOVE_SUBTASK,
  RENAME_SUBTASK,
  ADD_SUBTASK,
  ADD_COMMENT,
  EDIT_COMMENT,
  REMOVE_COMMENT,
 notificationTypes
} from '/imports/other/messages';

/*
type notiffication = {
date: unix,
message: string,
from: string,
read: bool,
taskId: string,
folderId: string,
}
*/

Meteor.methods({
  'notifications.addNewNotification'( userId, email, notifications, dbUsers) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    notifications.forEach((notification, i) => {

      const notificationType = notificationTypes.find(type => type.type === notification.type);
      let messageEn = notificationType.message['en'];
      let messageSk = notificationType.message['sk'];

      notification.args.forEach((arg, i) => {
        messageEn = messageEn.replace(`[${i}]`, arg);
        messageSk = messageSk.replace(`[${i}]`, arg);
      });
      const user = dbUsers.find(user => user._id === notification.user);
      const subject = "LanTasks Notifications";
      const object = `${user.label} ${messageEn}

        -----------------------------------------

${user.label} ${messageSk}
        `;
        NotificationsCollection.insert( {
          _id: userId,
          notifications
        } );

        Meteor.call(
        'sendEmail',
        `<${email}>`,
        'lan-task@webmon.sk',
        subject,
        object
        );
    });

  },

  'notifications.editNotifications'(notificationId, email, additionalNotification, dbUsers ) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

      const notificationType = notificationTypes.find(type => type.type === additionalNotification.type);
      let messageEn = notificationType.message['en'];
      let messageSk = notificationType.message['sk'];

      additionalNotification.args.forEach((arg, i) => {
        messageEn = messageEn.replace(`[${i}]`, arg);
        messageSk = messageSk.replace(`[${i}]`, arg);
      });

      const user = dbUsers.find(user => user._id === additionalNotification.user);
      const subject = "LanTasks Notifications";
      const object = `${user.label} ${messageEn}

        -----------------------------------------

${user.label} ${messageSk}
        `;
        NotificationsCollection.update( notificationId, {
          $push: {
            notifications: additionalNotification
          }
        } );

        Meteor.call(
        'sendEmail',
        `<${email}>`,
        'lan-task@webmon.sk',
        subject,
        object
        );


  },

  'notifications.markReadOne'(  userId, notification, allNotifications  ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const newNotifs = allNotifications.map( notif => {
      if ( notif.date === notification.date && notif.message === notification.message ) {
        return ( {
          ...notif,
          read: !notif.read,
        } );
      }
      return notif;
    } );

    NotificationsCollection.update( {
      _id: userId
    }, {
      $set: {
        notifications: newNotifs
      }
    } )
  },

  'notifications.markAllRead'( userId, allNotifications ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    const newNotifs = allNotifications.map( notif => ( {
      ...notif,
      read: true
    } ) );

    NotificationsCollection.update( {
      _id: userId
    }, {
      $set: {
        notifications: newNotifs
      }
    } )
  },

});
