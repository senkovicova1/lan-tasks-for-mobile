import React from 'react';
import {
  translations
} from '/imports/other/translations';

export const LANGUAGES = [
  {
    label: "Eng",
    value: "en"
  },
    {
      label: "Sk",
      value: "sk"
    }
];

export const NO_CHANGE = 0;
export const ADDED = 1;
export const EDITED = 2;
export const DELETED = 3;

export const allMyTasksFolder = (language) => {
  return ({label: translations[language].allFolders, value: "all"});
}
export const archivedFolder = (language) => {
  return ({label: translations[language].archivedFolders, value: "archived"});
}

export const PLAIN = 0;
export const COLUMNS = 1;

export const sortByOptions = [
  {
    label: "Name",
    value: "name"
  },
  {
    label: "Assigned user",
    value: "assigned"
  },
  {
    label: "Creation date",
    value: "date"
  },
];

export const sortDirectionOptions = [
  {
    label: "Ascending",
    value: "asc"
  },
  {
    label: "Descending",
    value: "desc"
  },
];
