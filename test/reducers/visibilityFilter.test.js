'use strict';

import {expect} from 'chai';
import visibilityFilter from '../../app/reducers/visibilityFilter.js';

describe('visibilityFilter reducer:', () => {

  describe('SET_VISIBILITY_FILTER', () => {

    it('will return \'SHOW_ALL\' if for initialization', () => {
      let state = undefined;
      let action = {}

      let nextState = visibilityFilter(state,action);

      expect(state).to.equal(undefined);
      expect(nextState).to.equal('SHOW_ALL');
    });

    it('will return correct filter based on action', () => {
      let state = 'SHOW_ALL';
      let action = {
        type: 'SET_VISIBILITY_FILTER',
        filter: 'SHOW_COMPLETED'
      }

      let nextState = visibilityFilter(state,action);

      expect(state).to.equal('SHOW_ALL');
      expect(nextState).to.equal('SHOW_COMPLETED');
    });

  });

})
