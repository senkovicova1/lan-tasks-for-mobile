import React, {
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setLayout,
  setSortBy,
  setSortDirection
} from '/imports/redux/metadataSlice';

import {
  Sort,
  Input,
} from '/imports/other/styles/styledComponents';

import {
  PLAIN,
  COLUMNS,
  CALENDAR,
  DND,
  sortByOptions,
  sortDirectionOptions,
} from "/imports/other/constants";

import {
  translations
} from '/imports/other/translations';

export default function SortAndLayout( props ) {

  const dispatch = useDispatch();

  const {
    match,
    setOpenSort,
  } = props;

  const {folderID} = match.params;

  const {
    layout,
    sortBy,
    sortDirection,
  } = useSelector( ( state ) => state.metadata.value );

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
    const language = useMemo( () => {
      if (dbUsers.length > 0){
      return dbUsers.find( user => user._id === userId ).language;
    }
    return "en";
    }, [ userId, dbUsers ] );

  const [ openFilter, setOpenFilter ] = useState( false );
  const [ newFilter, setNewFilter] = useState();
  const [ newSearch, setNewSearch] = useState("");

  return (
    <Sort id="sort-menu" name="sort-menu">
      {
        window.innerWidth > 820 &&
        <h3>{translations[language].layout}</h3>
      }
        {
          window.innerWidth > 820 &&
        <span>
          <input
            id="plain-layout"
            name="plain-layout"
            type="checkbox"
            checked={layout === PLAIN}
            onChange={() => {
              dispatch(setLayout(PLAIN));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label htmlFor="plain-layout">
            {translations[language].list}
          </label>
        </span>
      }
        {
          window.innerWidth > 820 &&
        <span>
          <input
            id="columns-layout"
            name="columns-layout"
            type="checkbox"
            checked={layout === COLUMNS}
            onChange={() => {
              dispatch(setLayout(COLUMNS));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label htmlFor="columns-layout">{translations[language].columns}</label>
        </span>
      }
        {
          window.innerWidth > 820 &&
        <span>
          <input
            id="calendar-layout"
            name="calendar-layout"
            type="checkbox"
            checked={layout === CALENDAR}
            onChange={() => {
              dispatch(setLayout(CALENDAR));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label htmlFor="calendar-layout">{translations[language].calendar}</label>
        </span>
      }
        {
          window.innerWidth > 820 &&
          folderID &&
          !location.pathname.includes('all') &&
          !location.pathname.includes('important') &&
        <span>
          <input
            id="dnd-layout"
            name="dnd-layout"
            type="checkbox"
            checked={layout === DND}
            onChange={() => {
              dispatch(setLayout(DND));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label htmlFor="dnd-layout">{translations[language].dnd}</label>
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
                setOpenSort(false);
              }
            }}
            />
          <label htmlFor={"customOrder"}>{translations[language].customOrder}</label>
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
                  setOpenSort(false);
                }
              }}
              />
            <label htmlFor={item.value}>{item.label}</label>
          </span>
        ))
      }
    </Sort>
  );
};
