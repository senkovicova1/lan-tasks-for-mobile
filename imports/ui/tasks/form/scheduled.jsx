import React from 'react';

import Select from 'react-select';

import moment from 'moment';

import Datetime from 'react-datetime';

import {
  CloseIcon,
  ClockIcon,
  CalendarIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Input,
  ButtonRow,
  LinkButton,
  FullButton,
  DatetimePicker
} from "/imports/other/styles/styledComponents";

import {
  REMOVED_START_END,
  SET_START,
  SET_END,
 REMOVED_REPEAT,
 CHANGE_REPEAT,
 SET_REPEAT,
 historyEntryTypes
} from '/imports/other/messages';

import {
  translations
} from '/imports/other/translations';

export default function Scheduled( props ) {

  const {
    userId,
    taskId,
    allDay,
    setAllDay,
    startDatetime,
    setStartDatetime,
    possibleStartDatetime,
    setPossibleStartDatetime,
    endDatetime,
    setEndDatetime,
    possibleEndDatetime,
    setPossibleEndDatetime,
    repeat,
    setRepeat,
    possibleRepeat,
    setPossibleRepeat,
    allTasks,
    history,
    language,
    addNewTask,
    openDatetime,
    setOpenDatetime,
  } = props;

  const hoursAndMinutes = () => {
    let options = [];
    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 59; m = m+15) {
        options.push({label: `${h}:${m}`, value: `${h}:${m}`, hours: h, minutes: m});
      }
    }
    return options;
  };

  const getLabelFromRepeatFrequency = (value, number) => {
    switch (value) {
      case "d":
        return parseInt(number) === 1 ? "day" : "days";
        break;
          case "w":
            return parseInt(number) === 1 ? "week" : "weeks";
            break;
              case "m":
              return parseInt(number) === 1 ? "month" : "months";
                break;
        case "y":
          return parseInt(number) === 1 ? "year" : "years";
          break;
    }
  }

