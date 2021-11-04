import React from 'react';

import { check } from 'meteor/check';

import {
  FiltersCollection
} from '/imports/api/filtersCollection';

Meteor.publish('filters', function publishFilters() {
  return FiltersCollection.find( { user: this.userId } );
});
