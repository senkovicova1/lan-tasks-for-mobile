import React, {
  useMemo
} from 'react';
import {
  useTracker
} from 'meteor/react-meteor-data';

import {editTask} from './tasksHandlers';

import {
  translations
} from '/imports/other/translations.jsx';

import Form from './form';

export default function EditTaskContainer( props ) {

  const {
    task,
    setParentChosenTask,
    close,
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const onEditTask = (name, important, assigned, deadline, hours, description, subtasks, comments, files ) => {
    editTask(task._id, name, important, assigned, deadline, hours, description, subtasks, comments, files);
    setParentChosenTask({_id: task._id, name, important, assigned, deadline, hours, description, subtasks, comments, files});
    close();
  }

  return (
        <Form {...task} title={translations[language].editTask} match={props.match} onSubmit={onEditTask} language={language} onCancel={close}/>
  );
};
