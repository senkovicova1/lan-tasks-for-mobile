import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link
} from 'react-router-dom';

import Select from 'react-select';

import moment from 'moment';

import Datetime from 'react-datetime';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  addFilter
} from '/imports/ui/users/filtersHandlers';

import Menu from './sidebar';

import {
  setFolder,
  setLayout,
  setSortBy,
  setSortDirection,
  setSearch,
  setSidebarOpen,
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
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
  Sort,
  Filter,
  Form,
  ButtonRow,
  ButtonCol
} from '/imports/other/styles/styledComponents';

import {
  PLAIN,
  COLUMNS,
  CALENDAR,
  DND,
  sortByOptions,
  sortDirectionOptions,
  allMyTasksFolder,
  archivedFolder,
} from "/imports/other/constants";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function WebHeader( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
  } = props;

  const folderID = match.params.folderID;
  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const logout = () => Meteor.logout();

  const {
    folder,
    layout,
    sidebarOpen,
    search,
    sortBy,
    sortDirection,
    filter
  } = useSelector( ( state ) => state.metadata.value );

  const folders = useSelector( ( state ) => state.folders.value );
  const users = useSelector( ( state ) => state.users.value );
  const filters = useSelector( ( state ) => state.filters.value );

  const [ title, setTitle ] = useState( "TaskApp" );
  const [ background, setBackground ] = useState( "#0078d4" );
  const [ openSort, setOpenSort ] = useState( false );
  const [ openFilter, setOpenFilter ] = useState( false );
  const [ openSearch, setOpenSearch ] = useState( true );

  const [ newFilter, setNewFilter] = useState();
  const [ newSearch, setNewSearch] = useState("");
  const [ newFIlterName, setNewFilterName] = useState("");
  const [ saveFilter, setSaveFilter] = useState(false);

  useEffect( () => {

    if ( location.pathname === "/folders/archived" ) {
      setTitle( "Archived Folders" );
      setBackground( "#0078d4" );
    }

    if ( !folderID || folderID === "all" ) {
      setTitle( "TaskApp" );
      setBackground( "#0078d4" );
    }

    if ( folderID === "important" ) {
      setTitle( "Important tasks" );
      setBackground( "#0078d4" );
    }

    let folder = [ ...folders.active, ...folders.archived ].find( folder => folder._id === folderID );
    if ( folder ) {
      setTitle( folder.name );
      setBackground( folder.colour );
    } else {
      setTitle( "TaskApp" );
      setBackground( "#0078d4" );
    }

  }, [ folderID, location.pathname, folders ] );

  const canEditFolder = useMemo( () => {
    if ( folderID && !['all', 'important'].includes(folderID) && [ ...folders.active, ...folders.archived ].length > 0 ) {
      const folder = [ ...folders.active, ...folders.archived ].find( f => f._id === folderID );
      const user = folder.users.find( user => user._id === userId );
      return user.admin;
    }
  }, [ folders, folderID, userId ] );

  document.addEventListener( "click", ( evt ) => {
    const sortMenu = document.getElementById( "sort-menu" );
    const openSortMenuBtn = document.getElementById( "sort-menu-button" );
    let targetElement = evt.target; // clicked element
    do {
      if ( targetElement == sortMenu ) {
        // This is a click inside. Do nothing, just return.
        return;
      }
      if ( targetElement == openSortMenuBtn ) {
        setOpenSort( !openSort );
        return;
      }
      // Go up the DOM
      targetElement = targetElement.parentNode;
    } while ( targetElement );

    // This is a click outside.
    setOpenSort( false );
  } );

  useEffect( () => {
    if ( window.innerWidth >= 800 ) {
      dispatch( setSidebarOpen( true ) );
    } else {
      dispatch( setSidebarOpen( false ) );
    }
  }, [ window.innerWidth ] );

  const avatar = useMemo( () => {
    if ( !currentUser || !currentUser.profile.avatar ) {
      return UserIcon;
    }
    return uint8ArrayToImg( currentUser.profile.avatar );
  }, [ currentUser ] );

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

  const filterOptions = useMemo(() => {
    return filters.map(filter => ({
      ...filter,
      assigned: users && users.length > 0 ? filter.assigned.map(user => users.find(u => u._id === user)) : [],
      folders: folders && [...folders.active, ...folders.archived ].length > 0 && filter.folders ? filter.folders.map(f1 => [...folders.active, ...folders.archived ].find(f2 => f2._id === f1)) : [],
      label: filter.name,
      value: filter._id
    }))
  }, [users, folders, filters]);

  return (
    <PageHeader
      id="filter" style={{backgroundColor: background}}>
      <section className="header-section">
        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setSidebarOpen(!sidebarOpen));
            }}
            >
            <img
              className="icon"
              src={MenuIcon}
              alt="Menu icon not found"
              />
          </LinkButton>
        }
        <h1 onClick={(e) => props.history.push("/all/list")}>{title}</h1>
      </section>
      {
        currentUser &&
        <SearchSection>
          <LinkButton
            font="#0078d4"
            searchButton
            onClick={(e) => {}}
            >
            <img
              className="search-icon"
              src={SearchIcon}
              alt="Search icon not found"
              />
          </LinkButton>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            />
          <LinkButton
            font="#0078d4"
            searchButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(setSearch(""));
            }}
            >
            <img
              className="search-icon"
              src={CloseIcon}
              alt="Close icon not found"
              />
          </LinkButton>
        <LinkButton
          font="#0078d4"
          searchButton
          onClick={(e) => {
            e.preventDefault();
            const filterState = openFilter;
            setOpenFilter(!filterState);
            if (!filterState){
              setNewFilter({...filter});
              setNewSearch(search);
            }
          }}
          >
          <img
            className="search-icon"
            src={FilterIcon}
            alt="Close icon not found"
            />
        </LinkButton>

        {
          openFilter &&
          <Filter>
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
                  placeholder="Filter by title"
                  value={newSearch}
                  onChange={(e) => {
                    setNewSearch( e.target.value );
                  }}
                  />
              </section>

              {
                ['all', 'important'].includes(folderID) &&
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
                      placeholder="Filter by folders"
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
                  Important
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
                  placeholder="Filter by assigned users"
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
                placeholder: 'Set datetime',
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
                  placeholder: 'Set datetime',
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
              <span className="icon-container">
                <img
                  className="label-icon"
                  htmlFor="filter"
                  src={FilterIcon}
                  alt="FilterIcon icon not found"
                  />
              </span>
              <div style={{width: "100%"}}>
                <Select
                  id="filter"
                  name="filter"
                  placeholder="Select filter"
                  styles={selectStyle}
                  value={newFilter && newFilter._id ? newFilter : null}
                  onChange={(e) => {
                    setNewFilter(e);
                  }}
                  options={filterOptions}
                  />
              </div>
            </section>

            <section className="inline">
              <span className="icon-container" style={{fontSize: "2em", paddingLeft: "8px"}}>
                *
              </span>
              <Datetime
                className="full-width"
                dateFormat={"DD.MM.yyyy"}
                timeFormat={"HH:mm"}
                name="dateCreated"
                id="dateCreated"
                inputProps={{
                placeholder: 'Set created date',
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
                  timeFormat={"HH:mm"}
                  name="dateCreated"
                  id="dateCreated"
                  inputProps={{
                  placeholder: 'Set created date',
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

            <ButtonRow>
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  setSaveFilter(true);
                }}
                >
                Save filter
              </LinkButton>
              <FullButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSearch(newSearch));
                  dispatch(setFilter({...newFilter}));
                  setOpenFilter(false);
                }}
                >
                Aply filter
              </FullButton>
            </ButtonRow>

          </Form>
          </Filter>
        }

        </SearchSection>
      }

      <section className="header-section" style={{justifyContent: "flex-end"}}>
        {
          currentUser &&
          <LinkButton
            font="white"
            id="sort-menu-button"
            name="sort-menu-button"
            onClick={(e) => {
              e.preventDefault();
              setOpenSort(!openSort);
            }}
            >
            <img
              className="icon"
              src={MenuIcon2}
              alt="MenuIcon2 icon not found"
              />
          </LinkButton>
        }

        {
          currentUser &&
          (!folderID || folderID === "all") &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setBackground("#0078d4");
              props.history.push("/settings");
            }}
            >
            <img className={avatar === UserIcon ? "icon" : "avatar"} src={avatar} alt="assignedAvatar" />
          </LinkButton>
        }

        {
          currentUser &&
          canEditFolder &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setBackground("#0078d4");
              props.history.push(`/${folderID}/edit`);
            }}
            >
            <img
              className="icon"
              src={SettingsIcon}
              alt="Settings icon not found"
              />
          </LinkButton>
        }

        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setBackground("#0078d4");
              props.history.push("/login");
              logout();
            }}
            >
            <img
              className="icon"
              src={LogoutIcon}
              alt="Logout icon not found"
              />
          </LinkButton>
        }
      </section>

      {
        sidebarOpen &&
        currentUser &&
        <Menu {...props} widthWithSidebar={sidebarOpen} setBackground={setBackground} closeSelf={() => setSidebarOpen(false)}/>
      }

      {
        openSort &&
        <Sort id="sort-menu" name="sort-menu">
          {
            (window.innerWidth > 820 || !/Mobi|Android/i.test(navigator.userAgent)) &&
            <h3>Layout</h3>
          }
            {
              (window.innerWidth > 820 || !/Mobi|Android/i.test(navigator.userAgent)) &&
            <span>
              <input
                id="plain-layout"
                name="plain-layout"
                type="checkbox"
                checked={layout === PLAIN}
                onChange={() => {
                  dispatch(setLayout(PLAIN));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="plain-layout">List</label>
            </span>
          }
            {
              (window.innerWidth > 820 || !/Mobi|Android/i.test(navigator.userAgent)) &&
            <span>
              <input
                id="columns-layout"
                name="columns-layout"
                type="checkbox"
                checked={layout === COLUMNS}
                onChange={() => {
                  dispatch(setLayout(COLUMNS));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="columns-layout">Columns</label>
            </span>
          }
            {
              (window.innerWidth > 820 || !/Mobi|Android/i.test(navigator.userAgent)) &&
            <span>
              <input
                id="calendar-layout"
                name="calendar-layout"
                type="checkbox"
                checked={layout === CALENDAR}
                onChange={() => {
                  dispatch(setLayout(CALENDAR));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="calendar-layout">Calendar</label>
            </span>
          }
            {
              (window.innerWidth > 820 || !/Mobi|Android/i.test(navigator.userAgent)) &&
            <span>
              <input
                id="dnd-layout"
                name="dnd-layout"
                type="checkbox"
                checked={layout === DND}
                onChange={() => {
                  dispatch(setLayout(DND));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="dnd-layout">Planner</label>
            </span>
          }
          <h3>Sort by</h3>
            <span key={"customOrder"}>
              <input
                id={"customOrder"}
                name={"customOrder"}
                type="checkbox"
                checked={sortBy === "customOrder"}
                onChange={() => {
                  dispatch(setSortBy("customOrder"));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor={"customOrder"}>Custom order</label>
            </span>
          {
            sortByOptions
            .flatMap(x => sortDirectionOptions.map(y => ({
              label: `${x.label}  (${y.label})`,
              value: `${x.value}-${y.value}`,
              sortByValue: x.value,
              sortDirectionValue: y.value
            })))
            .map(item => (
              <span key={item.value}>
                <input
                  id={item.value}
                  name={item.value}
                  type="checkbox"
                  checked={sortBy === item.sortByValue && sortDirection === item.sortDirectionValue}
                  onChange={() => {
                    dispatch(setSortBy(item.sortByValue));
                    dispatch(setSortDirection(item.sortDirectionValue));
                    if (/Mobi|Android/i.test(navigator.userAgent)) {
                      setOpenSort(!openSort);
                    }
                  }}
                  />
                <label htmlFor={item.value}>{item.label}</label>
              </span>
            ))
          }
        </Sort>
      }

      {
        saveFilter &&
      <Modal isOpen={true}>
        <ModalBody>
          <Form>
          <h2>Add filter</h2>
            <section className="inline">
              <span className="icon-container">
                Name
              </span>
              <Input
              id="filterName"
              name="filterName"
              type="text"
              onChange={(e) =>  {
                setNewFilterName(e.target.value);
              }}
              />
          </section>
          <ButtonCol>
            <FullButton colour="grey" onClick={(e) => {e.preventDefault(); setSaveFilter(false);}}>Cancel</FullButton>
            <FullButton
              colour=""
              disabled={newFIlterName.length === 0}
              onClick={(e) => {
                e.preventDefault();
                addFilter(
                  newFIlterName,
                  userId,
                  newSearch,
                  newFilter.folders.map(folder => folder._id),
                  newFilter.important,
                  newFilter.assigned.map(a => a._id),
                  newFilter.datetimeMin,
                  newFilter.datetimeMax,
                  newFilter.dateCreatedMin,
                  newFilter.dateCreatedMax,
                  () => {setSaveFilter(false);
                  dispatch(setFilter({...newFilter}));
                  setOpenFilter(false);},
                  (error) => {console.log(error)}
                );
              }}
              >
              Save
            </FullButton>
          </ButtonCol>
        </Form>
        </ModalBody>
      </Modal>
    }

    </PageHeader>
  );
};
