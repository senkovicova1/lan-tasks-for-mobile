export const ADD_TASK = 'add_task';
export const ADD_AND_ASSIGN = 'add_and_assign';
export const CLOSED_STATUS = "closed_status";
export const OPEN_STATUS = "open_status";
export const TITLE = "title";
export const IMPORTANT = "important";
export const NOT_IMPORTANT = "not_important";
export const CONTAINER = "container";
export const ASSIGNED = "assigned";
export const REMOVED_START_END = "removed_start_end";
export const SET_START = "set_start";
export const SET_END = "set_end";
export const SET_HOURS = "set_hours";
export const CHANGE_HOURS = "change_hours";
export const DESCRIPTION = "description";
export const REMOVE_FILE = "remove_file";
export const ADD_FILE = "add_file";
export const SUBTASK_CLOSED = "subtask_closed";
export const SUBTASK_OPENED = "subtask_opened";
export const REMOVE_SUBTASK = "remove_subtask";
export const RENAME_SUBTASK = "rename_subtask";
export const ADD_SUBTASK = "add_subtask";
export const ADD_COMMENT = "add_comment";
export const EDIT_COMMENT = "edit_comment";
export const REMOVE_COMMENT = "remove_comment";
export const REMOVED_REPEAT = "remove_repeat";
export const CHANGE_REPEAT = "change_repeat";
export const SET_REPEAT = "set_repeat";

export const historyEntryTypes = [
  {
    type: ADD_TASK,
    message:{
      "en": "created this task!",
      "sk": "vytvorila úlohu.",
    }
  },
    {
      type: ADD_AND_ASSIGN,
      message:{
        "en": "created this task and assigned it to [0]!",
        "sk": "vytvoril/a úlohu a nastavil/a riešiteľa na [0].",
      }
    },
  {
    type: CLOSED_STATUS,
    message:{
      "en": "set the status of this task to CLOSED",
      "sk": "nastavil/a status úlohy '[0]' na UZAVRETÝ",
    }
  },
    {
      type: OPEN_STATUS,
      message:{
        "en": "set the status of this task to OPEN",
        "sk": "nastavil/a status tejto úlohy na OTVORENÝ",
      }
    },
  {
    type: TITLE,
    message:{
      "en": "changed the title of this task from '[0]' to '[1]'",
      "sk": "zmenil/a nadpis tejto úlohy z '[0]' na '[1]'",
    }
  },
  {
    type: IMPORTANT,
    message:{
      "en": "set the status of this task to IMPORTANT",
      "sk": "nastavil/a status tejto úlohy na DÔLEŽITÁ",
    }
  },
  {
    type: NOT_IMPORTANT,
    message:{
      "en": "removed the IMPORTANT status from this task",
      "sk": "zrušil/a status DÔLEŽITÁ",
    }
  },
  {
    type: CONTAINER,
    message:{
      "en": "changed the container of thid task from '[0]' to '[1]'",
      "sk": "zmenil/a kontajner úlohy z '[0]' na '[1]'",
    }
  },
  {
    type: ASSIGNED,
    message:{
      "en": "changed the assigned of this task from [0] to [1]",
      "sk": "zmenil/a riešiteľov úlohy z [0] na [1]",
    }
  },
  {
    type: REMOVED_START_END,
    message:{
      "en": "removed the start and end dates of this task",
      "sk": "odstránil/a začiatok a koniec úlohy.",
    }
  },
  {
    type: SET_START,
    message:{
      "en": "changed the start date from [0] to [1].",
      "sk": "zmenil/a začiatok úlohy z [0] na [1]",
    }
  },
  {
    type: SET_END,
    message:{
      "en": "changed the end date from [0] to [1].",
      "sk": "zmenil/a koniec úlohy z [0] na [1]",
    }
  },
  {
    type: SET_HOURS,
    message:{
      "en": "set the hours attribute of this task to [0].",
      "sk": "nastavil/a trvanie úlohy na [0]",
    }
  },
  {
    type: CHANGE_HOURS,
    message:{
      "en": "changed the hours attribute of this task from [0] to [1].",
      "sk": "zmenil/a trvanie úlohy z [0] na [1].",
    }
  },
  {
    type: DESCRIPTION,
    message:{
      "en": "changed the description to: [0].",
      "sk": "zmenil/a popis úlohy na: [0].",
    }
  },
  {
    type: REMOVE_FILE,
    message:{
      "en": "removed the file [0].",
      "sk": "odstránil/a súbor [0].",
    }
  },
  {
    type: ADD_FILE,
    message:{
      "en": "added the file [0].",
      "sk": "pridal/a súbor [0]",
    }
  },
  {
    type: SUBTASK_CLOSED,
    message:{
      "en": "set the status of the subtask '[0]' to CLOSED.",
      "sk": "nastavil/a status podúlohy '[0]' na UZAVRETÁ",
    }
  },
  {
    type: SUBTASK_OPENED,
    message:{
      "en": "set the status of the subtask '[0]' to OPEN.",
      "sk": "zmenil/a status podúlohy '[0]' na OTVORENÁ",
    }
  },
  {
    type: REMOVE_SUBTASK,
    message:{
      "en": "removed the subtask '[0]'.",
      "sk": "odstránil/a podúlohu '[0]'.",
    }
  },
  {
    type: RENAME_SUBTASK,
    message:{
      "en": "changed the subtask '[0]' to '[1]'.",
      "sk": "zmenil/a podúlohu '[0]' na '[1]'.",
    }
  },
  {
    type: ADD_SUBTASK,
    message:{
      "en": "added the subtask '[0]'.",
      "sk": "pridal/a podúlohu '[0]'.",
    }
  },
  {
    type: ADD_COMMENT,
    message:{
      "en": "added a comment.",
      "sk": "pridal/a komentár.",
    }
  },
  {
    type: EDIT_COMMENT,
    message:{
      "en": "edited a comment.",
      "sk": "upravil/a komentár.",
    }
  },
  {
    type: REMOVE_COMMENT,
    message:{
      "en": "removed a comment.",
      "sk": "odstránil/a komentár.",
    }
  },
  {
    type: REMOVED_REPEAT,
    message:{
      "en": "removed repeat.",
      "sk": "odstránil/a opakovanie úlohy.",
    }
  },
  {
    type: CHANGE_REPEAT,
    message:{
      "en": "changed repeat from '[0]' to '[1]'.",
      "sk": "zmenil/a opakovanie úlohy z '[0]' na '[1]'.",
    }
  },
  {
    type: SET_REPEAT,
    message:{
      "en": "set repeat to '[0]'.",
      "sk": "nastavil/a opakovanie úlohy na '[0]'.",
    }
  },
]


