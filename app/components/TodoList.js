'use strict';

import React, { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Todo from './Todo'

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.get('id')}
        text={todo.get('text')}
        completed={todo.get('completed')}
        onClick={() => onTodoClick(todo.get('id'))}
      />
    )}
  </ul>
)

TodoList.propTypes = {
  todos: ImmutablePropTypes.listOf(
    ImmutablePropTypes.contains({
      id: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
      completed: React.PropTypes.bool.isRequired
    })
  ).isRequired,
  onTodoClick: PropTypes.func.isRequired
}

export default TodoList
