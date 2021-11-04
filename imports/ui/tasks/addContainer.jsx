import React, {
  useMemo
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  NotificationsCollection
} from '/imports/api/notificationsCollection';

import {
  addFullTask
} from './tasksHandlers';

import {
  addNewHistory
} from './historyHandlers';

import {
  addNewNotification,
  editNotifications
} from '/imports/ui/other/notificationsHandlers';

import Form from './form';

import {
  translations
} from '/imports/other/translations.jsx';

export default function AddTaskContainer( props ) {

  const {
    match,
    startDatetime,
    endDatetime,
    close,
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const addNewTask = ( name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, folder, dateCreated ) => {

    Meteor.call(
      'tasks.addFullTask',
      name,
      important,
      assigned,
      startDatetime,
      endDatetime,
      hours,
      description,
      subtasks,
      comments,
      files,
      folder,
      dateCreated,
      ( _id ) => {
        Meteor.call(
          'history.addNewHistory',
          _id,
          [ {
            dateCreated,
            user: user._id,
            message: "created this task!",
          } ]
        );
            assigned.filter(assigned => assigned !== userId).map(assigned => {
              let usersNotifications = NotificationsCollection.findOne( {
                _id: assigned,
              } );
             if (usersNotifications.notifications.length > 0){
               Meteor.call(
                 'notifications.editNotifications',
                 assigned,
                 {
                  date: dateCreated,
                  from: user._id,
                  message: `created task ${name} and assigned it to you!`,
                  read: false,
                  taskId: _id,
                  folderId: folder,
                }
              )
              } else {
                Meteor.call(
                  'notifications.addNewNotification',
                  assigned,
                  [{
                  date: dateCreated,
                  from: user._id,
                  message: `created task ${name} and assigned it to you!`,
                  read: false,
                  taskId: _id,
                  folderId: folder,
                }]
              )
              }
            });
      },
      ( error ) => {
        console.log( error );
      }
    );

    close();
  }

  return (
        <Form
          title={translations[language].addTask}
          match={match}
          startDatetime={startDatetime}
          endDatetime={endDatetime}
          language={language}
          addNewTask={addNewTask}
          onCancel={close}
          />
  );
};
