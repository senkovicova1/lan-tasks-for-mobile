import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import moment from 'moment';

import {
  writeHistoryAndSendNotifications,
} from '/imports/api/handlers/tasksHandlers';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import {
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  List,
  FullButton,
  ItemContainer,
  LinkButton,
  Input,
  InlineInput,
  AppliedFilter
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

import {
  CLOSED_STATUS,
  OPEN_STATUS,
} from '/imports/other/messages';

export default function TaskList( props ) {

  const dispatch = useDispatch();

  const {
  task,
  chosenTask,
  removedTasks,
  subtasks,
  comments,
  history,
  userId,
  notifications,
  dbUsers
} = props;

  return (

          <ItemContainer
            key={task._id}
            active={chosenTask && task._id === chosenTask._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              checked={task.closed}
              onChange={() => {
                if (task.closed){

                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    task._id,
                    {
                      closed: false
                    }
                  );

                  let taskHistory = [history.find(entry => entry.task === task._id)];
                  if (taskHistory.length === 0){
                    taskHistory = [];
                  }

                  writeHistoryAndSendNotifications(
                    userId,
                    task._id,
                    [OPEN_STATUS],
                    [[]],
                    taskHistory,
                    task.assigned,
                    [],
                    [[`id__${task._id}__id`]],
                    task.folder._id,
                    dbUsers,
                  );

                } else {

                Meteor.call('tasks.closeTask', task, subtasks);

                let taskHistory = [history.find(entry => entry.task === task._id)];
                if (taskHistory.length === 0){
                  taskHistory = [];
                }

                writeHistoryAndSendNotifications(
                  userId,
                  task._id,
                  [CLOSED_STATUS],
                  [[]],
                  taskHistory,
                  task.assigned,
                  [],
                  [[`id__${task._id}__id`]],
                  task.folder._id,
                  dbUsers,
                );
              }
              }}
              />
            {
              task.important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
            {
              !task.important &&
              <img
                className="icon star"
                src={EmptyStarIcon}
                alt="Empty star icon not found"
                />
            }
            {
            task.repeat &&
              <img
                className="icon"
                style={{ marginLeft: "0.6em"}}
                src={RestoreIcon}
                alt="RestoreIcon not found"
                />
          }
            <span htmlFor={`task_name ${task._id}`} onClick={() => dispatch(setChosenTask(task._id))}>
              {task.name}
            </span>
            {
              task.assigned.map(assigned => (
                <img key={assigned._id} className="avatar" src={assigned.img} alt="" title={assigned.label}/>
              ))
            }
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                   if ( removedTasks.length >= 5 ) {
                      let difference = removedTasks.length - 4;
                      const idsToDelete = removedTasks.slice( 4 ).map( t => t._id );
                      const subtasksToDelete = subtasks.filter( subtask => idsToDelete.includes( subtask.task ) );
                      const commentsToDelete = comments.filter( comment => idsToDelete.includes( comment.task ) );
                      while ( difference > 0 ) {
                        Meteor.call('tasks.removeTask', idsToDelete[ difference - 1 ]);

                      if (task.repeat){
                            Meteor.call(
                              'repeats.removeTaskFromRepeat',
                              task._id,
                              task.repeat
                            )
                          }
                          difference -= 1;
                        }

                        subtasksToDelete.forEach( ( subtask, i ) => {
                          Meteor.call(
                            'subtasks.removeSubtask',
                            subtask._id
                          )
                        } );
                        commentsToDelete.forEach( ( comment, i ) => {
                          removeComment( comment._id );
                          Meteor.call(
                            'comments.removeComment',
                            comment._id
                          )
                        } );
                      }

                      let data = {
                        removedDate: moment().unix(),
                      };
                      Meteor.call(
                        "tasks.updateSimpleAttribute",
                        task._id,
                        data
                      );
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
          </ItemContainer>
  );
};
