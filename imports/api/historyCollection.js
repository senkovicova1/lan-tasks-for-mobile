import {
  Mongo
} from 'meteor/mongo';

export const HistoryCollection = new Mongo.Collection( 'history' );