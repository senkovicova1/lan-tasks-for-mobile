import {
  Meteor
} from 'meteor/meteor';
import {
  Accounts
} from 'meteor/accounts-base';
import {
  TasksCollection
} from '/imports/api/tasksCollection';
import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';
import {
  FiltersCollection
} from '/imports/api/filtersCollection';
import {
  CommentsCollection
} from '/imports/api/commentsCollection';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  HistoryCollection
} from '/imports/api/historyCollection';
import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';
import {
  UsersCollection
} from '/imports/api/usersCollection';
import {
  WebApp
} from 'meteor/webapp';


WebApp.rawConnectHandlers.use( function( req, res, next ) {
  res.setHeader( "Access-Control-Allow-Origin", "*" );
  return next();
} );