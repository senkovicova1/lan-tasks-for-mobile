import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import moment from 'moment';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import Switch from "react-switch";
import {
  selectStyle
} from '../../other/styles/selectStyles';
import {
  translations
} from '../../other/translations.jsx';

import { RestoreIcon, PlusIcon, CloseIcon, SettingsIcon, UserIcon } from  "/imports/other/styles/icons";

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
  const [ sortBy, setSortBy ] = useState("");
  const [ sortDirection, setSortDirection ] = useState("");

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
    return tasks.filter(task => !task.removedDate && (!folderID || task.folder._id === folderID) && !task.folder.archived && (folderID || task.assigned === userId));
  }, [tasks, folderID, userId]);

  const assignedTasks = useMemo(() => {
    return filteredTasks.map(task => ({...task, assigned: dbUsers.find(u => u._id === task.assigned)}));
  }, [search, filteredTasks, dbUsers]);

  const searchedTasks = useMemo(() => {
    return assignedTasks.filter(task => task.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, assignedTasks]);

  const sortedTasks = useMemo(() => {
      const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
      return searchedTasks
      .sort((t1, t2) => {
        if (sortBy === "assigned"){
          return t1.assigned.label.toLowerCase() < t2.assigned.label.toLowerCase() ? 1*multiplier : (-1)*multiplier;
        }
        if (sortBy === "date"){
          return t1.dateCreated < t2.dateCreated ? 1*multiplier : (-1)*multiplier;
        }
          return t1.name.toLowerCase() < t2.name.toLowerCase() ? 1*multiplier : (-1)*multiplier;

      });
  }, [searchedTasks, sortBy, sortDirection]);

  const activeTasks = useMemo(() => {
    return sortedTasks.filter(task => !task.closed);
  }, [sortedTasks, sortBy, sortDirection]);

  const closedTasks = useMemo(() => {
    if (showClosed){
      return sortedTasks.filter(task => task.closed);
    }
    return [];
  }, [sortedTasks, showClosed, sortBy, sortDirection]);

  return (
    <List>

      <div className="sort">
        <label htmlFor="sort">Sort by</label>
        <select  className="sort-by" id="sort" name="sort" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
          <option value="name">name</option>
          <option value="assigned">assigned user</option>
          <option value="date">date created</option>
        </select>
        <select className="sort-direction" id="sort2" name="sort2" value={sortDirection} onChange={(e) => {setSortDirection(e.target.value)}}>
          <option value="asc">ascending</option>
          <option value="desc">descending</option>
        </select>
      </div>

      {
        activeTasks.length === 0 &&
        <span className="message">You have no open tasks.</span>
      }

      {
        editedTask &&
        <EditTaskContainer {...props} task={activeTasks.find(task => task._id === editedTask)} close={() => setEditedTask(null)}/>
      }

      {
        activeTasks.map((task) => (
          <ItemContainer
            key={task._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              style={{
                marginRight: "0.2em",
              }}
              checked={task.closed}
              onChange={() => closeTask(task)}
              />
            <span htmlFor={`task_name ${task._id}`} onClick={() => setEditedTask(task._id)}>
              {task.name}
            </span>
            {
              task.assigned &&
              task.assigned.img &&
              <img className="avatar" src={task.assigned.img} alt="" title={task.assigned.label}/>
            }
            {
              task.assigned &&
              !task.assigned.img &&
              <img className="usericon" src={UserIcon} alt="" title={task.assigned.label}/>
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

        <hr style={{marginTop: "7px", marginBottom: "7px"}}/>

        <ItemContainer key="commands" >
          <Switch
            id="show-closed"
            name="show-closed"
            onChange={() => setShowClosed(!showClosed)}
            checked={showClosed}
            onColor="#0078d4"
            uncheckedIcon={false}
            checkedIcon={false}
            style={{
              marginRight: "0.2em",
              display: "none"
            }}
            />
          <span htmlFor="show-closed">
            {translations[language].showClosed}
          </span>
        </ItemContainer>

        {
          showClosed &&
          closedTasks.length === 0 &&
          <span className="message">You have no closed tasks.</span>
        }

      {
        closedTasks.map((task) => (
          <ItemContainer
            key={task._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              style={{
                marginRight: "0.2em",
              }}
              checked={task.closed}
              onChange={() => closeTask(task)}
              />
            <span htmlFor={`task_name ${task._id}`} onClick={() => setEditedTask(task._id)}>
              {task.name}
            </span>
            {
              task.assigned &&
              task.assigned.img &&
              <img className="avatar" src={task.assigned.img} alt="" title={task.assigned.label}/>
            }
            {
              task.assigned &&
              !task.assigned.img &&
              <img className="usericon" src={UserIcon} alt="" title={task.assigned.label}/>
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
        removedTasks.length > 0 &&
        <div  style={{}}>
        <FloatingButton
          left
          onClick={(e) => {e.preventDefault(); restoreLatestTask()}}
          >
          <img
            className="icon"
            src={RestoreIcon}
            alt="Back icon not found"
            />
          <span>
          {translations[language].restoreTask}
        </span>
        </FloatingButton>
      </div>
      }

      {
        (!match.params.folderID || match.params.folderID === "all") &&
        <div  style={{}}>
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
      </div>
      }

      {
        folder &&
        <AddTaskContainer {...props} backgroundColor={folder.colour}/>
      }

    </List>
  );
};
