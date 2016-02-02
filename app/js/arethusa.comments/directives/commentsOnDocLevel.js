"use strict";

angular.module('arethusa.comments').directive('commentsOnDocLevel', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.c = comments;

        scope.count = function() {
          return comments.docLevelComments.length;
        };
      },
      templateUrl: 'js/arethusa.comments/templates/comments_on_doc_level.html'
    };
  }
]);
