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

  const notifications = useSelector( ( state ) => state.notifications.value );
    const dbUsers = useSelector( ( state ) => state.users.value );

  const addNewTask = ( name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, newRepeat, folder, container, dateCreated ) => {

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
      oldRepeat,
      newRepeat,
      folder,
      container,
      dateCreated,
      notifications,
      dbUsers
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
