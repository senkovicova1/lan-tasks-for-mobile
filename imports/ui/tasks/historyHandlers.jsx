import React from 'react';

import {
  HistoryCollection
} from '/imports/api/historyCollection';

/*
type change = {
dateCreated: unix,
user: _id,
message" string,
}
*/

export const addNewHistory = ( taskId, changes ) => {
  HistoryCollection.insert( {
    task: taskId,
    changes
  } );
};

export const editHistory = ( historyId, additionalChanges ) => {
  HistoryCollection.update( historyId, {
    $push: {
      changes: additionalChanges
     }
  } )
};
