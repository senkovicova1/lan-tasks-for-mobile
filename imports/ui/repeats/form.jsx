import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Select from 'react-select';

import moment from 'moment';

import Datetime from 'react-datetime';

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Form,
  Input,
  ButtonCol,
  LinkButton,
  FullButton,
} from "/imports/other/styles/styledComponents";

import {
  translations
} from '/imports/other/translations';

export default function RepeatForm( props ) {

  const {
    repeat,
    setRepeat,
  } = props;

  const user = useTracker( () => Meteor.user() );
  const language = useMemo( () => {
    return user.profile.language;
  }, [ user ] );

  const [ intervalNumber, setIntervalNumber ] = useState( 1 );
  const [ intervalFrequency, setIntervalFrequency ] = useState( {label: "week", value: "w"} );
  const [ customInterval, setCustomInterval ] = useState( [false, false, false, false, false, false, false] );
  const [ useCustomInterval, setUseCustomInterval ] = useState( false );
  const [ repeatUntil, setRepeatUntil ] = useState( moment().add(7, "days").unix() );

  useEffect(() => {
    if (repeat && typeof repeat !== "array"){
      setIntervalNumber(repeat.intervalNumber);
      setIntervalFrequency([{label: intervalNumber === 1 ? "day" : "days", value: "d"}, {label: intervalNumber === 1 ? "week" : "weeks", value: "w"}, {label: intervalNumber === 1 ? "month" : "months", value: "m"}, {label: intervalNumber ? "y" : "years", value: "years"}].find(interval => interval.value === repeat.intervalFrequency));
      setCustomInterval(repeat.customInterval);
      setUseCustomInterval(repeat.useCustomInterval);
      setRepeatUntil(repeat.repeatUntil);
    }
  }, [repeat]);

  return (
    <div>

      <section className="inline">
        <label >Repeat every</label>
        <Input
          id="intervalNumber"
          name="intervalNumber"
          style={{width: "50%"}}
          type="number"
          placeholder={translations[language].enterName}
          value={intervalNumber}
          onChange={(e) => setIntervalNumber(e.target.value)}
          />
        <div style={{width: "50%"}}>
          <Select
            styles={selectStyle}
            value={intervalFrequency}
            onChange={(e) => {
              setIntervalFrequency(e);
            }}
            options={[{label: intervalNumber === 1 ? "day" : "days", value: "days"}, {label: intervalNumber === 1 ? "week" : "weeks", value: "weeks"}, {label: intervalNumber === 1 ? "month" : "months", value: "moths"}, {label: intervalNumber ? "year" : "years", value: "years"}]}
            />
        </div>
      </section>

      <section className="inline">
        <label >Repeat until</label>
        <Datetime
          className="full-width"
          dateFormat={"DD.MM.yyyy"}
          value={moment.unix(repeatUntil)}
          timeFormat={false}
          name="repeatUntil"
          id="repeatUntil"
          inputProps={{
          placeholder: 'Set date',
          }}
          onChange={(date) => {
            if (typeof date !== "string"){
                setRepeatUntil(date.unix());
              } else {
                setRepeatUntil(date);
              }
            }}
              />
      </section>

      <ButtonCol>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); }}>{translations[language].cancel}</FullButton>
        {
          true &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); }}>{translations[language].delete}</FullButton>
        }
        <FullButton
          colour=""
          onClick={(e) => {
            e.preventDefault();
            setRepeat({intervalNumber, intervalFrequency: intervalFrequency.value, useCustomInterval, customInterval, repeatUntil});
          }}
          >
          {translations[language].save}
        </FullButton>
      </ButtonCol>

    </div>
  );
};
