import {
  configureStore
} from '@reduxjs/toolkit'
import foldersReducer from './foldersSlice';
import usersReducer from './usersSlice';
import tasksReducer from './tasksSlice';
import subtasksReducer from './subtasksSlice';
import commentsReducer from './commentsSlice';
import filtersReducer from './filtersSlice';
import metadataReducer from './metadataSlice';
import notificationsReducer from './notificationsSlice';

export default configureStore( {
  reducer: {
    folders: foldersReducer,
    users: usersReducer,
    tasks: tasksReducer,
    subtasks: subtasksReducer,
    comments: commentsReducer,
    metadata: metadataReducer,
    filters: filtersReducer,
    notifications: notificationsReducer,
  },
} )