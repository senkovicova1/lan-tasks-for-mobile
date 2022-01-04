import React, {
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setSearch,
  setSearchInFilter
} from '/imports/redux/metadataSlice';

import Filter from '/imports/ui/filters/setContainer';

import {
  CloseIcon,
  SearchIcon,
  FilterIcon,
} from "/imports/other/styles/icons";

import {
  LinkButton,
  SearchSection,
  Input,
} from '/imports/other/styles/styledComponents';

export default function Search( props ) {

    const dispatch = useDispatch();

    const {
      search,
      filter
    } = useSelector( ( state ) => state.metadata.value );

    const [ openFilter, setOpenFilter ] = useState( false );
    const [ newFilter, setNewFilter] = useState();
    const [ newSearch, setNewSearch] = useState("");

  return (
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
        onChange={(e) => {
          dispatch(setSearch(e.target.value));
          dispatch(setSearchInFilter(false));
        }}
        />
      <LinkButton
        font="#0078d4"
        searchButton
        onClick={(e) => {
          e.preventDefault();
          dispatch(setSearch(""));
          dispatch(setSearchInFilter(true));
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
          dispatch(setSearchInFilter(true));
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
      <Filter {...props} setOpenFilter={setOpenFilter} />
    }
    </SearchSection>

  );
};
