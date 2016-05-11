'use strict';

import {expect} from 'chai';
import {fromJS, List, Map} from 'immutable';
import todoApp from '../../app/reducers/index.js';

describe('todoApp reducer:', () => {

  describe('INITIALIZATION', () =>{
    it('will return an object with an empty List as todos, and \'SHOW_ALL\' as visibilityFilter', () => {
      let state = undefined;
      let action = {};

      let newState = todoApp(state,action);

      expect(state).to.equal(undefined);
      expect(newState.todos).to.equal(List());
      expect(newState.visibilityFilter).to.equal('SHOW_ALL');
    });
  });

  describe('ADD_TODO', () => {
    it('will add todo item into todos list', () => {
      let state = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let action = {
        type: 'ADD_TODO',
        id: 2,
        text: 'todo item 2'
      };

      let nextState = todoApp(state, action);

      let expectedState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let expectedNextState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          },
          {
            id: 2,
            text: 'todo item 2',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      }

      expect(state.todos).to.equal(expectedState.todos);
      expect(nextState.todos).to.equal(expectedNextState.todos);
    });
  });

  describe('TOGGLE_TODO', () => {
    it('will toggle the \'completed\' attribute for corresponding todo item', () => {
      let state = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          },
          {
            id: 2,
            text: 'todo item 2',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let action = {
        type: 'TOGGLE_TODO',
        id: 2
      };

      let nextState = todoApp(state, action);

      let expectedState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          },
          {
            id: 2,
            text: 'todo item 2',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let expectedNextState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          },
          {
            id: 2,
            text: 'todo item 2',
            completed: true
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      }

      expect(state.todos).to.equal(expectedState.todos);
      expect(nextState.todos).to.equal(expectedNextState.todos);
    });
  });

  describe('SET_VISIBILITY_FILTER', () => {
    it('will set visibilityFilter', () => {
      let state = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let action = {
        type: 'SET_VISIBILITY_FILTER',
        filter: 'SHOW_COMPLETED'
      };

      let nextState = todoApp(state, action);

      let expectedState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_ALL'
      };
      let expectedNextState = {
        todos: fromJS([
          {
            id: 1,
            text: 'todo item 1',
            completed: false
          }
        ]),
        visibilityFilter: 'SHOW_COMPLETED'
      }

      expect(state.visibilityFilter).to.equal('SHOW_ALL');
      expect(nextState.visibilityFilter).to.equal('SHOW_COMPLETED');
    });
  });
});