export const notificationTypes = [
  {
    type: ADD_TASK,
    message:{
      "en": "created this task '[0]'!",
      "sk": "vytvorila úlohu '[0]'!",
    }
  },
    {
      type: ADD_AND_ASSIGN,
      message:{
        "en": "created the task '[0]' and assigned it to you!",
        "sk": "vytvoril/a úlohu '[0]' a nastavil/a riešiteľa na vás.",
      }
    },
  {
    type: CLOSED_STATUS,
    message:{
      "en": "set the status of the task '[0]' to CLOSED",
      "sk": "nastavil/a status úlohy '[0]' na UZAVRETÝ",
    }
  },
    {
      type: OPEN_STATUS,
      message:{
        "en": "set the status of the task '[0]' to OPEN",
        "sk": "nastavil/a status úlohy '[0]' na OTVORENÝ",
      }
    },
  {
    type: TITLE,
    message:{
      "en": "changed the title of the task '[0]' to '[1]'",
      "sk": "zmenil/a nadpis úlohy '[0]' na '[1]'",
    }
  },
  {
    type: IMPORTANT,
    message:{
      "en": "set the status of the task '[0]' to IMPORTANT",
      "sk": "nastavil/a status úlohy '[0]' na DÔLEŽITÁ",
    }
  },
  {
    type: NOT_IMPORTANT,
    message:{
      "en": "removed the IMPORTANT status from the task '[0]'",
      "sk": "zrušil/a status DÔLEŽITÁ úlohy '[0]'",
    }
  },
  {
    type: CONTAINER,
    message:{
      "en": "changed the container of the task '[0]' from '[1]' to '[2]'",
      "sk": "zmenil/a kontajner úlohy '[0]' z '[1]' na '[2]'",
    }
  },
  {
    type: ASSIGNED,
    message:{
      "en": "changed the assigned of the task '[0]' from [1] to [2]",
      "sk": "zmenil/a riešiteľov úlohy '[0]' z [1] na [2]",
    }
  },
  {
    type: REMOVED_START_END,
    message:{
      "en": "removed the start and end dates of the task '[0]'",
      "sk": "odstránil/a začiatok a koniec úlohy '[0]'.",
    }
  },
  {
    type: SET_START,
    message:{
      "en": "changed the start date of the task '[0]' from [1] to [2].",
      "sk": "zmenil/a začiatok úlohy '[0]' z [1] na [2]",
    }
  },
  {
    type: SET_END,
    message:{
      "en": "changed the end date of the task '[0]' from [1] to [2].",
      "sk": "zmenil/a koniec úlohy '[0]' z [1] na [2]",
    }
  },
  {
    type: SET_HOURS,
    message:{
      "en": "set the hours attribute of the task '[0]' to [1].",
      "sk": "nastavil/a trvanie úlohy '[0]' na [1]",
    }
  },
  {
    type: CHANGE_HOURS,
    message:{
      "en": "changed the hours attribute of the task '[0]' from [1] to [2].",
      "sk": "zmenil/a trvanie úlohy '[0]' z [1] na [2].",
    }
  },
  {
    type: DESCRIPTION,
    message:{
      "en": "changed the description of the task '[0]'.",
      "sk": "zmenil/a popis úlohy '[0]'.",
    }
  },
  {
    type: REMOVE_FILE,
    message:{
      "en": "removed the file [0] from the task '[1]'.",
      "sk": "odstránil/a súbor [0] z úlohy '[1]'.",
    }
  },
  {
    type: ADD_FILE,
    message:{
      "en": "added the file [0] to the task '[1]'.",
      "sk": "pridal/a súbor [0] do úlohy '[1]'",
    }
  },
  {
    type: SUBTASK_CLOSED,
    message:{
      "en": "set the status of the subtask '[0]' in the task '[1]' to CLOSED.",
      "sk": "nastavil/a status podúlohy '[0]' v úlohe '[1]' na UZAVRETÁ",
    }
  },
  {
    type: SUBTASK_OPENED,
    message:{
      "en": "set the status of the subtask '[0]' in the task '[1]' to OPEN.",
      "sk": "zmenil/a status podúlohy '[0]' v úlohe '[1]' na OTVORENÁ",
    }
  },
  {
    type: REMOVE_SUBTASK,
    message:{
      "en": "removed the subtask '[0]' of the task '[1]'.",
      "sk": "odstránil/a podúlohu [0] v úlohe '[1]'.",
    }
  },
  {
    type: RENAME_SUBTASK,
    message:{
      "en": "changed the subtask '[0]' in the task '[1]' to '[2]'.",
      "sk": "zmenil/a podúlohu '[0]' v úlohe '[1]' na '[2]'.",
    }
  },
  {
    type: ADD_SUBTASK,
    message:{
      "en": "added the subtask '[0]' in the task '[1]'.",
      "sk": "pridal/a podúlohu '[0]' do ulohy '[1]'.",
    }
  },
  {
    type: ADD_COMMENT,
    message:{
      "en": "added a comment to the task '[0]'.",
      "sk": "pridal/a komentár v úlohe '[0].",
    }
  },
  {
    type: EDIT_COMMENT,
    message:{
      "en": "edited a comment to the task '[0]'.",
      "sk": "upravil/a komentár v úlohe '[0].",
    }
  },
  {
    type: REMOVE_COMMENT,
    message:{
      "en": "removed a comment to the task '[0]'.",
      "sk": "odstránil/a komentár v úlohe '[0].",
    }
  },
  {
    type: REMOVED_REPEAT,
    message:{
      "en": "removed repeat of the task '[0]'.",
      "sk": "odstránil/a opakovanie úlohy '[0]'.",
    }
  },
  {
    type: CHANGE_REPEAT,
    message:{
      "en": "changed repeat from '[0]' to '[1]' in the task '[2]'.",
      "sk": "zmenil/a opakovanie z '[0]' na '[1]' úlohy '[2]'.",
    }
  },
  {
    type: SET_REPEAT,
    message:{
      "en": "set repeat to '[0]' in the task '[1]'.",
      "sk": "nastavil/a opakovanie na '[0]' v úlohe '[1]'.",
    }
  },
]
