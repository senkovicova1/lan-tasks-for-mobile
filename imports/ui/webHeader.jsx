import React, {
  useState,
  useEffect,
  useMemo
} from 'react';
import {
  Link
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useTracker
} from 'meteor/react-meteor-data';

import { SettingsIcon, MenuIcon, LogoutIcon, CloseIcon, SearchIcon, LeftArrowIcon, UserIcon, MenuIcon2 } from  "/imports/other/styles/icons";

import Menu from './sidebar';

import { setFolder, setLayout, setSortBy, setSortDirection, setSearch, setSidebarOpen } from '/imports/redux/metadataSlice';
import {
  PLAIN,
  COLUMNS,
  sortByOptions,
  sortDirectionOptions,
  allMyTasksFolder,
  archivedFolder,
} from "/imports/other/constants";
import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';
import {
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
  Sort
} from '../other/styles/styledComponents';

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
  const { folder, layout, sidebarOpen, search, sortBy, sortDirection } = useSelector( ( state ) => state.metadata.value );
  const folders = useSelector((state) => state.folders.value);

  const [ title, setTitle ] = useState("TaskApp");
  const [ background, setBackground ] = useState("#0078d4");
  const [ openSort, setOpenSort ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(true);

  useEffect(() => {
    if (location.pathname === "/folders/archived") {
      setTitle("Archived Folders");
      setBackground("#0078d4");
    }
    if (!folderID || folderID === "all") {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
    let folder = [...folders.active, ...folders.archived].find(folder => folder._id === folderID);
    if (folder) {
      setTitle(folder.name);
      setBackground(folder.colour);
    } else {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
  }, [folderID, location.pathname, folders]);

  const canEditFolder = useMemo(() => {
    if (folderID && folderID !== 'all' && [...folders.active, ...folders.archived].length > 0) {
      const folder = [...folders.active, ...folders.archived].find(f => f._id === folderID);
      const user = folder.users.find(user => user._id === userId);
      return user.admin;
  }
}, [folders, folderID, userId]);

  document.addEventListener("click", (evt) => {
      const sortMenu = document.getElementById("sort-menu");
      const openSortMenuBtn = document.getElementById("sort-menu-button");
      let targetElement = evt.target; // clicked element
      do {
          if (targetElement == sortMenu) {
              // This is a click inside. Do nothing, just return.
              return;
          }
          if (targetElement == openSortMenuBtn) {
              setOpenSort(!openSort);
              return;
          }
          // Go up the DOM
          targetElement = targetElement.parentNode;
      } while (targetElement);

      // This is a click outside.
      setOpenSort(false);
  });

  useEffect(() => {
    if (window.innerWidth >= 800) {
      dispatch(setSidebarOpen(true));
    } else {
      dispatch(setSidebarOpen(false));
    }
  }, [window.innerWidth]);

  const avatar = useMemo(() => {
    if (!currentUser || !currentUser.profile.avatar){
      return UserIcon;
    }
    return uint8ArrayToImg(currentUser.profile.avatar);
  }, [currentUser])

  return (
    <PageHeader style={{backgroundColor: background}}>
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
          <img className="avatar" src={avatar} alt="assignedAvatar" />
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
              window.innerWidth >=800 &&
            <h3>Layout</h3>
          }
            {
              window.innerWidth >=800 &&
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
                <label htmlFor="plain-layout">Basic</label>
              </span>
}
{
window.innerWidth >=800 &&
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
            <h3>Sort by</h3>
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

    </PageHeader>
  );
};
