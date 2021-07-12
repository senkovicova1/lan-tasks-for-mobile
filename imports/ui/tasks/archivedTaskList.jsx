import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import moment from 'moment';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  translations
} from '../../other/translations.jsx';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  TasksCollection
} from '/imports/api/tasksCollection';

import AddTaskContainer from './addTaskContainer';
import EditTaskContainer from './editTaskContainer';

import {
  List,
  SearchSection,
  Input,
  ItemContainer,
  LinkButton
} from "../../other/styles/styledComponents";

export default function ArchivedTaskList( props ) {

  const {
    match,
    history
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ showClosed, setShowClosed ] = useState(false);

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const findFolder = match.params.folderID;
    const tasks = useTracker( () => TasksCollection.find( findFolder ? {
        folder: findFolder
      } : {} )
      .fetch() );

    const folders = useTracker( () => FoldersCollection.find( {
        _id: findFolder
      } ).fetch() );

  const joinedTasks = useMemo( () =>
    tasks.map( task => ( {
      ...task,
      folder: folders.find( folder => folder._id === task.folder ),
    } ) ), [ tasks, folders ] );

    const filteredTasks = useMemo(() => {
      return joinedTasks.filter(task => (showClosed || !task.closed) && !task.removedDate && task.folder.users.find(user => user._id === userId));
    }, [joinedTasks]);

    const searchedTasks = useMemo(() => {
      return filteredTasks.filter(task => task.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, filteredTasks]);

    const sortedTasks = useMemo(() => {
      return searchedTasks.sort((t1, t2) => (t1.dateCreated < t2.dateCreated ? 1 : -1));
    }, [searchedTasks]);


  return (
    <List>

      <SearchSection>
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Icon iconName="Zoom"/>
      </SearchSection>

      {
        searchedTasks.map((task) => <ItemContainer
          key={task._id}
          style={{backgroundColor: task.folder.colour}}
          >
          <Input
            type="checkbox"
            style={{
              marginRight: "0.2em",
              width: "1.5em"
            }}
            checked={task.closed}
            disabled={true}
            />
          <span>
          {task.name}
        </span>
        </ItemContainer>
      )
    }
    <hr/>
          <section className="showClosed"  key="allStatuses" >
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
            <label htmlFor="allStatuses" style={{color: "#0078d4"}}>{translations[language].showClosed}</label>
          </section>

          {
          (  folders[0].users.find(user => user._id === userId).admin )&&
          <LinkButton onClick={(e) => {
              e.preventDefault();
              props.history.push(`/${folders[0]._id}/edit`);
            }}>
          <Icon iconName="Settings"/> Folder
        </LinkButton>
      }

  </List>
  );
};
