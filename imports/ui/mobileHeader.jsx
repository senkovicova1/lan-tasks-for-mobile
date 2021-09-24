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

import { setLayout, setSortBy, setSortDirection, setSearch, setSidebarOpen } from '/imports/redux/metadataSlice';
import {
  PLAIN,
  COLUMNS,
  sortByOptions,
  sortDirectionOptions
} from "/imports/other/constants";

import {
  MobilePageHeader as PageHeader,
  LinkButton,
  FullButton,
  Input,
  TitleControl
} from '../other/styles/styledComponents';

export default function MobileHeader( props ) {
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
    const folders = useSelector((state) => state.folders.value).active;

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
        {
          !openSearch &&
          <h1 onClick={(e) => props.history.push("/all/list")}>{title}</h1>
        }

      {
        openSearch &&
        currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSearch(false);
            }}
            >
            <img
              className="icon"
              src={LeftArrowIcon}
              alt="Left arrow icon not found"
              />
          </LinkButton>
        }
          {
            openSearch &&
            currentUser &&
          <div className="search-section">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            />
        </div>
      }
      {
        openSearch &&
        currentUser &&
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
  }

      {
        !openSearch &&
        currentUser &&
        <LinkButton
          style={{marginLeft: "auto"}}
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setOpenSearch(true);
          }}
          >
          <img
            className="icon"
            src={SearchIcon}
            alt="Search icon not found"
            />
        </LinkButton>
      }

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
      {
        openSort &&
        <Sort id="sort-menu" name="sort-menu">
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
      {
        openSidebar &&
        currentUser &&
        <Menu {...props} setBackground={setBackground} widthWithSidebar={sidebarOpen}/>
      }

    </PageHeader>
  );
};
