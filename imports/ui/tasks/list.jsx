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
  Modal,
  ModalBody
} from 'reactstrap';
import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  selectStyle
} from '../../other/styles/selectStyles';
import {
  translations
} from '../../other/translations.jsx';
import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import { removeSubtask } from './subtasksHandlers';
import { removeComment } from './commentsHandlers';
import { addTask, closeTask, restoreLatestTask, removeTask } from './tasksHandlers';

import { RestoreIcon, PlusIcon, CloseIcon, SettingsIcon, UserIcon, SendIcon, FullStarIcon, EmptyStarIcon } from  "/imports/other/styles/icons";

import EditTask from './editContainer';
import {
  List,
  ItemContainer,
  LinkButton,
  Input,
  InlineInput,
  FloatingButton
} from "/imports/other/styles/styledComponents";

export default function TaskList( props ) {

  const {
    match,
    history,
    folder,
    setParentChosenTask,
    chosenTask
  } = props;

  const [ showClosed, setShowClosed ] = useState(false);
  const [ newTaskName, setNewTaskName ] = useState("");
  const [ openNewTask, setOpenNewTask ] = useState(false);

  const { folderID } = match.params;
  const { layout, search, sortBy, sortDirection } = useSelector( ( state ) => state.metadata.value );

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const dbUsers = useSelector((state) => state.users.value);
  const tasks = useSelector((state) => state.tasks.value);
  const subtasks = useSelector((state) => state.subtasks.value);
  const comments = useSelector((state) => state.comments.value);

  const removedTasks = useMemo(() => {
    if (folder._id) {
      return tasks.filter(t => t.folder._id === folder._id && t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
    }
    return tasks.filter(t => t.removedDate).sort((t1,t2) => (t1.removedDate < t2.removedDate ? 1 : -1));
  }, [tasks, folder._id]);

  const addQuickTask = () => {
    addTask(
      newTaskName,
      userId,
      folderID,
      moment().unix(),
      () => {
        setNewTaskName("");
        setOpenNewTask(false);
      },
      () => console.log(error)
    );
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => !task.removedDate && (task.folder._id === folder.value || (!folder._id && task.assigned === userId)));
  }, [tasks, folder, userId]);

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

  document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
      case 13 :
      if (newTaskName.length > 0){
        addQuickTask();
      }
      break;
    }
  }

  return (
    <List>
      {
        activeTasks.length === 0 &&
        <span className="message">You have no open tasks.</span>
      }

      {
        chosenTask &&
        layout === PLAIN &&
          <Modal isOpen={true}>
            <ModalBody>
        <EditTask {...props}  modal={true} task={chosenTask} close={() => setParentChosenTask(null)}/>
        </ModalBody>
      </Modal>
      }

      {
        folder._id &&
        !match.path.includes("archived") &&
        !openNewTask &&
        <InlineInput>
        <LinkButton onClick={(e) => {e.preventDefault(); setOpenNewTask(true);}}>
          <img
            className="icon"
            style={{marginLeft: "2px", marginRight: "0.8em"}}
            src={PlusIcon}
            alt="Plus icon not found"
            />
          Task
        </LinkButton>
      </InlineInput>
      }

      {
        folder._id &&
        openNewTask &&
        <InlineInput>
          <input
            id={`add-task`}
            type="text"
            placeholder="New task"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            />
            <LinkButton
              onClick={(e) => {e.preventDefault(); setOpenNewTask(false);}}
              className="connected-btn"
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>

          {
            newTaskName.length > 0 &&
            <LinkButton
              onClick={(e) => {e.preventDefault(); addQuickTask();}}
              >
              <img
                className="icon"
                src={SendIcon}
                alt="Send icon not found"
                />
            </LinkButton>
          }
          </InlineInput>
        }

      {
        activeTasks.map((task) => (
          <ItemContainer
            key={task._id}
            active={chosenTask && task._id === chosenTask._id}
            >
            <Input
              id={`task_name ${task._id}`}
              type="checkbox"
              checked={task.closed}
              onChange={() => closeTask(task)}
              />
            {
              task.important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
            }
          {
            !task.important &&
            <img
              className="icon star"
              src={EmptyStarIcon}
              alt="Empty star icon not found"
              />
          }
            <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task)}>
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
              onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
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
          {
            removedTasks.length > 0 &&
            <LinkButton
              style={{marginLeft: "auto"}}
              onClick={(e) => {e.preventDefault(); restoreLatestTask(removedTasks)}}
              >
              <img
                className="icon"
                src={RestoreIcon}
                alt="Back icon not found"
                />
              <span>
              {translations[language].restoreTask}
            </span>
            </LinkButton>
          }
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
              checked={task.closed}
              onChange={() => closeTask(task)}
              />
              {
              task.important &&
              <img
                className="icon star"
                src={FullStarIcon}
                alt="Full star icon not found"
                />
              }
              {
              !task.important &&
              <img
              className="icon star"
              src={EmptyStarIcon}
              alt="Empty star icon not found"
              />
              }
            <span htmlFor={`task_name ${task._id}`} onClick={() => setParentChosenTask(task)}>
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
              onClick={(e) => {e.preventDefault(); removeTask(task, removedTasks, subtasks, comments)}}
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

    </List>
  );
};
