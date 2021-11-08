import React, {
  useMemo
} from 'react';

import {
  useSelector,
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  HistoryCollection
} from '/imports/api/historyCollection';

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
    close,
  } = props;

  const tasks = useSelector( ( state ) => state.tasks.value );

  const user = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const task = useMemo( () => {
    return tasks.length > 0 ? tasks.find( task => task._id === taskId ) : {};
  }, [ taskId, tasks ] );

  const { history } = useTracker(() => {
    const noDataAvailable = { history: []};
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const historyHandler = Meteor.subscribe('history');

    if (!historyHandler.ready()) {
      return { ...noDataAvailable };
    }

    const history = HistoryCollection.find(  {
      task: ( task ? task._id : null)
    }  ).fetch();

    return { history };
  });

  if (!task){
    return <div></div>;
  }

  return (
    <Form
      {...task}
      history={history}
      title={translations[language].editTask}
      match={props.match}
      language={language}
      onCancel={close}
      allTasks={tasks}
      />
  );
};