if (closed || !openDatetime){
  return (
    <section className="inline">
      <span className="icon-container">
        <img
          className="label-icon"
          htmlFor="deadline"
          src={CalendarIcon}
          alt="Calendar icon not found"
          />
      </span>
      <span className={"datetime-span" + (closed ? " closed" : "")} >
      <span
        onClick={() => setOpenDatetime(true)}
        >
        {
          !closed &&
          !startDatetime &&
          !endDatetime &&
          translations[language].setScheduled
        }
        {
          closed &&
          !startDatetime &&
          !endDatetime &&
          translations[language].notScheduled
        }
        {
          (startDatetime || endDatetime) &&
          !allDay &&
          (`${moment.unix(startDatetime).format("D.M.YYYY HH:mm")} - ${moment.unix(endDatetime).format("HH:mm")}` + (repeat ? ` (repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? "until" : ""} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""})` : "")
        )
        }
        {
          (startDatetime || endDatetime) &&
          allDay &&
          (`${moment.unix(startDatetime).format("D.M.YYYY")} - ${moment.unix(endDatetime).format("D.M.YYYY")}` + ( repeat ? ` (repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? "until" : ""} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""})` : "")
        )
        }
      </span>
      {
        !closed &&
      <LinkButton
        style={{height: "40px", marginLeft: "auto"}}
        className="left"
        height="fit"
        disabled={closed}
        onClick={(e) => {
          e.preventDefault();
          const oldStart = startDatetime;
          const oldEnd = endDatetime;
          setStartDatetime("");
          setEndDatetime("");
          setRepeat(null);
          if ( !addNewTask ) {
            Meteor.call(
              'tasks.updateSimpleAttribute',
              taskId,
              {
                name: e.target.value,
                startDatetime: "",
                endDatetime: "",
                repeat: null
              }
            );
            removeTaskFromRepeat(taskId, repeat._id, dbTasks);

            const historyData1 = {
              dateCreated: moment().unix(),
              user: userId,
              type: REMOVED_START_END,
              args: [],
            }
            const historyData2 = {
              dateCreated: moment().unix(),
              user: userId,
              type: REMOVED_REPEAT,
              args: [],
            }
            if (history.length === 0){
                Meteor.call(
                  'history.addNewHistory',
                  taskId,
                  [
                    historyData1,
                    historyData2
                  ]
                );
            } else {
              Meteor.call(
                'history.editHistory',
                history[0]._id,
                historyData1
              )
                Meteor.call(
                  'history.editHistory',
                  history[0]._id,
                  historyData2
                )
            }
            if (assigned.length > 0){
              assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                const notificationData1 = {
                  ...historyData1,
                  args: [name],
                  read: false,
                  taskId,
                  folderId: folder._id,
                };
                const notificationData2 = {
                  ...historyData2,
                  args: [name],
                  read: false,
                  taskId,
                  folderId: folder._id,
                };
               if (usersNotifications.notifications.length > 0){
                 Meteor.call(
                   'notifications.editNotifications',
                    assigned._id,
                    assigned.email,
                    notificationData1,
                    dbUsers
                  );
                    Meteor.call(
                      'notifications.editNotifications',
                       assigned._id,
                       assigned.email,
                       notificationData2,
                       dbUsers
                     );
                } else {
                  Meteor.call(
                    'notifications.addNewNotification',
                    assigned._id,
                    assigned.email,
                    [
                      notificationData1,
                      notificationData2
                    ],
                    dbUsers
                   );
                }
              })
            }
          }
        }}
        >
          <img
            style={{margin: "0px"}}
            className="icon"
            src={CloseIcon}
            alt="CloseIcon star icon not found"
            />
      </LinkButton>
    }
    </span>
    </section>
  )
}

  if (!closed && openDatetime){
    return (
          <div>
          <DatetimePicker>
            <section>
            <h3>{translations[language].setScheduled}</h3>
          </section>
          <section className="inline">
              {
                allDay &&
                <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                From:
                </span>
              }
                  {
                    !allDay &&
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    Date:
                    </span>
                  }
              <Datetime
                className="full-width"
                dateFormat={"DD.MM.yyyy"}
                value={possibleStartDatetime ? moment.unix(possibleStartDatetime) : possibleStartDatetime}
                timeFormat={false}
                name="startDate"
                id="startDate"
                inputProps={{
                  placeholder: translations[language].setDate,
                }}
                onChange={(date) => {
                  if (typeof date !== "string"){
                      const newYear = date.year();
                      const newMonth = date.month();
                      const newDay = date.date();
                      const newEndDatetime = moment(endDatetime ? endDatetime*1000 : date.unix()).year(newYear).month(newMonth).date(newDay);
                      setPossibleStartDatetime(date.unix());
                      setPossibleEndDatetime(newEndDatetime.unix());
                  } else {
                      setPossibleStartDatetime(date);
                  }
                }}
                renderInput={(props) => {
                    return <Input
                      {...props}
                      disabled={closed}
                      value={possibleStartDatetime ? props.value : ''}
                      />
                }}
                />
                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    setPossibleStartDatetime("");
                  }}
                  >
                    <img
                      style={{margin: "0px"}}
                      className="icon"
                      src={CloseIcon}
                      alt="CloseIcon star icon not found"
                      />
                </LinkButton>
              </section>
              {
                !allDay &&
                <section className="inline">
                  <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                    {translations[language].from}
                  </span>

                  <div style={{width: "100%"}}>
                    <Select
                      name="startTime"
                      id="startTime"
                      isDisabled={closed}
                      styles={selectStyle}
                      value={possibleStartDatetime ? {label: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, value: `${moment(possibleStartDatetime*1000).hours()}:${moment(possibleStartDatetime*1000).minutes()}`, hours: moment(possibleStartDatetime*1000).hours(), minutes: moment(possibleStartDatetime*1000).minutes()} : null}
                      placeholder={"Set time"}
                      onChange={(e) => {
                        const newStartDatetime = moment(possibleStartDatetime*1000).hours(e.hours).minutes(e.minutes);
                        if (typeof newStartDatetime !== "string"){
                            setPossibleStartDatetime(newStartDatetime.unix());
                        } else {
                            setPossibleStartDatetime(newStartDatetime);
                        }
                      }}
                      options={hoursAndMinutes()}
                      />
                  </div>

                <LinkButton
                  style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                  height="fit"
                  disabled={closed}
                  onClick={(e) => {
                    e.preventDefault();
                    const newHour = 0;
                    const newMinute = 0;
                    const newSecond = 0;
                    const newStartDatetime = moment(possibleStartDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                    setPossibleStartDatetime(newStartDatetime.unix());
                  }}
                  >
                    <img
                      style={{margin: "0px"}}
                      className="icon"
                      src={CloseIcon}
                      alt="CloseIcon star icon not found"
                      />
                </LinkButton>
              </section>
              }
                {
                  !allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      {translations[language].to}
                    </span>
                    <div style={{width: "100%"}}>
                      <Select
                        name="endTime"
                        id="endTime"
                        isDisabled={closed}
                        styles={selectStyle}
                        value={possibleEndDatetime ? {label: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, value: `${moment(possibleEndDatetime*1000).hours()}:${moment(possibleEndDatetime*1000).minutes()}`, hours: moment(possibleEndDatetime*1000).hours(), minutes: moment(possibleEndDatetime*1000).minutes()} : null}
                        placeholder={"Set time"}
                        onChange={(e) => {
                          let newEndDatetime = moment(possibleEndDatetime*1000).hours(e.hours).minutes(e.minutes);
                          if (typeof newEndDatetime !== "string"){
                              setPossibleEndDatetime(newEndDatetime.unix());
                          } else {
                              setPossibleEndDatetime(newEndDatetime);
                          }
                        }}
                        options={hoursAndMinutes()}
                        />
                    </div>

                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      const newHour = 0;
                      const newMinute = 0;
                      const newSecond = 0;
                      const newEndDatetime = moment(possibleEndDatetime*1000).hour(newHour).minute(newMinute).second(newSecond);
                      setPossibleEndDatetime(newEndDatetime.unix());
                    }}
                    >
                      <img
                        style={{margin: "0px"}}
                        className="icon"
                        src={CloseIcon}
                        alt="CloseIcon star icon not found"
                        />
                  </LinkButton>
                </section>
                }
                {
                  allDay &&
                  <section className="inline">
                    <span className="icon-container" style={{width: "45px", justifyContent: "center"}}>
                      {translations[language].to}
                    </span>
                  <Datetime
                    className="full-width"
                    dateFormat={"DD.MM.yyyy"}
                    value={possibleEndDatetime ? moment.unix(possibleEndDatetime) : possibleEndDatetime}
                    timeFormat={false}
                    name="endDate"
                    id="endDate"
                    inputProps={{
                    placeholder: translations[language].setDate,
                    }}
                    onChange={(date) => {
                      if (typeof date !== "string"){
                          setPossibleEndDatetime(date.unix());
                      } else {
                          setPossibleEndDatetime(date);
                      }
                    }}
                    renderInput={(props) => {
                        return <Input
                          {...props}
                          disabled={closed}
                           value={possibleEndDatetime ? props.value : ''}
                          />
                    }}
                    />
                  <LinkButton
                    style={{height: "40px", marginRight: "0.6em", marginLeft: "0.6em"}}
                    height="fit"
                    disabled={closed}
                    onClick={(e) => {
                      e.preventDefault();
                      setPossibleEndDatetime(possibleStartDatetime);
                    }}
                    >
                      <img
                        style={{margin: "0px"}}
                        className="icon"
                        src={CloseIcon}
                        alt="CloseIcon star icon not found"
                        />
                  </LinkButton>
                  </section>
                }

          <section>
            <Input
              id='taskAllDay'
              type="checkbox"
              style={{width: "1.5em", marginLeft: "9px", marginRight: "9px"}}
              checked={allDay}
              disabled={closed}
              onChange={() =>  {
                const newAllDay = !allDay;
                setAllDay(newAllDay);

                if (!newAllDay){
                  const newYear = moment(possibleStartDatetime*1000).year();
                  const newMonth = moment(possibleStartDatetime*1000).month();
                  const newDay = moment(possibleStartDatetime*1000).date();
                  const newEndDatetime = moment(possibleEndDatetime*1000).year(newYear).month(newMonth).date(newDay);
                  setPossibleEndDatetime(newEndDatetime.unix());
                }

              }}
              />
            <span style={{marginLeft: "10px"}}>
              {translations[language].allDay}
            </span>
          </section>

            <section>
            <h3>{translations[language].setRepeat}</h3>
          </section>
        <section className="inline">
            <span className="icon-container" style={{width: "150px"}}>
          {translations[language].repeatEvery}
          </span>
          <Input
            id="intervalNumber"
            name="intervalNumber"
            style={{width: "50%", marginRight: "0.6em"}}
            type="number"
            placeholder={translations[language].setRepeat}
            value={possibleRepeat ? possibleRepeat.intervalNumber : ""}
            onChange={(e) => setPossibleRepeat({...possibleRepeat, intervalNumber: e.target.value})}
            />
          <div style={{width: "50%"}}>
            <Select
              styles={selectStyle}
              value={possibleRepeat ? possibleRepeat.intervalFrequency : ""}
              onChange={(e) => {
                setPossibleRepeat({...possibleRepeat, intervalFrequency: e})
              }}
              options={[
                {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "day" : "days",
                  value: "d"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "week" : "weeks",
                  value: "w"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) === 1 ? "month" : "months",
                  value: "m"
                }, {
                  label: possibleRepeat && parseInt(possibleRepeat.intervalNumber) ? "year" : "years",
                   value: "y"
                 }
               ]}
              />
          </div>
        </section>

        <section className="inline">
              <span className="icon-container" style={{width: "150px"}}>
            {translations[language].repeatUntil}
            </span>
          <Datetime
            className="full-width"
            dateFormat={"DD.MM.yyyy"}
            value={possibleRepeat ? moment.unix(possibleRepeat.repeatUntil) : ""}
            timeFormat={false}
            name="repeatUntil"
            id="repeatUntil"
            inputProps={{
            placeholder: translations[language].setDate,
            }}
            onChange={(date) => {
              if (typeof date !== "string"){
                  setPossibleRepeat({...possibleRepeat, repeatUntil: date.unix()});
                } else {
                  setPossibleRepeat({...possibleRepeat, repeatUntil: date});
                }
              }}
              renderInput={(props) => {
                  return <Input
                    {...props}
                    disabled={closed}
                     value={props.value}
                    />
              }}
                />
        </section>

        <section>
          <ButtonRow>
          <LinkButton
            style={{marginRight: "auto", marginLeft: "0px"}}
            onClick={(e) => {
              e.preventDefault();
              setOpenDatetime(false);
            }}
            >
            {translations[language].close}
          </LinkButton>
          <FullButton
            disabled={closed}
            onClick={(e) => {
              e.preventDefault();

              const oldStart = startDatetime;
              const oldEnd = endDatetime;

              const oldRepeat = repeat ? `Repeat every ${repeat.intervalNumber} ${getLabelFromRepeatFrequency(repeat.intervalFrequency.value, repeat.intervalNumber)} ${repeat.repeatUntil ? moment.unix(repeat.repeatUntil).format("D.M.YYYY") : ""}` : "";
              const newHistoryRepeat = possibleRepeat ?  `Repeat every ${possibleRepeat.intervalNumber} ${getLabelFromRepeatFrequency(possibleRepeat.intervalFrequency.value, possibleRepeat.intervalNumber)} ${possibleRepeat.repeatUntil ? moment.unix(possibleRepeat.repeatUntil).format("D.M.YYYY") : ""}` : "";

              setStartDatetime(possibleStartDatetime);
              setEndDatetime(possibleEndDatetime);

              if (oldRepeat !== newHistoryRepeat){
                setRepeat({...possibleRepeat});
              }

              if ( !addNewTask ) {
                if (oldRepeat !== newHistoryRepeat){
                  if (repeat && repeat._id ){
                    /*editRepeatInTask(taskRepeat, {...possibleRepeat, intervalFrequency: possibleRepeat.intervalFrequency.value , repeatStart: startDatetime ? startDatetime: possibleStartDatetime}, allTasks);*/
                  } else {
                    /*addRepeatToTask(taskId, {...possibleRepeat, intervalFrequency: possibleRepeat.intervalFrequency.value, repeatStart: startDatetime ? startDatetime: possibleStartDatetime});*/
                  }
                }

                  Meteor.call(
                    'tasks.updateSimpleAttribute',
                    taskId,
                    {
                      allDay: allDay,
                      startDatetime: possibleStartDatetime,
                      endDatetime: possibleEndDatetime
                    }
                  );

                const historyData1 = {
                  dateCreated: moment().unix(),
                  user: userId,
                  type: SET_START,
                  args: [moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleStartDatetime).format("D.M.YYYY HH:mm:ss")]
                };
                const historyData2 = {
                  dateCreated: moment().unix(),
                  user: userId,
                  type: SET_END,
                  args: [moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleEndDatetime).format("D.M.YYYY HH:mm:ss")]
                };

                let historyData3 = null;
                if (oldRepeat !== newHistoryRepeat){
                  historyData3 = {
                    dateCreated: moment().unix(),
                    user: userId,
                    type: repeat && repeat._id ? CHANGE_REPEAT : SET_REPEAT,
                    args: repeat && repeat._id ? [oldRepeat, newHistoryRepeat] : [newHistoryRepeat],
                  }
                }

                if (history.length === 0){
                  if (oldRepeat !== newHistoryRepeat){
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData1,
                        historyData2,
                        historyData3
                      ]
                    );
                  } else {
                    Meteor.call(
                      'history.addNewHistory',
                      taskId,
                      [
                        historyData1,
                        historyData2
                      ]
                    );
                  }
                } else {
                  Meteor.call(
                    'history.editHistory',
                    history[0]._id,
                    historyData1
                  )
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData2
                    )
                  if (oldRepeat !== newHistoryRepeat){
                    Meteor.call(
                      'history.editHistory',
                      history[0]._id,
                      historyData3
                    )
                  }
                }

                if (assigned.length > 0){
                  assigned.filter(assigned => assigned._id !== userId).map(assigned => {
                    let usersNotifications = notifications.find( notif => notif._id === assigned._id );
                    const notificationData1 = {
                      ...historyData1,
                      args: [name, moment.unix(oldStart).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleStartDatetime).format("D.M.YYYY HH:mm:ss")],
                      read: false,
                      taskId,
                      folderId: folder._id,
                    };
                    const notificationData2 = {
                      ...historyData2,
                      args: [name, moment.unix(oldEnd).format("D.M.YYYY HH:mm:ss"), moment.unix(possibleEndDatetime).format("D.M.YYYY HH:mm:ss")],
                      read: false,
                      taskId,
                      folderId: folder._id,
                    };

                    let notificationData3 = null;
                    if (oldRepeat !== newHistoryRepeat){
                      notificationData3 = {
                        ...historyData3,
                        args: repeat && repeat._id ? [oldRepeat, possibleRepeat, name] : [possibleRepeat, name],
                        read: false,
                        taskId,
                        folderId: folder._id,
                      };
                    }
                   if (usersNotifications && usersNotifications.notifications.length > 0){
                     Meteor.call(
                       'notifications.editNotifications',
                        assigned._id,
                        assigned.email,
                        notificationData1,
                        dbUsers
                      );
                        Meteor.call(
                          'notifications.editNotifications',
                           assigned._id,
                           assigned.email,
                           notificationData2,
                           dbUsers
                         );
                       if (oldRepeat !== newHistoryRepeat){
                         Meteor.call(
                           'notifications.editNotifications',
                            assigned._id,
                            assigned.email,
                            notificationData3,
                            dbUsers
                          );
                      }
                    } else {
                      if (oldRepeat !== newHistoryRepeat){
                        Meteor.call(
                          'notifications.addNewNotification',
                          assigned._id,
                          assigned.email,
                          [
                            notificationData1,
                            notificationData2,
                            notificationData3
                           ],
                           dbUsers
                         );
                    } else {
                      Meteor.call(
                        'notifications.addNewNotification',
                        assigned._id,
                        assigned.email,
                        [
                          notificationData1,
                          notificationData2
                         ],
                         dbUsers
                       );
                    }
                    }
                  })
                }
              }
              setOpenDatetime(false);
            }}
            >
            {translations[language].save}
          </FullButton>
        </ButtonRow>
      </section>
        </DatetimePicker>
      </div>
  );
}
};
