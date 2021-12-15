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
  SubtasksCollection
} from '/imports/api/subtasksCollection';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import Form from './form';

import {
  translations
} from '/imports/other/translations.jsx';


export default function EditTaskContainer( props ) {

  const {
    taskId,
    close,
  } = props;

    const dbUsers = useSelector( ( state ) => state.users.value );
    const user = useTracker( () => Meteor.user() );
    const language = useMemo( () => {
      return user.profile.language;
    }, [ user ] );

    const folders = useSelector( ( state ) => state.folders.value );

  const { task, subtasks, comments, folder } = useTracker(() => {

    let task = null;
    let subtasks = [];
    let comments = [];

    const noDataAvailable = { task, subtasks, comments };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const tasksHandler = Meteor.subscribe('tasks');
    const subtasksHandler = Meteor.subscribe('subtasks');
    const commentsHandler = Meteor.subscribe('comments');

    if (!tasksHandler.ready() || !subtasksHandler.ready() || !commentsHandler.ready()) {
      return noDataAvailable;
    }

      task = TasksCollection.findOne({
          _id: taskId,
        });

        const folder = folders.active.find(f => f._id === task.folder);

        let newTask = {
          ...task,
          folder,
          repeat: null,
          container: task.container ? task.container : 0,
          assigned: []
        }
        if ( (Array.isArray(task.assigned) && task.assigned.length > 0) || task.assigned ) {
          const newAssigned = Array.isArray(task.assigned) ? dbUsers.filter( user => task.assigned.includes(user._id) ) : [dbUsers.find( user => user._id === task.assigned )];
          task = {
            ...newTask,
            assigned: newAssigned.length > 0 && newAssigned[0] ? newAssigned.sort((a1,a2) => a1.label.toLowerCase() > a2.label.toLowerCase() ? 1 : -1) : [
              {
                _id: "-1",
                label: "No assigned",
                value: "-1",
                img: UserIcon
              }
            ],
          };
        } else {
          task = newTask;
        }

      subtasks = SubtasksCollection.find({
        task: taskId,
      }).fetch();

      comments = CommentsCollection.find({
        task: taskId,
      }).fetch();


    return { task, subtasks, comments };
  });

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
      allSubtasks={subtasks}
      allComments={comments}
      history={history}
      title={translations[language].editTask}
      match={props.match}
      language={language}
      onCancel={close}
      />
  );
};
