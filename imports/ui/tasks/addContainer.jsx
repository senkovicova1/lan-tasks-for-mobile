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

import Form from './form';

import {
  addFullTask
} from '/imports/api/handlers/tasksHandlers';

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

  const addNewTask = ( name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, newRepeat, folder, container, dateCreated, onSuccess ) => {

    addFullTask(user._id, name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, oldRepeat, newRepeat, folder, container, dateCreated, dbUsers, notifications, onSuccess);

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
