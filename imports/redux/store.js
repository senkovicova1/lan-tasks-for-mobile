import {
  configureStore
} from '@reduxjs/toolkit'
import foldersReducer from './foldersSlice';
import usersReducer from './usersSlice';
import tasksReducer from './tasksSlice';

export default configureStore( {
  reducer: {
    folders: foldersReducer,
    users: usersReducer,
    tasks: tasksReducer,
  },
} )