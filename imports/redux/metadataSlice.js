import {
  createSlice
} from '@reduxjs/toolkit'

import {
  PLAIN,
  allMyTasksFolder,
  LANGUAGES,
  sortByOptions,
  sortDirectionOptions,
} from "/imports/other/constants";

export const metadataSlice = createSlice( {
  name: 'metadata',
  initialState: {
    value: {
      layout: PLAIN,
      search: "",
      sidebarOpen: true,
      sortBy: sortByOptions[ 0 ].value,
      sortDirection: sortDirectionOptions[ 0 ].value,
    },
  },
  reducers: {
    setLayout: ( state, action ) => {
      state.value = {
        ...state.value,
        layout: action.payload,
      }
    },
    setSearch: ( state, action ) => {
      state.value = {
        ...state.value,
        search: action.payload,
      }
    },
    setSidebarOpen: ( state, action ) => {
      state.value = {
        ...state.value,
        sidebarOpen: action.payload,
      }
    },
    setSortBy: ( state, action ) => {
      state.value = {
        ...state.value,
        sortBy: action.payload,
      }
    },
    setSortDirection: ( state, action ) => {
      state.value = {
        ...state.value,
        sortDirection: action.payload,
      }
    },
  },
} )

export const {
  setLayout,
  setSidebarOpen,
  setSearch,
  setSortBy,
  setSortDirection,
} = metadataSlice.actions

export default metadataSlice.reducer