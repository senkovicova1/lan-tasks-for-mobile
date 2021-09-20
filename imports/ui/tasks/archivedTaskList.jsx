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
import { SettingsIcon, FullStarIcon, EmptyStarIcon } from  "/imports/other/styles/icons";
import {
  translations
} from '../../other/translations.jsx';
import {
  useTracker
} from 'meteor/react-meteor-data';
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
    history,
    search,
    sortBy,
    sortDirection,
  } = props;

  const [ showClosed, setShowClosed ] = useState(false);

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const language = useMemo(() => {
    return user.profile.language;
  }, [user]);

  const folderID = match.params.folderID;
    const tasks = useSelector((state) => state.tasks.value);

      const folders = useSelector((state) => state.folders.value);
      const folder = useMemo(() => {
        const maybeFolder = folders.find(folder => folder._id === folderID);
        return  maybeFolder ? maybeFolder : null;
      }, [folders]);

    const filteredTasks = useMemo(() => {
      return tasks.filter(task => !task.removedDate && task.folder.archived);
    }, [tasks]);

    const searchedTasks = useMemo(() => {
      return filteredTasks.filter(task => task.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, filteredTasks]);

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

      {
        activeTasks.map(
          (task) =>
          <ItemContainer
            key={task._id}
            >
            <Input
              type="checkbox"
              checked={task.closed}
              disabled={true}
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
            <span>
              {task.name}
            </span>
          </ItemContainer>
        )
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
        closedTasks.map(
          (task) =>
          <ItemContainer
            key={task._id}
            >
            <Input
              type="checkbox"
              checked={task.closed}
              disabled={true}
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
            <span>
              {task.name}
            </span>
          </ItemContainer>
        )
      }

      {
        folder &&
        folder.users.find(user => user._id === userId).admin  &&
              <ItemContainer key="button" >
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            props.history.push(`/${folders[0]._id}/edit`);
          }}
          >
          <img
            className="icon"
            src={SettingsIcon}
            alt="Settings icon not found"
            />
          Folder
        </LinkButton>
      </ItemContainer>
      }

    </List>
  );
};
