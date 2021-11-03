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
  RepeatsCollection
} from '/imports/api/repeatsCollection';
import {
  UsersCollection
} from '/imports/api/usersCollection';
import {
  WebApp
} from 'meteor/webapp';

Meteor.methods( {
  sendEmail( to, from, subject, text ) {
    console.log( "START SEND" );
    // Make sure that all arguments are strings.
    check( [ to, from, subject, text ], [ String ] );

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    Email.send( {
      to,
      from,
      subject,
      text
    } );
  }
} );

Meteor.startup( () => {
  process.env.MAIL_URL = "smtp://lan-task:ghx8R@3wRS@webmon.sk:25";
} );

WebApp.rawConnectHandlers.use( function( req, res, next ) {
  res.setHeader( "Access-Control-Allow-Origin", "*" );
  return next();
} );