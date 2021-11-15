import React, {
  useState,
  useMemo
}  from 'react';
import {
  Meteor
} from 'meteor/meteor';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import moment from 'moment';

import {
  setFilter,
  setSearch
} from '/imports/redux/metadataSlice';

import {
  CloseIcon,
  UserIcon,
  FullStarIcon,
  EmptyStarIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  AsteriskIcon,
  MenuIcon,
  CheckMarkIcon
} from "/imports/other/styles/icons";

import {
  AppliedFilter,
  LinkButton,
} from '/imports/other/styles/styledComponents';

import {
  translations
} from '/imports/other/translations';

export default function FilterSummary( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    style
  } = props;

  const {
    folderID,
    filterID
  } = match.params;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );

  const {
    filter,
    search,
    searchInFilter,
  } = useSelector( ( state ) => state.metadata.value );

  const numberOfFilters = useMemo(() => {
    return (search && searchInFilter ? 1 : 0) +
              ((["all", "important"].includes(folderID) && filter.folders.length > 0) ? 1 : 0) +
              (filter.important ? 1 : 0) +
              (filter.assigned.length > 0 ? 1 : 0) +
              (filter.datetimeMin || filter.datetimeMax ? 1 : 0) +
              (filter.dateCreatedMin || filter.dateCreatedMax ? 1 : 0) +
              (filter.showClosed ? 1 : 0);
  }, [filter, search]);

  const language = useMemo( () => {
    if (dbUsers.length > 0){
      return dbUsers.find( user => user._id === userId ).language;
    }
    return "en";
  }, [ userId, dbUsers ] );

  if (numberOfFilters > 0){

  return (
    <AppliedFilter style={style}>
      {
      search &&
      searchInFilter &&
        <section className="filter">
          <div className="filter-container">
          <img
            className="label-icon"
            src={MenuIcon}
            alt="MenuIcon icon not found"
            />
          <label>{search}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setSearch(""));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }
      {
      (  ["all", "important"].includes(folderID) || filterID ) &&
        filter.folders.length > 0 &&
        <section className="filter">
          <div className="filter-container">
          <img
            className="label-icon"
            src={FolderIcon}
            alt="FolderIcon icon not found"
            />
          <label>{filter.folders.map(folder => folder.name).join(", ")}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, folders: []}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }
      {
        filter.important &&
        <section className="filter">
          <div className="filter-container">
          <img
            className="label-icon"
            src={EmptyStarIcon}
            alt="EmptyStarIcon icon not found"
            />
          <label>Important</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, important: false}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }
      {
        filter.assigned.length > 0 &&
        <section className="filter">
          <div className="filter-container">
          <img
            className="label-icon"
            src={UserIcon}
            alt="UserIcon icon not found"
            />
          <label>{filter.assigned.map(user => user.label).join(", ")}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, assigned: []}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }
      {
        (filter.datetimeMin || filter.datetimeMax)  &&
        <section className="filter">
          <div className="filter-container">
          <img
            className="label-icon"
            src={CalendarIcon}
            alt="CalendarIcon icon not found"
            />
          <label>{`${filter.datetimeMin ? moment.unix(filter.datetimeMin).format("D.M.YYYY") : translations[language].noStartDate} - ${filter.datetimeMax ? moment.unix(filter.datetimeMax).format("D.M.YYYY") : translations[language].noEndDate}`}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, datetimeMin: "", datetimeMax: ""}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }
      {
        (filter.dateCreatedMin || filter.dateCreatedMax)  &&
        <section className="filter">
          <div className="filter-container">
          <img
            style={{width: "auto"}}
            className="label-icon"
            src={AsteriskIcon}
            alt="AsteriskIcon icon not found"
            />
          <label>{`${filter.dateCreatedMin ? moment.unix(filter.dateCreatedMin).format("D.M.YYYY") : translations[language].noStartDate} - ${filter.dateCreatedMax ? moment.unix(filter.dateCreatedMax).format("D.M.YYYY") : translations[language].noEndDate}`}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, dateCreatedMin: "", dateCreatedMax: ""}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }

      {
        filter.showClosed  &&
        <section className="filter">
          <div className="filter-container">
          <img
            style={{width: "auto", marginLeft: "0.3em"}}
            className="label-icon"
            src={CheckMarkIcon}
            alt="CheckMarkIcon icon not found"
            />
          <label>{translations[language].showClosed}</label>
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(setFilter({...filter, showClosed: false}));
              }}
              >
              <img
                className="icon"
                src={CloseIcon}
                alt="Close icon not found"
                />
            </LinkButton>
        </div>
        </section>
      }

      {
        numberOfFilters >= 2 &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            dispatch(setSearch(""));
            dispatch(setFilter({
              folders: [],
              important: false,
              datetimeMin: "",
              datetimeMax: "",
              assigned: [],
              dateCreatedMin: "",
              dateCreatedMax: "",
              showClosed: false,
            }));
          }}
          >
          {translations[language].removeAllFitlers}
        </LinkButton>
      }
    </AppliedFilter>
  );
}

return (<div></div>);
};
