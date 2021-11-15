import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Select from 'react-select';

import moment from 'moment';

import Datetime from 'react-datetime';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import Switch from "react-switch";

import {
  setSearch,
  setFilter
} from '/imports/redux/metadataSlice';

import AddFilter from '/imports/ui/filters/addContainer';

import {
MenuIcon,
  CloseIcon,
  UserIcon,
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
  Filter as StyledFilter,
  Form,
  ButtonRow,
} from '/imports/other/styles/styledComponents';

import {
  translations
} from '/imports/other/translations';

export default function Filter( props ) {

    const dispatch = useDispatch();

    const {
      match,
      setOpenFilter
    } = props;

      const { folderID, filterID } = match.params;

    const {
      search,
      filter
    } = useSelector( ( state ) => state.metadata.value );

    const userId = Meteor.userId();
    const users = useSelector( ( state ) => state.users.value );
      const language = useMemo( () => {
        if (users .length > 0){
        return users.find( user => user._id === userId ).language;
      }
      return "en";
      }, [ userId, users ] );

      const folders = useSelector( ( state ) => state.folders.value );

      const [ showClosed, setShowClosed ] = useState( false );

      const [ newFilter, setNewFilter] = useState();
      const [ newSearch, setNewSearch] = useState("");
      const [ saveFilter, setSaveFilter] = useState(false);

      useEffect(() => {
        if (!newFilter){
          setNewFilter({...filter});
        }
        if (!newSearch){
          setNewSearch(search);
        }
      }, [newFilter, newSearch])

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

        if (!newFilter){
          return <div></div>
        }

  return (
      <StyledFilter>
        <Form>
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
              value={newSearch}
              onChange={(e) => {
                setNewSearch( e.target.value );
              }}
              />
          </section>

          {
            (['all', 'important'].includes(folderID)
          || filterID || !folderID) &&
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
          }

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
            timeFormat={false}
            value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin) : null}
            name="datetimeMin"
            id="datetimeMin"
            inputProps={{
            placeholder: 'Set date',
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
                  value={newFilter.datetimeMin ? moment.unix(newFilter.datetimeMin).format("DD.MM.yyyy").replace("T", " ") : ""}
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
              timeFormat={false}
              name="datetimeMax"
              id="datetimeMax"
              inputProps={{
              placeholder: translations[language].setDate,
              }}
              onChange={(date) => {
                date.hours(23).minutes(59).seconds(59);
                if (typeof date !== "string"){
                    setNewFilter({...newFilter, datetimeMax: date.unix()});
                } else {
                    setNewFilter({...newFilter, datetimeMax: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    value={newFilter.datetimeMax ? moment.unix(newFilter.datetimeMax).format("DD.MM.yyyy").replace("T", " ") : ""}
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
            placeholder: translations[language].setCreatedDate,
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
                  value={newFilter.dateCreatedMin ? moment.unix(newFilter.dateCreatedMin).format("DD.MM.yyyy").replace("T", " ") : ""}
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
                date.hours(23).minutes(59).seconds(59);
                if (typeof date !== "string"){
                    setNewFilter({...newFilter, dateCreatedMax: date.unix()});
                } else {
                    setNewFilter({...newFilter, dateCreatedMax: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    value={newFilter.dateCreatedMax ? moment.unix(newFilter.dateCreatedMax).format("DD.MM.yyyy").replace("T", " ") : ""}
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
              setNewFilter({...newFilter, showClosed: !newFilter.showClosed});
            }}
            checked={newFilter.showClosed ? newFilter.showClosed : false}
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
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              setSaveFilter(true);
            }}
            >
            {translations[language].saveFilter}
          </LinkButton>
          <FullButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(setSearch(newSearch));
              dispatch(setFilter({...newFilter}));
              setOpenFilter(false);
            }}
            >
            {translations[language].applyFilter}
          </FullButton>
        </ButtonRow>

      </Form>



      {
        saveFilter &&
        <AddFilter
          title={newSearch}
          {...newFilter}
          setSaveFilter={setSaveFilter}
          setOpenFilter={setOpenFilter}
          />
      }
      </StyledFilter>

  );
};
