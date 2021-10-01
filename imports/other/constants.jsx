import React from 'react';
import {
  translations
} from '/imports/other/translations';

const colours = [
  "#A62B2B",
  "#C92685",
  "#A063A1",
  "#5807BB",

  "#201DED",
  "#0078D4",
  "#2189AB",
  "#45BFB1",

  "#28D27A",
  "#1ADB27",
  "#92CA2B",
  "#D3D70F",

  "#FFD12B",
  "#E07F10",
  "#E01010",
];

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
