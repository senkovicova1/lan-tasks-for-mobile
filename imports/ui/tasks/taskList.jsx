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
  ItemContainer,
  LinkButton,
  FloatingButton
} from "../../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match,
    history
  } = props;

  const [ search, setSearch ] = useState( "" );
  const [ editTask, setEditTask ] = useState( null );
  const [ showClosed, setShowClosed ] = useState(false);

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

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
        difference -= 1;
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
        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Icon iconName="Zoom"/>
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
        <ItemContainer
          key={task._id}
          style={task.folder.colour && !findFolder  ? {backgroundColor: task.folder.colour} : {}}
          >
          <Input
            type="checkbox"
            style={{
              marginRight: "0.2em",
              width: "1.5em"
            }}
            checked={task.closed}
            onChange={() => closeTask(task)}
            />
          <span onClick={() => setEditTask(task._id)}>
          {task.name}
        </span>
            <LinkButton onClick={(e) => {e.preventDefault(); removeTask(task)}}><Icon iconName="Cancel"/></LinkButton>
        </ItemContainer>
      )
      }
      }
      )
    }

    {
      findFolder &&
      <AddTaskContainer {...props} backgroundColor={folders[0].colour}/>
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
      findFolder &&
      <LinkButton disabled={deletedTasksInFolder.length === 0} onClick={(e) => {e.preventDefault(); restoreLatestTask()}}><Icon iconName="Refresh"/>{translations[language].restoreTask}</LinkButton>
    }

{ match.params.folderID === "all" &&
    <FloatingButton onClick={() => history.push('/folders/add')}> <Icon iconName="Add"/> {translations[language].folder} </FloatingButton>
    }

      {
      ( findFolder && folders[0].users.find(user => user._id === userId).admin )&&
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
