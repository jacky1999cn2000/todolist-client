'use strict';

import {fromJS, List, Map} from 'immutable';

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return fromJS({
        id: action.id,
        text: action.text,
        completed: false
      });
    case 'TOGGLE_TODO':
      if(state.get('id') !== action.id){
        return state;
      }
      return state.set('completed', !state.get('completed'));
    default:
      return state;
  }
}

const todos = (state=List(), action) => {
  switch (action.type) {
    case 'LOAD_TODOS':
      return fromJS(action.todos);
    case 'ADD_TODO':
      return state.push(todo(undefined, action));
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
    default:
      return state;
  }
}

export default todos;
