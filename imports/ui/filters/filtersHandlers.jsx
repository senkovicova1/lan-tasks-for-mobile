import React from 'react';

import {
  FiltersCollection
} from '/imports/api/filtersCollection';

export const addFilter = ( name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, onSuccess, onFail ) => {
  FiltersCollection.insert( {
    name,
    user,
    title,
    folders,
    important,
    assigned,
    datetimeMin,
    datetimeMax,
    dateCreatedMin,
    dateCreatedMax
  }, ( error, _id ) => {
    if ( error ) {
      onFail( error );
    } else {
      onSuccess();
    }
  } );
}

export const editFilter = ( _id, name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, onSuccess, onFail ) => {
  let data = {
    name,
    user,
    title,
    folders,
    important,
    assigned,
    datetimeMin,
    datetimeMax,
    dateCreatedMin,
    dateCreatedMax
  };
  FiltersCollection.update( _id, {
    $set: {
      ...data
    }
  }, (error) => {
    if ( error ) {
      onFail( error );
    } else {
      onSuccess();
    }    
  } );
}

export const removeFilter = ( _id ) => {
      FiltersCollection.remove( {
        _id
      } );
}
