"use strict";

angular.module('arethusa.review').directive('reviewLinker', [
  'review',
  function(review) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.review = review;
        scope.$watch('review.link', function(newVal, oldVal) {
          if (newVal) {
            scope.icon = 'unlink';
            review.goToCurrentChunk();
          } else {
            scope.icon = 'link';
          }
        });
      },
      templateUrl: 'templates/arethusa.review/review_linker.html'
    };
  }
]);
