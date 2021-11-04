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

import '/imports/api/methods/commentMethods';
import '/imports/api/methods/filterMethods';
import '/imports/api/methods/folderMethods';
import '/imports/api/methods/historyMethods';
import '/imports/api/methods/notificationMethods';
import '/imports/api/methods/repeatMethods';
import '/imports/api/methods/subtaskMethods';
import '/imports/api/methods/taskMethods';

import '/imports/api/publications/commentPublications';
import '/imports/api/publications/folderPublications';
import '/imports/api/publications/filterPublications';
import '/imports/api/publications/historyPublications';
import '/imports/api/publications/notificationPublications';
import '/imports/api/publications/repeatPublications';
import '/imports/api/publications/subtaskPublications';
import '/imports/api/publications/taskPublications';
import '/imports/api/publications/userPublications';

Meteor.methods( {
  sendEmail( to, from, subject, text ) {
    console.log( "START SEND" );
    // Make sure that all arguments are strings.
    check( [ to, from, subject, text ], [ String ] );

    console.log( "CECK PASSED" );
    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();
    console.log( "UNLOCK" );
    Email.send( {
      to,
      from,
      subject,
      text
    } );
    console.log( "SEND END" );
  }
} );


Meteor.startup( () => {
  process.env.MAIL_URL = "smtp://lan-task@webmon.sk:ghx8R@3wRS@mail.webmon.sk:25";
} );