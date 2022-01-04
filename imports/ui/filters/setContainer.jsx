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
import FilterForm from './form';

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

export default function AddFilterContainer( props ) {

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

      const [ saveFilter, setSaveFilter] = useState(false);
      const [ newFilter, setNewFilter] = useState({});
      const [ newSearch, setNewSearch] = useState("");

  return (
    <StyledFilter>

        <FilterForm
          {...props}
          filter={filter}
          search={search}
          setSaveFilter={setSaveFilter}
          setOpenFilter={setOpenFilter}
          setNewFilterInParent={setNewFilter}
          setNewSearchInParent={setNewSearch}
          />

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
