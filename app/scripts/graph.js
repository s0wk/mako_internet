/* global $:false, d3:false */
'use strict';
// console.log('------------- graph -------------');

// ---------- Dataset of the graph ---------- //

// console.log('userSetting \n', userSetting, '\n', 'familyData \n', familyData);

// update() => Init graph with value 0 GB
// update(data) => Graph with total usage of the family, express in GB
// update(data, type) => Graph for each type of consume

// ---------- base vars  ---------- //
var width = 425;
var height = 425;
var radius = Math.min(width, height) / 2;
var innerRadius = radius - 30;
var fontSize = 85;
var fontFill = '#007b82';
var colors = ['#005b7f', '#007dac', '#00a99d', '#6cc17b', '#a7003d', '#6f2c91', '#4b0049'];

// Create the base svg and take data from dataGraph
var svg = d3.select('#svg')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('svg:g')
  .attr('transform', 'translate(' + radius + ',' + radius + ')');

var innerGroup = svg.append('svg:g').attr('class', 'inner-radius');

// Create svg group for the inner text
var subGroupA = svg.append('svg:g')
  .attr('class', 'numbers')
  .attr('transform', 'translate(' + 0 + ',' + -(height/4) + ')');

var subGroupB = svg.append('svg:g')
  .attr('class', 'labels')
  .attr('transform', 'translate(' + 0 + ',' + -(height/4) + ')');

// ---------- Render and update the graph  ---------- //
function updateGraph(dataset, type) {
  // Init values for colors and data
  if(dataset === undefined) {
    var data = [100, 0, 0, 100, 0, 0, 100];
    var color = d3.scale.ordinal().range(['#ccc']);
    var dataNumber = [0] ;
    var dataText = ['GB de uso mensual'];
  } else {
    var data = dataset.list.gb;
    var color = d3.scale.ordinal().range(colors);
    if(type === undefined) {
      var dataNumber = dataset.messages.base.number;
      var dataText = dataset.messages.base.string;
    } else {
      var dataNumber = dataset.messages[type[0]].number;
      var dataText = dataset.messages[type[0]].string;
    }
  }

  // console.log(dataNumber, dataText);

  // Setting pie value and sort
  var pie = d3.layout.pie().sort(null);

  // Helper function to calc arc's
  var arc = d3.svg.arc()
    .startAngle(function(d){ return d.startAngle; })
    .endAngle(function(d){ return d.endAngle; })
    .innerRadius(innerRadius)
    .outerRadius(radius);

  // DATA JOIN
  // Join new data with old elements, if any.
  var arcs = svg.selectAll('path').data(pie(data));
  var numbers = subGroupA.selectAll('text').data(dataNumber);
  var labels = subGroupB.selectAll('text').data(dataText);

  // UPDATE
  // Update old elements as needed.
  arcs
    .attr('fill', function(d, i) { return color(i);})
    .attr('opacity', function(d, i) {
      if(type !== undefined) {
        if(type[1] === i) {
          return 1;
        } else {return 0.5;}
      } else {return 1;}
    });

  numbers
    .attr('y', function(d, i) {
      return type === undefined ? (120 + i * 120) : (70 + i * 110);
    });

  labels
    .attr('y', function(d, i) {
      return type === undefined ? (150 + i * 120) : (100 + i * 110);
    });

  // ENTER
  // Create new elements as needed.
  arcs.enter()
    .append('path')
    .attr('fill', function(d, i) { return color(i);})
    .attr('d', arc)
    .each(function(d) { this._current = d; }); // store the initial angles

  numbers.enter()
    .append('svg:text')
    .attr('fill', fontFill)
    .attr('text-anchor', 'middle')
    .attr('y', function(d, i) {
      return type === undefined ? (120 + i * 120) : (80 + i * 120);
    })
    .style('font-size', function(d, i) {return fontSize + 'px';});

  labels.enter()
    .append('svg:text')
    .attr('fill', fontFill)
    .attr('text-anchor', 'middle')
    .attr('y', function(d, i) {
      return type === undefined ? (150 + i * 120) : (110 + i * 120);
    })
    .style('font-size', function(d, i) {return fontSize/5 + 'px';});


  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  // arcs.attr('d', function(d) {return arc(d);});
  arcs
    .transition()
    .duration(1000)
    .attrTween('d', arcTween);

  numbers
    .transition()
    .duration(500)
    .tween('text', textTween);

  labels.text(function(d) {return d;});

  // Function for calc the transition of text
  function textTween(a) {
    var i = d3.interpolate(this.textContent, a);
    var prec = (a + '').split('.');
    var round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
    return function(t) {
        this.textContent = Math.round(i(t) * round) / round;
    };
  }

  // Function for calc the transition of the arc
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  // EXIT
  // Remove old elements as needed.
  arcs.exit().remove();
  labels.exit().remove();
  numbers.exit().remove();
}

updateGraph();

