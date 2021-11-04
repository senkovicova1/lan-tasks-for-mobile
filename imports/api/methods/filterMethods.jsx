import React from 'react';

import { check } from 'meteor/check';

import {
  FiltersCollection
} from '/imports/api/filtersCollection';

Meteor.methods({
  'filters.addFilter'( name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, onSuccess, onFail) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

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
  },

  'filters.editFilter'( _id, name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, onSuccess, onFail ) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

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
  },

  'filters.removeFilter'( _id ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    FiltersCollection.remove( {
      _id
    } );
  },

});
