'use strict';

import uuid from 'node-uuid';

export const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: uuid.v1(),
    text
  };
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
}

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
}
