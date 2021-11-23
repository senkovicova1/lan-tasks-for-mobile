import React from 'react';

import moment from 'moment';

import {
 historyEntryTypes
} from '/imports/other/messages';

export default function History( props ) {

  const {
    mappedHistory,
    history,
    language
  } = props;

  return (
      <section>
        {
            history.length === 0 &&
            <span>No changes have been made yet.</span>
        }
        {
          history.length > 0 &&
          mappedHistory.map((change, index) => {
            const historyEntry = historyEntryTypes.find(entry => entry.type === change.type);
            let message = historyEntry.message[language];
            change.args.forEach((arg, i) => {
              message = message.replace(`[${i}]`, arg);
            });
            return (
            <div className="history" key={change.dateCreated + "" + index}>
              <p>{`${moment.unix(change.dateCreated).format("D.M.YYYY HH:mm:ss")}`}</p>
              <p>{`${change.user.label} ${message}`}</p>
            </div>
          )})
        }
      </section>
  );
};
