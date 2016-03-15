"use strict";

angular.module('arethusa.core').directive('globalClickAction', [
  'globalSettings',
  function(globalSettings) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.gS = globalSettings;
        scope.setting = globalSettings.settings.clickAction;
      },
      templateUrl: 'js/arethusa.core/templates/global_click_action.html'
    };
  }
]);
