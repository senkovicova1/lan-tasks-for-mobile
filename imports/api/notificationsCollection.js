import {
  Mongo
} from 'meteor/mongo';

export const NotificationsCollection = new Mongo.Collection( 'notifications' );