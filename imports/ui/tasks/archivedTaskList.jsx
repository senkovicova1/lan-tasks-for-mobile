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
import { SettingsIcon } from  "/imports/other/styles/icons";
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
    history
  } = props;

  const [ search, setSearch ] = useState( "" );
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
      return tasks.filter(task => (showClosed || !task.closed) && !task.removedDate && task.folder.archived);
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
        searchedTasks.map(
          (task) =>
          <ItemContainer
            key={task._id}
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
        <label
          htmlFor="allStatuses"
          style={{color: "#0078d4"}}
          >
          {translations[language].showClosed}
        </label>
      </section>

      {
        (  folders[0].users.find(user => user._id === userId).admin ) &&
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
      }

    </List>
  );
};
