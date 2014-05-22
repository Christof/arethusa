"use strict";

/* global dagreD3 */

angular.module('arethusa.depTree').directive('dependencyTree', function(state, $compile) {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
      scope.tokens = scope.$eval(attrs.tokens);
      // This will be needed once we manage to get this into an isolated scope
      //scope.state = state;

      function tokenPlaceholder(token) {
        return '<div class="node" id="tph' + token.id + '">' + token.string + '</div>';
      }

      function edgePlaceholder(label) {
        return '<div class="tree-label">' + label + '</div>';
      }

      function compiledToken(token) {
        var childScope = scope.$new();
        childScope.token = token;

        return $compile(tokenHtml)(childScope)[0];
      }

      var tokenHtml = '\
        <token\
          ng-click="state.toggleSelection(token.id, \'click\')"\
          ng-mouseenter="state.selectToken(token.id, \'hover\')"\
          ng-mouseleave="state.deselectToken(token.id, \'hover\')"\
          ng-class="{selected: state.isSelected(token.id)}">\
        </token>\
      ';

      // Creating the node set

      var g = new dagreD3.Digraph();

      function createNodes() {
        g.addNode("0000", { label: "[-]"});
        angular.forEach(scope.tokens, function(token, index) {
          g.addNode(token.id, { label: tokenPlaceholder(token) });
        });
      }

      function createEdges() {
        angular.forEach(scope.tokens, function(token, index) {
          if (token.head) {
            drawEdge(token);
          }
        });
      }

      function drawEdge(token) {
        g.addEdge(token.id, token.id, token.head.id, { label: edgePlaceholder(token.relation.label) });
      }

      function updateEdge(token) {
        g.delEdge(token.id);
        drawEdge(token);
      }

      // Initialize the graph

      var layout = dagreD3.layout().rankDir("BT");
      var svg = d3.select(element[0]);
      svg.call(d3.behavior.zoom().on("zoom", function() {
         var ev = d3.event;
         svg.select("g")
           .attr("transform",
                 "translate(" + ev.translate + ") scale(" + ev.scale + ")");
      }));

      var renderer = new dagreD3.Renderer();

      function render() {
        var vis = svg.select('g');
        renderer.layout(layout).run(g, vis);

        // Customize the graph so that it holds our directives

        vis.selectAll("div.node").append(function() {
          // This is the element we append to and we created as a placeholder
          // We clear out its text content so that we can display the content
          // of our compiled token directive.
          // The placholder has an id in the format of tphXXXX where XXXX is the id.

          this.textContent = "";
          return compiledToken(scope.tokens[this.id.slice(3)]);
        });

        // Not very elegant, but we don't want marker-end arrowheads right now
        vis.selectAll("g.edgePath path").attr('marker-end', '');
      }

      angular.forEach(scope.tokens, function(token, id) {
        var childScope = scope.$new();
        childScope.token = token.id;
        childScope.head =  token.head;
        childScope.$watch('head.id', function(newVal, oldVal) {
          // Very important to do here, otherwise the tree will
          // be render a little often on startup...
          if (newVal !== oldVal) {
            updateEdge(token);
            render();
          }
        });
      });

      scope.$watch('tokens', function(newVal, oldVal) {
        createNodes();
        createEdges();
        render();
      });
    },
    template: '<g transform="translate(20,20)"/>'
  };
});
