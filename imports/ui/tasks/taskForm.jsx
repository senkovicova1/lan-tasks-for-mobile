import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import Select from 'react-select';
import moment from 'moment';

import {
  Icon
} from '@fluentui/react/lib/Icon';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  Form,
  FormTable,
  Input,
  Textarea,
  TitleInput,
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
    onSubmit,
    onCancel,
  } = props;

  const [ name, setName ] = useState( "" );

  useEffect( () => {
    if ( taskName ) {
      setName( taskName );
    } else {
      setName( "" );
    }
  }, [ taskName ] )

  return (
    <Form>

      <section>
        <label htmlFor="name">Name</label>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <ButtonRow className="useOffset">
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>Cancel</FullButton>
        <FullButton
          colour=""
          disabled={name.length === 0}
          onClick={(e) => {e.preventDefault(); onSubmit(
            name,
            match.params.folderID,
            moment().unix()
          );}}
          >
          Save
        </FullButton>
      </ButtonRow>

    </Form>
  );
};
