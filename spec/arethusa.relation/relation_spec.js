"use strict";

describe("relation", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getRetrievers: function(name) {
      return {};
    },
    getConfAndDelegate: function(name, obj) {
      var relations = {
        labels: {
          PRED : { short: "PRED", long: "predicate" },
          OBJ : { short: "OBJ", long: "object" },
          COORD : { short: "COORD", long: "coordination" }
        }
      };
      obj.conf = { relations: relations };
    }
  };

  var createTokens = function() {
    return {
      '01': {
        id: '01',
        string: 'Arma',
        relation: {
          label: "OBJ_CO"
        }
      },
      '02': {
        id: '02',
        string: 'virum',
        relation: {
          label: "OBJ_CO"
        }
      },
      '03': {
        id: '03',
        string: '-que',
        relation: {
          label: "COORD"
        }
      },
      '04': {
        id: '04',
        string: 'cano',
        relation: {
          label: "PRED"
        }
      }
    };
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(module("arethusa.relation"));

  var relation;
  var state;
  beforeEach(inject(function(_relation_, _state_) {
    state = _state_;
    state.tokens = createTokens();
    relation = _relation_;
    relation.init();
  }));

  describe('label handling', function() {
    describe('this.buildLabel', function() {
      describe('build a label from prefix and suffix values', function () {
        it('combines a prefix and a suffix label to one, joined by an underscore', function() {
          var relationLabel = { prefix: "PRED", suffix: "CO" };
          relation.buildLabel(relationLabel);
          expect(relationLabel.label).toEqual("PRED_CO");
        });
      });

      it("doesn't add unnecessary underscores", function() {
        var relationLabel = { prefix: "ATR" };
        relation.buildLabel(relationLabel);
        expect(relationLabel.label).toEqual("ATR");
      });
    });

    describe('this.expandRelation', function() {
      describe('with two labels', function () {
        it('splits a label like PRED_CO into PRED and CO', function() {
          var relationLabel = { label: "PRED_CO" };
          relation.expandRelation(relationLabel);
          expect(relationLabel.prefix).toEqual("PRED");
          expect(relationLabel.suffix).toEqual("CO");
        });
      });

      describe('with one label', function () {
        it('does not affect single labels like PRED', function() {
          var relationLabel = { label: "PRED" };
          relation.expandRelation(relationLabel);
          expect(relationLabel.prefix).toEqual("PRED");
          expect(relationLabel.suffix).toBeUndefined();
        });
      });
    });
  });

  describe('multi changes', function() {
    describe('this.multiChangePossible', function() {
      it('is false when there is no selected token', function() {
        expect(relation.multiChangePossible()).toBeFalsy();
      });

      it('needs a valid multiChanger model', function() {
        state.selectToken('01', 'click');
        expect(relation.multiChangePossible()).toBeFalsy();

        relation.multiChanger = { prefix: "ATR" };
        expect(relation.multiChangePossible()).toBeTruthy();
      });
    });

    describe('this.applyMultiChanger', function() {
      it('changes the relation value of all selected tokens', function() {
        state.selectToken('01', 'ctrl-click');
        state.selectToken('02', 'ctrl-click');
        var newRel = { label: "ATR" };
        relation.multiChanger = newRel;
        relation.applyMultiChanger();

        expect(state.tokens['01'].relation.label).toEqual("ATR");
        expect(state.tokens['02'].relation.label).toEqual("ATR");
      });

      it('passes on unique relation objects', function() {
        state.selectToken('01', 'ctrl-click');
        state.selectToken('02', 'ctrl-click');
        var newRel = { label: "ATR" };
        relation.multiChanger = newRel;
        relation.applyMultiChanger();

        var rel1 = state.tokens['01'].relation;
        var rel2 = state.tokens['02'].relation;
        expect(rel1).not.toBe(rel2);
      });
    });
  });

  describe('working with selections', function() {
    describe('this.selectLabel', function() {
      it('selects tokens by label', function() {
        relation.selectByLabel('OBJ_CO');
        expect(state.isSelected('01')).toBeTruthy();
        expect(state.isSelected('02')).toBeTruthy();
        expect(state.isSelected('03')).toBeFalsy();
        expect(state.isSelected('04')).toBeFalsy();

        relation.selectByLabel('COORD');
        expect(state.isSelected('01')).toBeFalsy();
        expect(state.isSelected('02')).toBeFalsy();
        expect(state.isSelected('03')).toBeTruthy();
        expect(state.isSelected('04')).toBeFalsy();
      });
    });

    describe('this.currentLabels', function() {
      it('returns obj of all selected tokens with their id, string and relation obj', function() {
        state.selectToken('01', 'ctrl-click');
        state.selectToken('02', 'ctrl-click');
        var res = relation.currentLabels();

        var rel1 = { string: 'Arma',  relation: state.tokens['01'].relation };
        var rel2 = { string: 'virum', relation: state.tokens['02'].relation };

        expect(res['01']).toEqual(rel1);
        expect(res['02']).toEqual(rel2);
        expect(res['03']).toBeUndefined();
        expect(res['04']).toBeUndefined();
      });
    });
  });

  describe('this.resetAncestors', function() {
    it('takes a rel object and clears out its ancestors', function() {
      var relObj = { ancestors: ['1', '2', '3'] };
      relation.resetAncestors(relObj);
      expect(relObj.ancestors).toEqual([]);
    });
  });

  describe('init functions', function() {
    describe('this.createInternalState', function() {
      it('sets an internal state, which is a selection of the tokens string and relation obj', function() {
        var res = relation.createInternalState();

        var rel1 = { string: 'Arma',  relation: state.tokens['01'].relation };
        var rel2 = { string: 'virum', relation: state.tokens['02'].relation };
        var rel3 = { string: '-que',  relation: state.tokens['03'].relation };
        var rel4 = { string: 'cano',  relation: state.tokens['04'].relation };

        expect(res['01']).toEqual(rel1);
        expect(res['02']).toEqual(rel2);
        expect(res['03']).toEqual(rel3);
        expect(res['04']).toEqual(rel4);
      });
    });
  });
});
