import React, {
  useMemo
} from 'react';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {addNewSubtask, editSubtask, removeSubtask} from './subtasksHandlers';
import {addNewComment, editComment, removeComment} from './commentsHandlers';
import {
  translations
} from '../../other/translations.jsx';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import TaskForm from './taskForm';

const NO_CHANGE = 0;
const ADDED = 1;
const EDITED = 2;
const DELETED = 3;

export default function EditTaskContainer( props ) {

  const {
    task,
    close
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const editTask = ( name, important, assigned, deadline, hours, description, subtasks, comments, files ) => {
    let data = {name, important, assigned, deadline, hours, description, files};
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );
    const addedSubtasks = subtasks.filter(subtask => subtask.change === ADDED);
    const editedSubtasks = subtasks.filter(subtask => subtask.change === EDITED);
    const deletedSubtasks = subtasks.filter(subtask => subtask.change === DELETED);

    addedSubtasks.forEach((subtask, i) => {
      addNewSubtask(subtask.name, subtask.closed, subtask.task, subtask.dateCreated);
    });

    editedSubtasks.forEach((subtask, i) => {
      editSubtask(subtask._id, subtask.name, subtask.closed, subtask.task, subtask.dateCreated);
    });

    deletedSubtasks.forEach((subtask, i) => {
      removeSubtask(subtask._id);
    });

    const addedComments = comments.filter(comment => comment.change === ADDED);
    const editedComments = comments.filter(comment => comment.change === EDITED);
    const deletedComments = comments.filter(comment => comment.change === DELETED);

    addedComments.forEach((comment, i) => {
      addNewComment(comment.author, comment.task, comment.dateCreated, comment.body);
    });

    editedComments.forEach((comment, i) => {
      editComment(comment._id, comment.author, comment.task, comment.dateCreated, comment.body);
    });

    deletedComments.forEach((comment, i) => {
      removeComment(comment._id);
    });

    close();
  }


  return (
    <Modal isOpen={true}>
      <ModalBody>
        <h1 style={{fontSize: "2em"}}>{translations[language].editTask}</h1>
        <TaskForm {...task} {...props} onSubmit={editTask} onCancel={close} language={language}/>
      </ModalBody>
    </Modal>
  );
};
