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
  editTask
} from './tasksHandlers';

import Form from './form';

import {
  translations
} from '/imports/other/translations.jsx';


export default function EditTaskContainer( props ) {

  const {
    taskId,
    setParentChosenTask,
    close,
  } = props;

  const tasks = useSelector( ( state ) => state.tasks.value );

  const user = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const onEditTask = ( name, important, assigned, deadline, hours, description, subtasks, comments, files ) => {
    editTask( task._id, name, important, assigned, deadline, hours, description, subtasks, comments, files );
    setParentChosenTask( {
      _id: task._id,
      name,
      important,
      assigned,
      deadline,
      hours,
      description,
      subtasks,
      comments,
      files
    } );
    close();
  }

  const task = useMemo( () => {
    return tasks.length > 0 ? tasks.find( task => task._id === taskId ) : {};
  }, [ taskId, tasks ] );

  return (
    <Form
      {...task}
      title={translations[language].editTask}
      match={props.match}
      setParentChosenTask={setParentChosenTask}
      onSubmit={onEditTask}
      language={language}
      onCancel={close}
      />
  );
};
