import {
  Mongo
} from 'meteor/mongo';

export const SubtasksCollection = new Mongo.Collection( 'subtasks' );