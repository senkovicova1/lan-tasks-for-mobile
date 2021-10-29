import {
  Mongo
} from 'meteor/mongo';

export const RepeatsCollection = new Mongo.Collection( 'repeats' );