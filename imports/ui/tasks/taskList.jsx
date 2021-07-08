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
/*
import {
  UsersCollection
} from '/imports/api/usersCollection';*/

import AddTaskContainer from './addTaskContainer';
import EditTaskContainer from './editTaskContainer';

import {
  List,
  SearchSection,
  Input,
  LinkButton
} from "../../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ editTask, setEditTask ] = useState( null );
  const [ showClosed, setShowClosed ] = useState(false);

  const userId = Meteor.userId();

  const findFolder = match.params.folderID === 'all' ? null : match.params.folderID;
    const tasks = useTracker( () => TasksCollection.find( findFolder ? {
        folder: findFolder
      } : {} )
      .fetch() );
    const folders = useTracker( () => FoldersCollection.find( findFolder ? {
        _id: findFolder
      } : {} ).fetch() );

  const closeTask = (task) => {
    let data = {
      closed: !task.closed,
    };
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );
  }


    const deletedTasksInFolder = useMemo(() => {
      return tasks.filter(t => t.folder === findFolder && t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
    }, [tasks, findFolder]);

  const removeTask = ( task ) => {
    if (deletedTasksInFolder.length >= 5){
      let difference = deletedTasksInFolder.length - 4;
      const idsToDelete = deletedTasksInFolder.slice(4).map(t => t._id);
      while (difference > 0) {
        TasksCollection.remove( {
          _id: idsToDelete[difference - 1]
        } );
      }
    }

    let data = {
      removedDate: moment().unix(),
    };
    TasksCollection.update( task._id, {
      $set: {
        ...data
      }
    } );
  }

  const restoreLatestTask = () => {
    let data = {
      removedDate: null,
    };
    TasksCollection.update( deletedTasksInFolder[0]._id, {
      $set: {
        ...data
      }
    } );

  }

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

      {
        searchedTasks.map((task) => {
          if (editTask === task._id){
            return (
              <div
                key={task._id}
                >
              <EditTaskContainer {...props} task={task} close={() => setEditTask(null)}/>
            </div>
            )
          } else {
            return (
        <div
          key={task._id}
          style={task.folder.colour ? {backgroundColor: task.folder.colour} : {}}
          >
          <Input
            type="checkbox"
            style={{
              marginRight: "0.2em"
            }}
            checked={task.closed}
            onChange={() => closeTask(task)}
            />
          <span onClick={() => setEditTask(task._id)}>
          {task.name}
        </span>
            <LinkButton onClick={(e) => {e.preventDefault(); removeTask(task)}}><Icon iconName="Delete"/></LinkButton>
        </div>
      )
      }
      }
      )
    }

    {
      findFolder &&
      <LinkButton disabled={deletedTasksInFolder.length === 0} onClick={(e) => {e.preventDefault(); restoreLatestTask()}}>Restore task</LinkButton>
    }

    {
      findFolder &&
      <AddTaskContainer {...props}/>
    }

  </List>
  );
};
