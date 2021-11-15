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

import {
  Modal,
  ModalBody
} from 'reactstrap';

import Loader from "/imports/ui/other/loadingScreen";

import {
  setSearch,
  setFilter
} from '/imports/redux/metadataSlice';

import {
  editFilter,
  removeFilter
} from '/imports/ui/filters/filtersHandlers';

import FilterForm from './form';

export default function EditFilterContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    filterId,
    setEditFilter,
  } = props;

  const userId = Meteor.userId();
  const filters = useSelector( ( state ) => state.filters.value );

  const submit = ( _id, name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, showClosed) => {
    Meteor.call(
      'filters.editFilter',
      _id,
      name,
      user,
      title,
      folders.map(folder => folder._id),
      important,
      assigned.map(a => a._id),
      datetimeMin,
      datetimeMax,
      dateCreatedMin,
      dateCreatedMax,
      showClosed,
      (err, response) => {
      if (err) {
        console.log(err);
      } else if (response) {
        setEditFilter(null);
      }
    }
    )
  }

  const remove = () => {
    if ( window.confirm( "Are you sure you want to permanently remove this filter?" ) ) {
      Meteor.call(
        'filters.removeFilter',
        filterId
      )
      setEditFilter(null);
    }
  }

  const cancel = () => {
    setEditFilter(null);
  }

  const filter = useMemo(() => {
    return filters.find(filter => filter._id === filterId);
  }, [filterId, filters]);

  if (!filter){
    <Loader />
  }

  return (
    <Modal isOpen={true}>
      <ModalBody>
        <FilterForm
          {...props}
          filterId={filterId}
          filter={filter}
          submit={submit}
          cancel={cancel}
          remove={remove}
          />
      </ModalBody>
    </Modal>
  );
};
