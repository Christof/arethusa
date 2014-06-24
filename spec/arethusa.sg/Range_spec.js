"use strict";

describe("Range", function() {
  beforeEach(module('arethusa.sg'));

  var Range;
  beforeEach(inject(function(_Range_) {
    Range = _Range_;
  }));

  it('takes a start and end parameter', function() {
    var range = new Range(1, 10);
    expect(range.start).toEqual(1);
    expect(range.end).toEqual(10);
  });

  it('can be created with one param that serves as start an end', function() {
    var range = new Range(1);
    expect(range.start).toEqual(1);
    expect(range.end).toEqual(1);
  });

  it('throws an error when end is less than start', function() {
    expect(function() {
      new Range(2, 1);
    }).toThrow(new RangeError('End (1) is less than start (2)'));
  });

  it('can also be initialized with an array', function() {
    var range = new Range([1, 2]);
    expect(range.start).toEqual(1);
    expect(range.end).toEqual(2);
  });

  describe('includes()', function() {
    describe('checks if the integer given as param is included in the range and', function() {
      it('and returns true when i is the low boundary', function() {
        var range = new Range(1, 5);
        expect(range.includes(1)).toBeTruthy();
      });

      it('returns true when i is the high boundary', function() {
        var range = new Range(1, 5);
        expect(range.includes(5)).toBeTruthy();
      });

      it('returns true when i is inbetween', function() {
        var range = new Range(1, 5);
        expect(range.includes(2)).toBeTruthy();
      });

      it('returns false when i is too less', function() {
        var range = new Range(1, 5);
        expect(range.includes(0)).toBeFalsy();
      });

      it('returns false when i is too big', function() {
        var range = new Range(1, 5);
        expect(range.includes(6)).toBeFalsy();
      });
    });
  });

  describe('includesOtherRange()', function() {
    describe('checks whether another range is included and', function() {
      it('returns true when it is completely included', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(2, 4);
        expect(r1.includesOtherRange(r2)).toBeTruthy();
      });

      it('returns true when boundaries are the same', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(1, 5);
        expect(r1.includesOtherRange(r2)).toBeTruthy();
      });

      it('returns false when they only overlap', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(1, 6);
        expect(r1.includesOtherRange(r2)).toBeFalsy();
      });
    });
  });

  describe('hasOverlaps()', function() {
    describe('checks wheter another range and self overlap and', function() {
      it('returns true when they do', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(1, 6);
        expect(r1.hasOverlaps(r2)).toBeTruthy();
      });

      it('returns false when the range includes the other range', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(2, 4);
        expect(r1.hasOverlaps(r2)).toBeFalsy();
      });
    });
  });

  describe('sharesElements()', function() {
    describe('checks whether common elements are present and', function() {
      it('returns true when ranges overlap', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(1, 6);
        expect(r1.sharesElements(r2)).toBeTruthy();
      });

      it('returns true when range is included', function() {
        var r1 = new Range(1, 5);
        var r2 = new Range(2, 4);
        expect(r1.sharesElements(r2)).toBeTruthy();
      });

      it('returns false when they have nothing in common', function() {
        var r1 = new Range(1, 2);
        var r2 = new Range(4, 5);
        expect(r1.sharesElements(r2)).toBeFalsy();
      });
    });
  });
});
