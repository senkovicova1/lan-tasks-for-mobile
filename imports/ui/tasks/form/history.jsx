import React from 'react';

import {
 historyEntryTypes
} from '/imports/other/messages';

const { DateTime } = require("luxon");

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
            let message = change.type ? historyEntry.message[language] : historyEntryTypes.find(entry => entry.type === "add_task").message[language];
            change.args?.forEach((arg, i) => {
              message = message.replace(`[${i}]`, arg);
            });
            return (
            <div className="history" key={change.dateCreated + "" + index}>
              <p>{`${DateTime.fromSeconds(change.dateCreated).toFormat("dd.LL.y HH:mm")}`}</p>
              <p>{`${change.user.label} ${message}`}</p>
            </div>
          )})
        }
      </section>
  );
};
