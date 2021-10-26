import React from 'react';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

/*
type notiff = {
date: unix,
message: string,
from: string,
read: bool,
taskId: string,
folderId: string,
}
*/

export const addNewNotification = ( userId, notifications ) => {
  NotificationsCollection.insert( {
    _id: userId,
    notifications
  } );
};

export const editNotifications = ( notificationId, additionalNotifications ) => {
  NotificationsCollection.update( notificationId, {
    $push: {
      notifications: additionalNotifications
    }
  } )
};

export const markReadOne = ( userId, notification, allNotifications ) => {
  const newNotifs = allNotifications.map( notif => {
    if ( notif.date === notification.date && notif.message === notification.message ) {
      return ( {
        ...notif,
        read: true
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
};

export const markAllRead = ( userId, allNotifications ) => {
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
};