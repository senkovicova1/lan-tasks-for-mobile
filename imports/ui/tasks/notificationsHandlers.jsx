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
