import React, {
  useMemo
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import moment from 'moment';

import {
  TasksCollection
} from '/imports/api/tasksCollection';

import {
  setChosenTask,
  setLayout
} from '/imports/redux/metadataSlice';

import {
 DND,
 PLAIN
} from '/imports/other/constants';

import {
  Input,
  LinkButton,
  Notifications,
} from '/imports/other/styles/styledComponents';

import {
  CLOSED_STATUS,
  OPEN_STATUS,
  TITLE,
  IMPORTANT,
  NOT_IMPORTANT,
  CONTAINER,
  ASSIGNED,
  REMOVED_START_END,
  SET_START,
  SET_END,
  SET_HOURS,
  CHANGE_HOURS,
  DESCRIPTION,
  REMOVE_FILE,
  ADD_FILE,
  SUBTASK_CLOSED,
  SUBTASK_OPENED,
  REMOVE_SUBTASK,
  RENAME_SUBTASK,
  ADD_SUBTASK,
  ADD_COMMENT,
  EDIT_COMMENT,
  REMOVE_COMMENT,
 notificationTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function NotificationsList( props ) {

  const dispatch = useDispatch();

  const {
    history,
    setOpenNotifications,
    tasksHandlerReady
  } = props;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
    const language = useMemo( () => {
      if (dbUsers.length > 0){
      return dbUsers.find( user => user._id === userId ).language;
    }
    return "en";
    }, [ userId, dbUsers ] );

    const {
      layout
    } = useSelector( ( state ) => state.metadata.value );
  const {
    notifications
  } = useSelector( ( state ) => state.notifications.value );

  const { tasks, tasksLoading } = useTracker(() => {

    let tasks = [];
    let tasksLoading = true;

    const noDataAvailable = { tasks, tasksLoading };

    if ( !tasksHandlerReady ) {
          return noDataAvailable;
    }

      const fields = {
        name: 1,
      };
      const taskIds = notifications.map(notif => notif.taskId);
      tasks = TasksCollection.find(
        {
          _id: { $in: taskIds }
        },
        {
          fields
        }
      ).fetch();

    tasksLoading = false;

    return { tasks, tasksLoading};
  });

    const mappedNotifications = useMemo(() => {
      const taskIds = notifications.map(notif => notif.taskId);
      if (!notifications || (notifications && notifications.length === 0) || !dbUsers || ( dbUsers && dbUsers.length === 0) || (taskIds > 0 && tasks.length === 0 )){
        return [];
      }
      return notifications.map(notif => {

        const notificationType = notificationTypes.find(type => type.type === notif.type);
        let message = notificationType.message[language];

        notif.args.forEach((arg, i) => {
          message = message.replace(`[${i}]`, arg);
        });


        const fromIndex = message.indexOf( language === "en" ? 'the task' : " úloh");
        let taskNameStart = message.indexOf("'", fromIndex);
        let taskNameEnd = message.indexOf("'", taskNameStart + 1);


        if (message.slice(taskNameStart + 1 , taskNameStart + 5) === "id__"){
          const taskId = message.slice(taskNameStart + 5, message.indexOf("__id"));
          let taskName = tasks.find(task => task._id === taskId)?.name;
          if (!taskName){
            taskName = "Untitled";
          }
          message = message.replace(`id__${taskId}__id`, taskName);
          taskNameStart = message.indexOf("'", fromIndex);
          taskNameEnd = message.indexOf("'", taskNameStart + 1);
        }

        const user = dbUsers.find(user => user._id === notif.user);
        return ({
        ...notif,
        note: <p>
        {`${user.label} ${message.slice(0, taskNameStart)}`}
         <span
           className="link"
           onClick={() => {
             dispatch(setChosenTask(notif.taskId));
             if (layout === DND){
               dispatch(setLayout(PLAIN));
             }
             history.push("/all/list");
           }}
           >
           {message.slice(taskNameStart, taskNameEnd + 1)}
         </span>
         {message.slice(taskNameEnd + 1)}
       </p>
      })
    }

  ).reverse();
    }, [notifications, dbUsers]);

  return (
    <Notifications>
      <div className="header">
      <h2>
        {translations[language].notifications}
      </h2>
      <LinkButton
        fit={true}
        className="left"
        onClick={() => {
          Meteor.call(
            'notifications.markAllRead',
            userId,
            notifications
          )
        }}
        >
          {translations[language].markRead}
      </LinkButton>
    </div>
      {
        mappedNotifications.map((notification, index) => (
          <div
            className="notification"
            key={notification.date + notification.type + index}
            >
            <p>
              <span>
                {`${moment.unix(notification.dateCreated).format("D.M.YYYY HH:mm:ss")}`}
              </span>
              <Input
                type="checkbox"
                checked={notification.read}
                onChange={() => {
                  Meteor.call(
                    'notifications.markReadOne',
                    userId,
                    notification,
                    notifications
                  )
                }}
                onClickCapture={(e) => {
                  e.stopPropagation();
                }}
                />
            </p>
            {notification.note}
          </div>
        )

        )
      }
    </Notifications>
  );
};
