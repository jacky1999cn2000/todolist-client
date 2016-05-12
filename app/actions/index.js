'use strict';

import uuid from 'node-uuid'
import { TYPES } from './types.js'
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch'

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

export const loadTodos = (todos) => {
  return {
    type: TYPES.LOAD_TODOS,
    todos
  }
}

export function getTodos(){
  return function(dispatch){
    return fetch('http://192.168.99.100:3000/todos/')
    .then(response => response.json())
    .then(json => {
      dispatch(loadTodos(json));
    })
    .catch(err => {
      console.log('err: ',err);
    });
  }
}
