"use strict";

angular.module('arethusa.core').factory('Loader', function() {
  return function() {
    var objectsToWaitFor = [];
    var loadCounter = {};

    function objIndex(obj) {
      return objectsToWaitFor.indexOf(obj);
    }

    function incrementCounter(obj) {
      var i = objIndex(obj);
      if (loadCounter[i]) {
        loadCounter[i]++;
      } else {
        loadCounter[i] = 1;
      }
    }

    function decrementCounter(obj) {
      var i = objIndex(obj);
      loadCounter[i]--;

      if (loadCounter[i] === 0) {
        delete loadCounter[i];
      }
    }


    this.declareUnloaded = function(obj) {
      objectsToWaitFor.push(obj);
      incrementCounter(obj);
    };

    this.counter = function() {
      return loadCounter;
    };

    this.declareLoaded = function(obj) {
      decrementCounter(obj);
    };

    this.allLoaded = function() {
      return Object.keys(loadCounter).length === 0;
    };
  };
});
