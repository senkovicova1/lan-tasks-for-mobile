import React from 'react';

import Form from './form';

import {
  addRepeat
} from './repeatsHandlers';

export default function AddRepeatContainer( props ) {

  const submit = (intervalNumber, intervalFrequency, customInterval, useCustomInterval, repeatUntil, tasks) => {
    Meteor.call(
      'repeats.addRepeat',
      intervalNumber,
      intervalFrequency,
      customInterval,
      useCustomInterval,
      repeatUntil,
      tasks,
      (_id) => {console.log("_id");},
      (error) => {console.log(error);}
    );
  }

  return (
    <Form onSubmit={addRepeat}/>
  );
};
