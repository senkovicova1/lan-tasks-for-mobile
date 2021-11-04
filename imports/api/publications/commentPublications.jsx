import React from 'react';

import { check } from 'meteor/check';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

Meteor.publish('comments', function publishComments() {
  return CommentsCollection.find( { } );
});
