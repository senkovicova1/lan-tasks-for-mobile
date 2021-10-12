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
  addFullTask
} from './tasksHandlers';

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
    addFullTask(name, important, assigned, startDatetime, endDatetime, hours, description, subtasks, comments, files, folder, dateCreated);
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
