import {
  createSlice
} from '@reduxjs/toolkit'

export const foldersSlice = createSlice( {
  name: 'folders',
  initialState: {
    value: {
      active: [],
      archived: [],
    },
  },
  reducers: {
    setActive: ( state, action ) => {
      state.value = {
        ...state.value,
        active: action.payload
      }
    },
    setArchived: ( state, action ) => {
      state.value = {
        ...state.value,
        archived: action.payload
      }
    },
  },
} )

// Action creators are generated for each case reducer function
export const {
  setActive,
  setArchived,
} = foldersSlice.actions

export default foldersSlice.reducer