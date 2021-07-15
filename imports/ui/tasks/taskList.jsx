import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import moment from 'moment';
import Select from 'react-select';
import { useSelector } from 'react-redux';
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
  TasksCollection
} from '/imports/api/tasksCollection';
import AddTaskContainer from './addTaskContainer';
import EditTaskContainer from './editTaskContainer';
import {
  List,
  ItemContainer,
  LinkButton,
  Input,
  FloatingButton
} from "../../other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match,
    history,
    search
  } = props;


  const [ editedTask, setEditedTask ] = useState( null );
  const [ showClosed, setShowClosed ] = useState(false);

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

    const folderID = !match.params.folderID || match.params.folderID === 'all' ? null : match.params.folderID;
    const folders = useSelector((state) => state.folders.value);
    const folder = useMemo(() => {
      const maybeFolder = folders.find(folder => folder._id === folderID);
      return  maybeFolder ? maybeFolder : null;
    }, [folders, folderID]);

  const tasks = useSelector((state) => state.tasks.value);

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
      return tasks.filter(t => t.folder._id === folderID && t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
    }, [tasks, folderID]);

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

    const filteredTasks = useMemo(() => {
      return tasks.filter(task => (showClosed || !task.closed) && !task.removedDate && (!folderID || task.folder._id === folderID) && !task.folder.archived);
    }, [tasks, showClosed]);

    const searchedTasks = useMemo(() => {
      return filteredTasks.filter(task => task.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, filteredTasks]);

    const sortedTasks = useMemo(() => {
      return searchedTasks.sort((t1, t2) => (t1.dateCreated < t2.dateCreated ? 1 : -1));
    }, [searchedTasks]);


  return (
    <List>
      {
        searchedTasks.length === 0 &&
        <span className="message">You have no open tasks.</span>
      }
      {
        searchedTasks.map((task) => {
          if (editedTask === task._id){
            return (
              <div key={task._id}>
                <EditTaskContainer {...props} task={task} close={() => setEditedTask(null)}/>
              </div>
            )
          } else {
            return (
              <ItemContainer
                key={task._id}
                style={{ backgroundColor: task.folder.colour}}
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
                <span onClick={() => setEditedTask(task._id)}>
                  {task.name}
                </span>
                <LinkButton onClick={(e) => {e.preventDefault(); removeTask(task)}}><Icon iconName="Cancel"/></LinkButton>
              </ItemContainer>
            )
          }
        })
      }

      {
        folder &&
        <AddTaskContainer {...props} backgroundColor={folder.colour}/>
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
        folder &&
        <LinkButton
          disabled={deletedTasksInFolder.length === 0}
          onClick={(e) => {e.preventDefault(); restoreLatestTask()}}
          >
          <Icon iconName="Refresh"/>
          {translations[language].restoreTask}
        </LinkButton>
      }

      {
        (!match.params.folderID || match.params.folderID === "all") &&
        <FloatingButton onClick={() => history.push('/folders/add')}>
          <Icon iconName="Add" style={{marginRight: "0.3em"}}/>
          <span>
          {translations[language].folder}
        </span>
        </FloatingButton>
      }

      {
        ( folder && folder.users.find(user => user._id === userId).admin ) &&
        <LinkButton onClick={(e) => {
            e.preventDefault();
            props.history.push(`/${folderID}/edit`);
          }}
          >
          <Icon iconName="Settings"/>
          Folder
        </LinkButton>
      }

    </List>
  );
};
