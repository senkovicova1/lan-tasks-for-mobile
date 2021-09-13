import React, {
  useState,
  useEffect,
  useMemo
} from 'react';
import {
  Link
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import { SettingsIcon, MenuIcon, LogoutIcon, CloseIcon, SearchIcon, LeftArrowIcon, UserIcon, MenuIcon2 } from  "/imports/other/styles/icons";

import Menu from './sidebar';

import {
  useTracker
} from 'meteor/react-meteor-data';

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

  const {
    match,
    location,
    setSearch,
    search,
    setParentOpenSidebar,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection
  } = props;

  const folderID = match.params.folderID;

  const currentUser = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();

  const logout = () => Meteor.logout();

  const folders = useSelector((state) => state.folders.value);

  const [ openSidebar, setOpenSidebar ] = useState(true);
  const [ openSort, setOpenSort ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(true);
  const [ title, setTitle ] = useState("TaskApp");
  const [ background, setBackground ] = useState("#0078d4");

  useEffect(() => {
    if (location.pathname === "/folders/archived") {
      setTitle("Archived Folders");
      setBackground("#0078d4");
    }
    if (!folderID || folderID === "all") {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
    let folder = folders.find(folder => folder._id === folderID);
    if (folder) {
      setTitle(folder.name);
      setBackground(folder.colour);
    } else {
      setTitle("TaskApp");
      setBackground("#0078d4");
    }
  }, [folderID, location.pathname, folders]);

  const avatar = useMemo(() => {
    if (!currentUser || !currentUser.profile.avatar){
      return null;
    }
    return uint8ArrayToImg(currentUser.profile.avatar);
  }, [currentUser])

  const canEditFolder = useMemo(() => {
    if (folderID && folderID !== 'all' && folders.length > 0) {
      const folder = folders.find(f => f._id === folderID);
      const user = folder.users.find(user => user._id === userId);
      return user.admin;
    }
    return false;
  }, [folderID, folders, userId]);

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

  return (
    <PageHeader style={{backgroundColor: background}}>
      <section className="header-section">
        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSidebar(!openSidebar);
              setParentOpenSidebar(!openSidebar);
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
            onChange={(e) => setSearch(e.target.value)}
            />
        <LinkButton
          font="#0078d4"
          searchButton
          onClick={(e) => {
            e.preventDefault();
            setSearch("");
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
          {
            avatar &&
          <img className="avatar" src={avatar} alt="assignedAvatar" />
          }
          {
            !avatar &&
            <img className="icon" src={UserIcon} alt="assignedAvatar" />
          }
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
        openSidebar &&
        currentUser &&
        <Menu {...props} setBackground={setBackground} widthWithSidebar={openSidebar} closeSelf={() => setOpenSidebar(false)}/>
      }

        {
          openSort &&
          <Sort id="sort-menu" name="sort-menu">
            <h3>Sort by</h3>
            <span>
              <input
                id="sort-by-name-asc"
                name="sort-by-name-asc"
                type="checkbox"
                checked={sortBy === "name" && sortDirection === "asc"}
                onChange={() => {
                  setSortBy("name");
                  setSortDirection("asc");
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="sort-by-name-asc">Name (ascending)</label>
            </span>

              <span>
                <input
                  id="sort-by-name-desc"
                  name="sort-by-name-desc"
                  type="checkbox"
                  checked={sortBy === "name" && sortDirection === "desc"}
                  onChange={() => {
                    setSortBy("name");
                    setSortDirection("desc");
                    if (/Mobi|Android/i.test(navigator.userAgent)) {
                      setOpenSort(!openSort);
                    }
                  }}
                  />
                <label htmlFor="sort-by-name-desc">Name (descending)</label>
              </span>

                <span>
                  <input
                    id="sort-by-assigned-asc"
                    name="sort-by-assigned-asc"
                    type="checkbox"
                    checked={sortBy === "assigned" && sortDirection === "asc"}
                    onChange={() => {
                      setSortBy("assigned");
                      setSortDirection("asc");
                      if (/Mobi|Android/i.test(navigator.userAgent)) {
                        setOpenSort(!openSort);
                      }
                    }}
                    />
                  <label htmlFor="sort-by-name-asc">Assigned user (ascending)</label>
                </span>

                  <span>
                    <input
                      id="sort-by-assigned-desc"
                      name="sort-by-assigned-desc"
                      type="checkbox"
                      checked={sortBy === "assigned" && sortDirection === "desc"}
                      onChange={() => {
                        setSortBy("assigned");
                        setSortDirection("desc");
                        if (/Mobi|Android/i.test(navigator.userAgent)) {
                          setOpenSort(!openSort);
                        }
                      }}
                      />
                    <label htmlFor="sort-by-name-asc">Assigned user (descending)</label>
                  </span>

                    <span>
                      <input
                        id="sort-by-date-asc"
                        name="sort-by-date-asc"
                        type="checkbox"
                        checked={sortBy === "date" && sortDirection === "asc"}
                        onChange={() => {
                          setSortBy("date");
                          setSortDirection("asc");
                          if (/Mobi|Android/i.test(navigator.userAgent)) {
                            setOpenSort(!openSort);
                          }
                        }}
                        />
                      <label htmlFor="sort-by-name-asc">Date created (ascending)</label>
                    </span>

                      <span>
                        <input
                          id="sort-by-date-desc"
                          name="sort-by-date-desc"
                          type="checkbox"
                          checked={sortBy === "date" && sortDirection === "desc"}
                          onChange={() => {
                            setSortBy("date");
                            setSortDirection("desc");
                            if (/Mobi|Android/i.test(navigator.userAgent)) {
                              setOpenSort(!openSort);
                            }
                          }}
                          />
                        <label htmlFor="sort-by-name-asc">Date created (descending)</label>
                      </span>
          </Sort>
        }

    </PageHeader>
  );
};
