import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

export const editContianers = ( containers, folderId ) => {
  FoldersCollection.update( folderId, {
    $set: {
      containers
    }
  } );
}
