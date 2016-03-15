'use strict';
angular.module('arethusa.core').directive('pluginSetting', [
  'userPreferences',
  function (userPreferences) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope.change = function() {
          var model = scope.setting.model;
          var value = scope.plugin[model];
          var change = scope.setting.change;
          userPreferences.set(scope.plugin.name, model, value);
          if (angular.isFunction(change)) change();
        };
      },
      templateUrl: 'js/arethusa.core/templates/plugin_setting.html'
    };
  }
]);

