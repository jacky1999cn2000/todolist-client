'use strict';

import uuid from 'node-uuid'
import { TYPES } from './types.js'

export const addTodo = (text) => {
  return {
    type: TYPES.ADD_TODO,
    id: uuid.v1(),
    text
  };
}

export const setVisibilityFilter = (filter) => {
  return {
    type: TYPES.SET_VISIBILITY_FILTER,
    filter
  };
}

export const toggleTodo = (id) => {
  return {
    type: TYPES.TOGGLE_TODO,
    id
  };
}
