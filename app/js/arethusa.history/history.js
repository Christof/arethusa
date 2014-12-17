'use strict';
/**
 * @ngdoc service
 * @name arethusa.history.history
 *
 * @description
 * Tracks and stores all changes happening through the
 * {@link arethusa.core.state state} API
 *
 *
 *
 * @requires arethusa.core.configurator
 * @requires arethusa.core.keyCapture
 * @requires arethusa.core.state
 */
angular.module('arethusa.history').service('history', [
  'configurator',
  'keyCapture',
  'state',
  function (configurator, keyCapture, state) {
    var self = this;
    this.name = "history";

    function configure() {
      configurator.getConfAndDelegate(self);

      /**
       * @ngdoc property
       * @name maxSize
       * @propertyOf arethusa.history.history
       *
       * @description
       * ***Configurable property***
       *
       * Maximum number of saved events. Defaults to 50.
       */
      self.maxSize = self.maxSize || 50;
    }

    function doSilent(fn) {
      state.doSilent(fn);
      checkAvailability();
    }

    function current() {
      return self.events[self.position];
    }

    function checkAvailability() {
      var any = self.events.length > 0;
      self.canUndo = any && self.position < self.events.length;
      self.canRedo = any && self.position > 0;
    }

    function HistEvent(token, type) {
      var id = token.id;

      this.token = token;
      this.type = type;
      this.time = new Date();

      if (type === 'add') {
        this.exec = function() {
          state.addToken(token, id);
        };
        this.undo = function() {
          state.removeToken(id);
        };
      } else { // type === removed
        this.exec = function() {
          state.removeToken(id);
        };
        this.undo = function() {
          state.addToken(token, id);
        };
      }
    }


/***************************************************************************
 *                            Public Functions                             *
 ***************************************************************************/

    /**
     * @ngdoc function
     * @name arethusa.history.history#undo
     * @methodOf arethusa.history.history
     *
     * @description
     * Undoes the last event.
     */
    this.undo = function() {
      if (self.canUndo) {
        doSilent(function() {
          current().undo();
          self.position++;
        });
      }
    };

    /**
     * @ngdoc function
     * @name arethusa.history.history#redo
     * @methodOf arethusa.history.history
     *
     * @description
     * Redoes the last event.
     */
    this.redo = function() {
      if (self.canRedo) {
        doSilent(function() {
          self.position--;
          current().exec();
        });
      }
    };

    function BatchEvent() {
      var self = this;
      this.events = [];
      this.type = 'batch';

      this.push = function(event) {
        self.events.push(event);
      };

      this.count = function() { return self.events.length; };

      this.pop = function() {
        return self.events.pop();
      };

      function multiExec() {
        angular.forEach(self.events, function(event, i) {
          event.exec();
        });
      }

      function multiUndo() {
        angular.forEach(self.events, function(event, i) {
          event.undo();
        });
      }

      this.exec = function() { state.doBatched(multiExec); };
      this.undo = function() { state.doBatched(multiUndo); };
    }

    /**
     * @ngdoc function
     * @name arethusa.history.history#saveEvent
     * @methodOf arethusa.history.history
     *
     * @description
     * Adds a new event to the history.
     */
    var batchedEvent = new BatchEvent();
    this.saveEvent = function(event) {
      if (state.silent) return;
      if (state.batchChange) {
        batchedEvent.push(event);
        return;
      }

      var events = self.events;
      if (events.length === self.maxSize) events.pop();
      events.splice(0, self.position);
      self.position = 0;
      events.unshift(event);
      checkAvailability();
    };


/***************************************************************************
 *                          Watches and Listeners                          *
 ***************************************************************************/

    state.watch('*', function(n, o, event) {
      self.saveEvent(event);
    });

    state.on('tokenAdded', function(event, token) {
      var histEvent = new HistEvent(token, 'add');
      self.saveEvent(histEvent);
    });

    state.on('tokenRemoved', function(event, token) {
      var histEvent = new HistEvent(token, 'remove');
      self.saveEvent(histEvent);
    });

    state.on('batchChangeStop', function() {
      // We don't want to listen for batchUndo/batchRedo
      if (state.silent) return;

      // We are a little careless with setting the batch mode -
      // if the batch event has only a single event anyway,
      // we save this and not the whole BatchEvent.
      var e = batchedEvent.count() === 1 ? batchedEvent.pop() : batchedEvent;
      self.saveEvent(e);
      batchedEvent = new BatchEvent();
    });



/***************************************************************************
 *                                  Init                                   *
 ***************************************************************************/

    function keyCaptures() {
      var keys = keyCapture.initCaptures(function(kC) {
        return {
          history: [
            kC.create('undo', self.undo, ':'),
            kC.create('redo', self.redo, "'")
          ]
        };
      });
      self.activeKeys = angular.extend({}, keys.history);
    }

    this.init = function() {
      keyCaptures();
      configure();

      /**
       * @ngdoc property
       * @name canRedo
       * @propertyOf arethusa.history.history
       *
       * @description
       * Determines if an {@link arethusa.history.history#methods_redo redo}
       * operation can be done.
       */
      self.canRedo = false;

      /**
       * @ngdoc property
       * @name canUndo
       * @propertyOf arethusa.history.history
       *
       * @description
       * Determines if an {@link arethusa.history.history#methods_undo undo}
       * operation can be done.
       */
      self.canUndo = false;

      /**
       * @ngdoc property
       * @name events
       * @propertyOf arethusa.history.history
       *
       * @description
       * Array of all stored history events.
       */
      self.events = [];

      /**
       * @ngdoc property
       * @name position
       * @propertyOf arethusa.history.history
       *
       * @description
       * Current position in the
       * {@link arethusa.history.history#properties_events events} container.
       */
      self.position = 0;
    };
  }
]);
