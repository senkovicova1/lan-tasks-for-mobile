import React, {
  useMemo
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import moment from 'moment';

import {
  markReadOne,
  markAllRead
} from './notificationsHandlers';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import {
  Input,
  LinkButton,
  Notifications,
} from '/imports/other/styles/styledComponents';

export default function NotificationsList( props ) {

  const dispatch = useDispatch();

  const {
    history,
    setOpenNotifications,
  } = props;

  const userId = Meteor.userId();

  const {
    notifications
  } = useSelector( ( state ) => state.notifications.value );
    const dbUsers = useSelector( ( state ) => state.users.value );

    const mappedNotifications = useMemo(() => {
      if (!notifications || (notifications && notifications.length === 0) || !dbUsers || ( dbUsers && dbUsers.length === 0)){
        return [];
      }
      return notifications.map(notif => ({...notif, from: dbUsers.find(user => user._id === notif.from)})).reverse();
    }, [notifications, dbUsers]);

  return (
    <Notifications>
      <div className="header">
      <h2>
        Notifications
      </h2>
      <LinkButton
        fit={true}
        className="left"
        onClick={() => {markAllRead(userId, notifications)}}
        >
        Mark as read
      </LinkButton>
    </div>
      {
        mappedNotifications.map(notification => (
          <div
            className="notification"
            key={notification.date + notification.message}
            onClick={() => {
              dispatch(setChosenTask(notification.taskId));
              history.push("/all/list");
            }}
            >
            <p>
              <Input
                type="checkbox"
                checked={notification.read}
                onChange={() => {
                      e.preventDefault();
                      markReadOne(userId, notification, notifications);
                      e.stopPropagation();
                    }}
                />
              <span>
                {`${moment.unix(notification.date).format("D.M.YYYY HH:mm:ss")}`}
              </span>
            </p>
            <p>{`${notification.from.label} ${notification.message}`}</p>
          </div>
        )

        )
      }
    </Notifications>
  );
};
