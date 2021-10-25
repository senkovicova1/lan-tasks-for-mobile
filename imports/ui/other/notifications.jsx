import React, {
  useMemo
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

import {
  Notifications
} from '/imports/other/styles/styledComponents';

export default function NotificationsList( props ) {

  const {
    setOpenNotifications,
  } = props;

  const {
    notifications
  } = useSelector( ( state ) => state.notifications.value );
    const dbUsers = useSelector( ( state ) => state.users.value );

      const mappedNotifications = useMemo(() => {
        if ((notifications && notifications.length === 0) || ( dbUsers && dbUsers.length === 0)){
          return [];
        }
        return notifications.map(notif => ({...notif, from: dbUsers.find(user => user._id === notif.from)}));
      }, [notifications, dbUsers]);

  return (
    <Notifications>
      <h2>Notifications</h2>
      {
        mappedNotifications.map(notif => (
          <p className={"notification" + (notif.read ? " read" : " unread")} key={notif.dateCreated}>
            <p>{`${moment.unix(notif.date).format("D.M.YYYY HH:mm:ss")}`}</p>
            <p>{`${notif.from.label} ${notif.message}`}</p>
          </p>
        ))
      }
    </Notifications>
  );
};
