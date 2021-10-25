import {
  createSlice
} from '@reduxjs/toolkit'

export const notificationsSlice = createSlice( {
  name: 'notifications',
  initialState: {
    value: [],
  },
  reducers: {
    setNotifications: ( state, action ) => {
      state.value = action.payload
    },
  },
} )

// Action creators are generated for each case reducer function
export const {
  setNotifications
} = notificationsSlice.actions

export default notificationsSlice.reducer