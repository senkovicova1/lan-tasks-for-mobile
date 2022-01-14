import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Select from 'react-select';

import Switch from "react-switch";

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  HistoryCollection
} from '/imports/api/historyCollection';

import {
  SubtasksCollection
} from '/imports/api/subtasksCollection';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

import {
  setChosenTask
} from '/imports/redux/metadataSlice';

import FilterSummary from '/imports/ui/filters/summary';
import EditTask from '/imports/ui/tasks/editContainer';
import Loader from '/imports/ui/other/loadingScreen';
import ItemInList from '/imports/ui/tasks/list/itemContainer';;

import {
  RestoreIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
  SendIcon,
  FullStarIcon,
  EmptyStarIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  List,
  FullButton,
  ItemContainer,
  LinkButton,
  Input,
  InlineInput,
  AppliedFilter
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

import {
  CLOSED_STATUS,
  OPEN_STATUS,
} from '/imports/other/messages';

const { DateTime } = require("luxon");

export default function TaskList( props ) {

  const dispatch = useDispatch();

  const {
  match,
  tasksLoading,
  showClosed,
  setShowClosed,
  folder,
  closedTasks,
  activeTasks,
  removedTasks,
  addQuickTask,
  sidebarFilter,
  tasksHandlerReady
} = props;

const [ newTaskName, setNewTaskName ] = useState( "" );
const [ openNewTask, setOpenNewTask ] = useState( false );

const {
  folderID,
  filterID
} = match.params;
const {
  layout,
  filter,
  chosenTask
} = useSelector( ( state ) => state.metadata.value );

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );
const language = useMemo( () => {
  return user.profile.language;
}, [ user ] );

const dbUsers = useSelector( ( state ) => state.users.value );
const notifications = useSelector( ( state ) => state.notifications.value );

  const { history } = useTracker(() => {
    const noDataAvailable = { history: []};
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const historyHandler = Meteor.subscribe('history');

    if (!historyHandler.ready()) {
      return { ...noDataAvailable };
    }

    const tasksIds = [...activeTasks, ...closedTasks].map(task => task._id);
    const history = HistoryCollection.find( {
      task: {
        $in: tasksIds
      }
    }  ).fetch();

    return { history };
  });

const { subtasks } = useTracker(() => {
  const noDataAvailable = { subtasks: [] };

  if (!Meteor.user()) {
    return noDataAvailable;
  }

  const subtasksHandler = Meteor.subscribe('subtasks');

  if (!subtasksHandler.ready()) {
    return { ...noDataAvailable };
  }

  const tasksIds = [...activeTasks, ...closedTasks].map(task => task._id);
  const subtasks = SubtasksCollection.find(  {
    _id: {
      $in: tasksIds
    }
  }  ).fetch();

  return { subtasks };
});

const { comments } = useTracker(() => {
  const noDataAvailable = { comments: [] };

  if (!Meteor.user()) {
    return noDataAvailable;
  }

  const commentsHandler = Meteor.subscribe('comments');

  if (!commentsHandler.ready()) {
    return { ...noDataAvailable };
  }

  const tasksIds = [...activeTasks, ...closedTasks].map(task => task._id);
  const comments = CommentsCollection.find(  {
    _id: {
      $in: tasksIds
    }
  }  ).fetch();

  return { comments };
});

document.onkeydown = function( e ) {
  e = e || window.event;
  switch ( e.which || e.keyCode ) {
    case 13:
      if ( newTaskName.length > 0 ) {
        const dateCreated = parseInt(DateTime.now().toSeconds());

        addQuickTask(
          newTaskName,
          null,
          dateCreated,
          (_id) => {
            setNewTaskName( "" );
            setOpenNewTask( false );
          },
          () => console.log( error )
         );
      }
      break;
  }
};

  if (tasksLoading){
    return   (
      <List style={{position: "relative"}}>
        <Loader />
      </List>
    )
  }

  return (
    <List>
      <FilterSummary
        {...props}
        />
      {
        activeTasks.length === 0 &&
        <span className="message">{translations[language].noOpenTasks}</span>
      }

      {
        chosenTask &&
        layout === PLAIN &&
        <Modal isOpen={true}>
          <ModalBody>
            <EditTask
              {...props}
              taskId={chosenTask}
              tasksHandlerReady={tasksHandlerReady}
              folder={folder}
              close={() => dispatch(setChosenTask(null))}
              />
          </ModalBody>
        </Modal>
      }

      {
        folder &&
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
            {translations[language].task}
          </LinkButton>
        </InlineInput>
      }

      {
        folder &&
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
              onClick={(e) => {
                e.preventDefault();
                const dateCreated = parseInt(DateTime.now().toSeconds());
                addQuickTask(
                  newTaskName,
                  null,
                  dateCreated,
                   (_id) => {
                     Meteor.call(
                       'history.addNewHistory',
                       _id,
                       [ {
                           dateCreated,
                           user: user._id,
                           message: "created this task!",
                       } ]
                     );
                setNewTaskName( "" );
                setOpenNewTask( false );
              },
              () => console.log( error )
            );
          }}
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
          <ItemInList
            task={task}
            chosenTask={chosenTask}
            removedTasks={removedTasks}
            subtasks={subtasks}
            comments={comments}
            history={history}
            userId={userId}
            notifications={notifications}
            dbUsers={dbUsers}
            />
        ))
      }

      <hr style={{marginTop: "7px", marginBottom: "7px"}}/>

      <ItemContainer key="commands" >
        <Switch
          id="show-closed"
          name="show-closed"
          onChange={() => setShowClosed(!showClosed)}
          checked={sidebarFilter.showClosed || filter.showClosed || showClosed}
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
            onClick={(e) => {e.preventDefault(); Meteor.call('tasks.restoreLatestTask', removedTasks)}}
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
        (sidebarFilter.showClosed || filter.showClosed || showClosed) &&
        closedTasks.length === 0 &&
        <span className="message">{translations[language].noClosedTasks}</span>
      }

      {
        (sidebarFilter.showClosed || filter.showClosed || showClosed) &&
        closedTasks.map((task) => (
          <ItemInList
            task={task}
            chosenTask={chosenTask}
            removedTasks={removedTasks}
            subtasks={subtasks}
            comments={comments}
            history={history}
            userId={userId}
            notifications={notifications}
            dbUsers={dbUsers}
            />
        ))
      }

    </List>
  );
};
