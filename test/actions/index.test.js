'use strict';

import {expect} from 'chai';
import * as actions from '../../app/actions/index'
import { TYPES } from '../../app/actions/types'

describe('actions', () => {
  it('should create an action to add a todo', () => {
    const text = 'todo item 1';
    expect(actions.addTodo(text)).to.have.property('type', 'ADD_TODO');
    expect(actions.addTodo(text)).to.have.property('text', 'todo item 1');
    expect(actions.addTodo(text)).to.have.property('id');
  });

  it('should create an action to set visibility filter', () => {
    const filter = 'SHOW_ALL';
    const expectedAction = {
      type: TYPES.SET_VISIBILITY_FILTER,
      filter
    };
    expect(actions.setVisibilityFilter(filter)).to.deep.equal(expectedAction);
  });

  it('should create an action to toggle todo item', () => {
    const id = 'fakeid';
    const expectedAction = {
      type: TYPES.TOGGLE_TODO,
      id
    };
    expect(actions.toggleTodo(id)).to.deep.equal(expectedAction);
  });

})
