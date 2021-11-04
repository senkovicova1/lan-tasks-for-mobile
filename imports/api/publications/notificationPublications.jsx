import React from 'react';

import { check } from 'meteor/check';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

Meteor.publish('notifications', function publishNotifications() {
  return NotificationsCollection.find( {} );
});
