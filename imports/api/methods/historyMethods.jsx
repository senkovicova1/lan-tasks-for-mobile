import React from 'react';

import { check } from 'meteor/check';

import {
  HistoryCollection
} from '/imports/api/historyCollection';

/*
type change = {
dateCreated: unix,
user: _id,
type: [
CLOSED_STATUS,
  OPEN_STATUS,
  TITLE,
  IMPORTANT,
  NOT_IMPORTANT,
  CONTAINER,
  ASSIGNED,
  REMOVED_START_END,
  SET_START,
  SET_END,
  SET_HOURS,
  CHANGE_HOURS,
  DESCRIPTION,
  REMOVE_FILE,
  ADD_FILE,
  SUBTASK_CLOSED,
  SUBTASK_OPENED,
  REMOVE_SUBTASK,
  RENAME_SUBTASK,
  ADD_SUBTASK,
  ADD_COMMENT,
  EDIT_COMMENT,
 REMOVE_COMMENT
 ],
args: [string]
}
*/

Meteor.methods({
  'history.addNewHistory'( taskId, changes) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    HistoryCollection.insert( {
      task: taskId,
      changes
    } );
  },

  'history.editHistory'( historyId, additionalChanges ) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    HistoryCollection.update( historyId, {
      $push: {
        changes: additionalChanges
       }
    } )
  },

});
