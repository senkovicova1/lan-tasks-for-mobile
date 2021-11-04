import React from 'react';

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

Meteor.publish('history', function publishHistory() {
  return HistoryCollection.find( { } );
});
