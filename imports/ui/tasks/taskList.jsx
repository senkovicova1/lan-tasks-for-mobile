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

import { RestoreIcon, PlusIcon, CloseIcon, SettingsIcon } from  "/imports/other/styles/icons";

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
  const dbUsers = useSelector((state) => state.users.value);
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

    const removedTasks = useMemo(() => {
      if (folderID) {
        return tasks.filter(t => t.folder._id === folderID && t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
      }
      return tasks.filter(t => t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
    }, [tasks, folderID]);

  const removeTask = ( task ) => {
    if (removedTasks.length >= 5){
      let difference = removedTasks.length - 4;
      const idsToDelete = removedTasks.slice(4).map(t => t._id);
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
    TasksCollection.update( removedTasks[0]._id, {
      $set: {
        ...data
      }
    } );
  }

    const filteredTasks = useMemo(() => {
      return tasks.filter(task => (showClosed || !task.closed) && !task.removedDate && (!folderID || task.folder._id === folderID) && !task.folder.archived);
    }, [tasks, showClosed, folderID]);

    const assignedTasks = useMemo(() => {
      return filteredTasks.map(task => ({...task, assigned: dbUsers.find(u => u._id === task.assigned)}));
    }, [search, filteredTasks, dbUsers]);

    const searchedTasks = useMemo(() => {
      return assignedTasks.filter(task => task.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, assignedTasks]);

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
        editedTask &&
      <EditTaskContainer {...props} task={searchedTasks.find(task => task._id === editedTask)} close={() => setEditedTask(null)}/>
    }

      {
        sortedTasks.map((task) => (
              <ItemContainer
                key={task._id}
                >
                <Input
                  type="checkbox"
                  style={{
                    marginRight: "0.2em",
                  }}
                  checked={task.closed}
                  onChange={() => closeTask(task)}
                  />
                <span onClick={() => setEditedTask(task._id)}>
                  {task.name}
                </span>
                {
                  task.assigned &&
                  <img className="avatar" src={task.assigned.img} alt="assignedAvatar" />
                }
                <LinkButton
                  onClick={(e) => {e.preventDefault(); removeTask(task)}}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="Close icon not found"
                    />
                </LinkButton>
              </ItemContainer>
            ))
      }

      {
        folder &&
        <AddTaskContainer {...props} backgroundColor={folder.colour}/>
      }
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

        <LinkButton
          className="item"
          disabled={removedTasks.length === 0}
          onClick={(e) => {e.preventDefault(); restoreLatestTask()}}
          >
          <img
            className="icon"
            src={RestoreIcon}
            alt="Back icon not found"
            />
          {translations[language].restoreTask}
        </LinkButton>

      {
        (!match.params.folderID || match.params.folderID === "all") &&
        <FloatingButton
          onClick={() => history.push('/folders/add')}
          >
          <img
            className="icon"
            src={PlusIcon}
            alt="Plus icon not found"
            />
          <span>
          {translations[language].folder}
        </span>
        </FloatingButton>
      }

      {
        ( folder && folder.users.find(user => user._id === userId).admin ) &&
        <LinkButton
          className="item"
          onClick={(e) => {
            e.preventDefault();
            props.history.push(`/${folderID}/edit`);
          }}
          >
          <img
            className="icon"
            src={SettingsIcon}
            alt="Settings icon not found"
            />
          Folder
        </LinkButton>
      }

    </List>
  );
};
