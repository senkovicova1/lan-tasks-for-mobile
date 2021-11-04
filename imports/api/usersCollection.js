import {
  Mongo
} from 'meteor/mongo';

Meteor.users.allow( {
  insert() {
    return true;
  },

  update() {
    return true;
  },
} );

if ( Meteor.isClient ) {
  Meteor.subscribe( 'users' )
}


if ( Meteor.isServer ) {
  Meteor.publish( 'users', function() {
    return Meteor.users.find( {}, {
      fields: {
        profile: 1,
        emails: 1
      }
    } )
  } )
}