import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  List,
  SearchSection,
  Input
} from "../../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match
  } = props;

  const folders = useTracker( () => FoldersCollection.find( {} )
    .fetch() );

  const userId = Meteor.userId();

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);

  return (
    <List>

      <SearchSection>
        <Input width="30%" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <section key="allStatuses">
          <Input
            id="allStatuses"
            type="checkbox"
            name="allStatuses"
            style={{
              marginRight: "0.2em"
            }}
            checked={showClosed}
            onChange={() => setShowClosed(!showClosed)}
            />
          <label htmlFor="allStatuses">Show closed</label>
        </section>
      </SearchSection>


    </List>
  );
};
