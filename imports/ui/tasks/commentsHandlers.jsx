import React from 'react';

import {
  CommentsCollection
} from '/imports/api/commentsCollection';

export const addNewComment = ( author, task, dateCreated, body ) => {
  CommentsCollection.insert( {
    author,
    task,
    dateCreated,
    body
  } );
};

export const editComment = ( commentId, author, task, dateCreated, body ) => {
  let data = { commentId, author, task, dateCreated, body };
  CommentsCollection.update( commentId, {
    $set: {
      ...data
    }
  } )
};

export const removeComment = (commentId) => {
  CommentsCollection.remove( {
    _id: commentId
  } );
}
