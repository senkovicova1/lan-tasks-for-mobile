import React, {
  useState,
}  from 'react';
import {
  Meteor
} from 'meteor/meteor';

import {
  useDispatch
} from 'react-redux';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  setFilter,
  setSearch
} from '/imports/redux/metadataSlice';

import {
  addFilter
} from '/imports/ui/filters/filtersHandlers';

import {
  FullButton,
  Input,
  Form,
  ButtonRow,
} from '/imports/other/styles/styledComponents';

export default function AddFilterContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    title,
    folders,
    important,
    assigned,
    datetimeMin,
    datetimeMax,
    dateCreatedMin,
    dateCreatedMax,
    setSaveFilter,
    setOpenFilter,
  } = props;

  const userId = Meteor.userId();

  const [ newFilterName, setNewFilterName] = useState("");

  return (
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
        <ButtonRow>
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); setSaveFilter(false);}}>Cancel</FullButton>
          <FullButton
            colour=""
            disabled={newFilterName.length === 0}
            onClick={(e) => {
              e.preventDefault();
              addFilter(
                newFilterName,
                userId,
                title,
                folders.map(folder => folder._id),
                important,
                assigned.map(a => a._id),
                datetimeMin,
                datetimeMax,
                dateCreatedMin,
                dateCreatedMax,
                () => {
                  setSaveFilter(false);
                  dispatch(setSearch(title));
                  dispatch(setFilter({
                      title,
                      folders,
                      important,
                      assigned,
                      datetimeMin,
                      datetimeMax,
                      dateCreatedMin,
                      dateCreatedMax,
                    }));
                  setOpenFilter(false);
                },
                (error) => {console.log(error)}
              );
            }}
            >
            Save
          </FullButton>
        </ButtonRow>
      </Form>
      </ModalBody>
    </Modal>
  );
};
