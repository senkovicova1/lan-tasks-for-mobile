import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import Select from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  translations
} from '../../other/translations.jsx';

import {
  Form,
  FormTable,
  Input,
  Textarea,
  ButtonRow,
  FullButton,
  GroupButton,
  LinkButton
} from "../../other/styles/styledComponents";

export default function TaskForm( props ) {

  const {
    match,
    _id: taskId,
    name: taskName,
    assigned: taskAssigned,
    folder: taskFolder,
    language,
    onSubmit,
    onCancel,
  } = props;

  const folderID = match.params.folderID;

  const userId = Meteor.userId();
  const dbUsers = useSelector((state) => state.users.value);
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);

  const [ name, setName ] = useState( "" );
  const [ assigned, setAssigned ] = useState( "" );

  useEffect( () => {
    if ( taskName ) {
      setName( taskName );
    } else {
      setName( "" );
    }
    if ( taskAssigned ) {
      setAssigned( taskAssigned );
    } else {
      setAssigned( dbUsers.find(user => user._id === userId ) );
    }
  }, [ taskName, taskAssigned, dbUsers, userId ] );

  const usersWithRights = useMemo(() => {
    if (folder){
       return folder.users.map(user =>
            {
            let newUser = {...dbUsers.find(u => u._id === user._id), ...user};
            return newUser;
          });
    }
    return [];
  }, [folder, dbUsers]);

  document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
      case 13 :
      if (name.length > 0){
        onSubmit(
          name,
          assigned._id,
          folderID,
          moment().unix()
        );
      }
      break;
    }
  }

  return (
    <Form>

      <section>
        <label htmlFor="name">{translations[language].name}</label>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="assigned">{translations[language].assigned}</label>
        <Select
          id="assigned"
          name="assigned"
          styles={selectStyle}
          value={assigned}
          onChange={(e) => {
            setAssigned(e);
          }}
          options={usersWithRights}
          />
      </section>

      <ButtonRow>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>{translations[language].cancel}</FullButton>
        <FullButton
          colour=""
          disabled={name.length === 0}
          onClick={(e) => {e.preventDefault(); onSubmit(
            name,
            assigned._id,
            folderID,
            moment().unix()
          );}}
          >
          {translations[language].save}
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
