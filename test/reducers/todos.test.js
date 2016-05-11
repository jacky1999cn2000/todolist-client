'use strict';

import {expect} from 'chai';
import {fromJS, List, Map} from 'immutable';
import todos from '../../app/reducers/todos.js';

describe('todos reducer:', () => {

  describe('ADD_TODO', () => {

    it('will create an empty list for initialization', () => {
      let state = undefined;
      let action = {};

      let nextState = todos(state, action);

      let expectedNextState = List();

      expect(state).to.equal(undefined);
      expect(nextState).to.equal(expectedNextState);
    });

    it('will create an empty list and add designated item into it if state is undefined', () => {
      let state = undefined;
      let action = {
        type: 'ADD_TODO',
        id: 1,
        text: 'todo item 1'
      };

      let nextState = todos(state, action);

      let expectedNextState = fromJS([
        {
          id: 1,
          text: 'todo item 1',
          completed: false
        }
      ]);

      expect(state).to.equal(undefined);
      expect(nextState).to.equal(expectedNextState);
    });

    it('will add designated item into the current list in state', () => {
      let state = fromJS([
        {
          id: 1,
          text: 'todo item 1',
          completed: false
        }
      ]);
      let action = {
        type: 'ADD_TODO',
        id: 2,
        text: 'todo item 2'
      };

      let nextState = todos(state, action);

      let expectedState = fromJS([
        {
          id: 1,
          text: 'todo item 1',
          completed: false
        }
      ]);
      let expectedNextState = fromJS([
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
      ]);

      expect(state).to.equal(expectedState);
      expect(nextState).to.equal(expectedNextState);
    });
  });

  describe('TOGGLE_TODO', () => {

    it('will toggle the \'completed\' attribute for corresponding todo item', () => {
      let state = fromJS([
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
      ]);
      let action = {
        type: 'TOGGLE_TODO',
        id: 1
      };
      
      let nextState = todos(state, action);

      let expectedState = fromJS([
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
      ]);

      let expectedNextState = fromJS([
        {
          id: 1,
          text: 'todo item 1',
          completed: true
        },
        {
          id: 2,
          text: 'todo item 2',
          completed: false
        }
      ]);

      expect(state).to.equal(expectedState);
      expect(nextState).to.equal(expectedNextState);
    });
  });
});
