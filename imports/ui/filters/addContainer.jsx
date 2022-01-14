import React, {
  useMemo,
  useState,
}  from 'react';

import {
  Meteor
} from 'meteor/meteor';

import {
  useSelector,
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
  FullButton,
  Input,
  Form,
  ButtonRow,
} from '/imports/other/styles/styledComponents';

import {
  translations
} from '/imports/other/translations';

export default function AddFilterContainer( props ) {

  const dispatch = useDispatch();

  const {
    title,
    folders,
    important,
    assigned,
    datetimeMin,
    datetimeMax,
    dateCreatedMin,
    dateCreatedMax,
    showClosed,
    setSaveFilter,
    setOpenFilter,
  } = props;

  const userId = Meteor.userId();
  const dbUsers = useSelector( ( state ) => state.users.value );
  const language = useMemo( () => {
    return dbUsers.find( user => user._id === userId ).language;
  }, [ userId, dbUsers ] );

  const [ newFilterName, setNewFilterName] = useState("");


  return (
    <Modal isOpen={true}>
      <ModalBody>
        <Form>
        <h2>{translations[language].addFilter}</h2>
          <section className="inline">
            <span className="icon-container">
              {translations[language].name}
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
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); setSaveFilter(false);}}>{translations[language].cancel}</FullButton>
          <FullButton
            colour=""
            disabled={newFilterName.length === 0}
            onClick={(e) => {
              e.preventDefault();
              Meteor.call(
                'filters.addFilter',
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
                showClosed,
                (err, response) => {
                if (err) {
                  console.log(err);
                } else if (response) {
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
                    showClosed
                  }));
                  setOpenFilter(false);
                }
              }
            );
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      </Form>
      </ModalBody>
    </Modal>
  );
};
