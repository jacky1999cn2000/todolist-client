'use strict';

import {expect} from 'chai';
import * as actions from '../../app/actions/index'
import { TYPES } from '../../app/actions/types'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('regular actions', () => {
  it('addTodo() should create an action to add a todo', () => {
    const text = 'todo item 1';
    expect(actions.addTodo(text)).to.have.property('type', 'ADD_TODO');
    expect(actions.addTodo(text)).to.have.property('text', 'todo item 1');
    expect(actions.addTodo(text)).to.have.property('id');
  });

  it('setVisibilityFilter() should create an action to set visibility filter', () => {
    const filter = 'SHOW_ALL';
    const expectedAction = {
      type: TYPES.SET_VISIBILITY_FILTER,
      filter
    };
    expect(actions.setVisibilityFilter(filter)).to.deep.equal(expectedAction);
  });

  it('toggleTodo() should create an action to toggle todo item', () => {
    const id = 'fakeid';
    const expectedAction = {
      type: TYPES.TOGGLE_TODO,
      id
    };
    expect(actions.toggleTodo(id)).to.deep.equal(expectedAction);
  });

  it('loadTodos() should create an action to load todos', () => {
    const todos = [{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}];
    const expectedAction = {
      type: TYPES.LOAD_TODOS,
      todos:[{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}]
    };
    expect(actions.loadTodos(todos)).to.deep.equal(expectedAction);
  });
});

describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('getTodos() should return a regular action LOAD_TODOS', () => {
    nock('http://192.168.99.100:3000/')
      .get('/todos/')
      .reply(200, [{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}])

    const expectedAction = [
      {
        type: TYPES.LOAD_TODOS,
        todos: [{"id":"1","text":"item 1","completed":false},{"id":"2","text":"item 2","completed":false}]
      }
    ]
    const store = mockStore({ todos: [] })

    return store.dispatch(actions.getTodos())
        .then(() => { // return of async actions
          expect(store.getActions()).to.deep.equal(expectedAction)
        })
  });
})
