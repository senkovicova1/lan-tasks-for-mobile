import React, {
  useState,
  useEffect,
  useMemo
}  from 'react';
import {
  Meteor
} from 'meteor/meteor';

import Select from 'react-select';

import moment from 'moment';

import Datetime from 'react-datetime';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import Switch from "react-switch";

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  setFilter
} from '/imports/redux/metadataSlice';

import {
  SettingsIcon,
  MenuIcon,
  LogoutIcon,
  CloseIcon,
  SearchIcon,
  LeftArrowIcon,
  UserIcon,
  MenuIcon2,
  FilterIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  LinkButton,
  FullButton,
  Input,
  Form,
  ButtonRow,
} from '/imports/other/styles/styledComponents';

import {
  translations
} from '/imports/other/translations';

export default function FilterForm( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    filterId,
    filter,
    submit,
    cancel,
    remove
  } = props;


  const folderID = match.params.folderID;
  const userId = Meteor.userId();

  const folders = useSelector( ( state ) => state.folders.value );
  const users = useSelector( ( state ) => state.users.value );

  const language = useMemo( () => {
    return users.find( user => user._id === userId ).language;
  }, [ userId, users ] );

  const [ newFilterName, setNewFilterName] = useState(filter.name);
  const [ newFilter, setNewFilter] = useState({});

    useEffect( () => {

      if ( filter && [...folders.active, ...folders.archived ].length > 0 && users.length > 0 ) {
        setNewFilter( {
          ...filter,
          assigned: filter.assigned.map(user => users.find(u => u._id === user)),
          folders: filter.folders.map(f1 => [...folders.active, ...folders.archived ].find(f2 => f2._id === f1)),
        } );
      } else {
        setNewFilter( {...filter} );
      }

    }, [ filter, folders, users ] );

  const usersForFilter = useMemo(() => {
    if (folderID ===  "archived"){
      const userIds = folders.archived.map(folder => folder.users.map(user => user._id)).flat();
      return users.filter(user => userIds.includes(user._id));
    }
    if (!folderID || ['all', 'important'].includes(folderID)){
      const userIds = folders.active.map(folder => folder.users.map(user => user._id)).flat();
      const use = users.filter(user => userIds.includes(user._id));
      return use;
    }
    if (folderID && [ ...folders.active, ...folders.archived ].length > 0){
      const userIds = [ ...folders.active, ...folders.archived ].find( f => f._id === folderID ).users.map(user => user._id);
      return users.filter(user => userIds.includes(user._id));
    }
    return [];
  }, [users, folders, folderID]);

  return (
      <Form>

        <section className="inline">
          <span className="icon-container">
            {translations[language].name}
          </span>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder={translations[language].nameOfTheFilter}
            value={newFilterName}
            onChange={(e) => {
              setNewFilterName( e.target.value );
            }}
            />
        </section>

        <section className="inline">
          <span className="icon-container">
            <img
              className="label-icon"
              htmlFor="title"
              src={MenuIcon}
              alt="MenuIcon icon not found"
              />
          </span>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder={translations[language].filterByTitle}
            value={newFilter.title}
            onChange={(e) => {
              setNewFilter({...newFilter, title: e.target.value});
            }}
            />
        </section>

          <section className="inline">
            <span className="icon-container">
              <img
                className="label-icon"
                htmlFor="folder"
                src={FolderIcon}
                alt="FolderIcon icon not found"
                />
            </span>
            <div style={{width: "100%"}}>
              <Select
                id="folder"
                name="folder"
                placeholder={translations[language].filterByFolder}
                isMulti
                styles={selectStyle}
                value={newFilter.folders}
                onChange={(e) => {
                  setNewFilter({...newFilter, folders: e})
                }}
                options={match.path.includes("archive") ? folders.archived : folders.active}
                />
            </div>
          </section>

      <section className="inline fit">
        <LinkButton
          style={{color: "#f3d053", paddingLeft: "0px"}}
          height="fit"
          onClick={(e) => {
            e.preventDefault();
            setNewFilter({...newFilter, important: !newFilter.important})
          }}
          >
          {
            newFilter.important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={FullStarIcon}
              alt="Full star icon not found"
              />
          }
          {
            !newFilter.important &&
            <img
              style={{margin: "0px"}}
              className="label-icon star"
              src={EmptyStarIcon}
              alt="Empty star icon not found"
              />
          }
          <span style={{marginLeft: "10px"}}>
            {translations[language].important}
          </span>
        </LinkButton>
      </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="assigned"
            src={UserIcon}
            alt="User icon not found"
            />
        </span>
        <div style={{width: "100%"}}>
          <Select
            id="assigned"
            name="assigned"
            styles={selectStyle}
            placeholder={translations[language].filterByAssigned}
            value={newFilter.assigned}
            isMulti
            onChange={(e) => {
              setNewFilter({...newFilter, assigned: e});
            }}
            options={usersForFilter}
            />
        </div>
      </section>

      <section className="inline">
        <span className="icon-container">
          <img
            className="label-icon"
            htmlFor="datetimeMin"
            src={CalendarIcon}
            alt="Calendar icon not found"
            />
        </span>
        <Datetime
          className="full-width"
          dateFormat={"DD.MM.yyyy"}
          timeFormat={"HH:mm"}
          value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin) : null}
          name="datetimeMin"
          id="datetimeMin"
          inputProps={{
          placeholder: translations[language].setDatetime,
          }}
          onChange={(date) => {
            if (typeof date !== "string"){
                setNewFilter({...newFilter, datetimeMin: date.unix()});
            } else {
                setNewFilter({...newFilter, datetimeMin: date});
            }
          }}
          renderInput={(props) => {
              return <Input
                {...props}
                value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin).format("DD.MM.yyyy kk:mm").replace("T", " ") : ""}
                />
          }}
          />
          <LinkButton
            searchButton
            style={{color: "#f3d053", height: "40px", marginRight: "0.6em"}}
            height="fit"
            onClick={(e) => {
              e.preventDefault();
              setNewFilter({...newFilter, datetimeMin: ""});
            }}
            >
              <img
                style={{margin: "0px"}}
                className="label-icon"
                src={CloseIcon}
                alt="CloseIcon star icon not found"
                />
          </LinkButton>

          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            timeFormat={"HH:mm"}
            name="datetimeMax"
            id="datetimeMax"
            inputProps={{
            placeholder: translations[language].setDatetime,
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setNewFilter({...newFilter, datetimeMax: date.unix()});
              } else {
                  setNewFilter({...newFilter, datetimeMax: date});
              }
            }}
            renderInput={(props) => {
                return <Input
                  {...props}
                  value={newFilter.datetimeMax ? moment.unix(newFilter.datetimeMax).format("DD.MM.yyyy kk:mm").replace("T", " ") : ""}
                  />
            }}
            />
            <LinkButton
              searchButton
              style={{color: "#f3d053", height: "40px"}}
              height="fit"
              onClick={(e) => {
                e.preventDefault();
                setNewFilter({...newFilter, datetimeMax: ""});
              }}
              >
                <img
                  style={{margin: "0px"}}
                  className="label-icon"
                  src={CloseIcon}
                  alt="CloseIcon star icon not found"
                  />
            </LinkButton>
      </section>

      <section className="inline">
        <span className="icon-container" style={{fontSize: "2em", paddingLeft: "8px"}}>
          *
        </span>
        <Datetime
          className="full-width"
          dateFormat={"DD.MM.yyyy"}
          timeFormat={false}
          name="dateCreated"
          id="dateCreated"
          inputProps={{
          placeholder:  translations[language].setCreatedDate,
          }}
          onChange={(date) => {
            if (typeof date !== "string"){
                setNewFilter({...newFilter, dateCreatedMin: date.unix()});
            } else {
                setNewFilter({...newFilter, dateCreatedMin: date});
            }
          }}
          renderInput={(props) => {
              return <Input
                {...props}
                value={newFilter.dateCreatedMin ? moment.unix(newFilter.dateCreatedMin).format("DD.MM.yyyy kk:mm").replace("T", " ") : ""}
                />
          }}
          />
          <LinkButton
            searchButton
            style={{color: "#f3d053", height: "40px", marginRight: "0.6em"}}
            onClick={(e) => {
              e.preventDefault();
              setNewFilter({...newFilter, dateCreatedMin: ""});
            }}
            >
              <img
                style={{margin: "0px"}}
                className="label-icon"
                src={CloseIcon}
                alt="CloseIcon star icon not found"
                />
          </LinkButton>

          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            timeFormat={false}
            name="dateCreated"
            id="dateCreated"
            inputProps={{
            placeholder: translations[language].setCreatedDate,
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setNewFilter({...newFilter, dateCreatedMax: date.unix()});
              } else {
                  setNewFilter({...newFilter, dateCreatedMax: date});
              }
            }}
            renderInput={(props) => {
                return <Input
                  {...props}
                  value={newFilter.dateCreatedMax ? moment.unix(newFilter.dateCreatedMax).format("DD.MM.yyyy kk:mm").replace("T", " ") : ""}
                  />
            }}
            />
            <LinkButton
              searchButton
              style={{color: "#f3d053", height: "40px"}}
              onClick={(e) => {
                e.preventDefault();
                setNewFilter({...newFilter, dateCreatedMax: ""});
              }}
              >
                <img
                  style={{margin: "0px"}}
                  className="label-icon"
                  src={CloseIcon}
                  alt="CloseIcon star icon not found"
                  />
            </LinkButton>
      </section>

      <section className="inline">
        <Switch
          id="show-closed"
          name="show-closed"
          onChange={() => {
            setNewFilter({...newFilter, dateCreatedMax: !newFilter.showClosed});
          }}
          checked={newFilter.showClosed}
          onColor="#0078d4"
          uncheckedIcon={false}
          checkedIcon={false}
          style={{
            marginRight: "0.6em",
            display: "none"
          }}
          />
        <span
          htmlFor="show-closed"
          style={{
            marginLeft: "0.6em",
          }}
          >
          {translations[language].showClosed}
        </span>
      </section>


      <ButtonRow>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); cancel();}}>{translations[language].cancel}</FullButton>
        <FullButton colour="red" onClick={(e) => {e.preventDefault(); remove();}}>{translations[language].delete}</FullButton>
        <FullButton
          colour=""
          disabled={newFilterName.length === 0}
          onClick={(e) => {
            e.preventDefault();
            submit(
              filter._id,
              newFilterName,
              userId,
              newFilter.title,
              newFilter.folders,
              newFilter.important,
              newFilter.assigned,
              newFilter.datetimeMin,
              newFilter.datetimeMax,
              newFilter.dateCreatedMin,
              newFilter.dateCreatedMax,
              newFilter.showClosed,
            );
          }}
          >
          {translations[language].save}
        </FullButton>
      </ButtonRow>
    </Form>
  );
};
