var mkSVG = require('./mkSVG.js');

module.exports = function(settings){

  // BLOCKS
  var Blk = {
    type: 'block'
  };
  Blk.move = function(x, y){
    for( var i in this.drawing_parts ){
      this.drawing_parts[i].move(x,y);
    }
    return this;
  };
  Blk.add = function(){
    if( typeof this.drawing_parts == 'undefined'){
      this.drawing_parts = [];
    }
    for( var i in arguments){
      this.drawing_parts.push(arguments[i]);
    }
    return this;
  };
  Blk.rotate = function(deg){
    this.rotated = deg;
    return this;
  };



  var drawElem = {
    object: 'drawElem'
  };
  drawElem.move = function(x, y){
    if( typeof this.points != 'undefined' ) {
      for( var i in this.points ) {
        this.points[i][0] += x;
        this.points[i][1] += y;
      }
    }
    return this;
  };
  drawElem.rotate = function(deg){
    this.rotated = deg;
  };









  /////////////////////////
  // Drawing prototype
  var drawing = {
    mkSVG: mkSVG
  };

  drawing.layer = function(name){ // set current layer
    if( typeof name === 'undefined' ){ // if no layer name given, reset to default
      this.layer_active = false;
    } else {
      this.layer_active = name;
    }
    //*/
  };

  // section section
  drawing.section = function(name){ // set current section
    if( typeof name === 'undefined' ){ // if no section name given, reset to default
      this.section_active = false;
    } else { // finaly activate requested section
      this.section_active = name;
    }
    //*/
  };


  drawing.block_start = function(name) {
    if( typeof name === 'undefined' ){ // if name argument is submitted
      console.log('Error: name required');
    } else {
      var blk;
      this.block_active = name;
      if( this.blocks[this.block_active] !== undefined ){
        //console.log('Error: block already exists');
      }
      blk = Object.create(Blk);
      this.blocks[this.block_active] = blk;
      return blk;
    }
  };


  drawing.block_end = function() {
    var blk = this.blocks[this.block_active];
    this.block_active = false;
    return blk;
  };







  ////////////////////////////////////////
  // functions for adding drawing_parts

  drawing.add = function(type, points, layer_name, attrs) {
    if( points[0] === undefined ) console.warn('points not deffined', type, points, layer_name );

    if( ! layer_name ) {
      layer_name = this.layer_active;
    }
    if( this.settings.later_attr && ! (layer_name in this.settings.later_attr) ) {
      console.warn('Error: Layer '+ layer_name +' name not found, using base. ', [type, points, layer_name, attrs] );
      layer_name = 'base';
    }

    if( typeof points == 'string') {
      var points_a = points.split(' ');
      for( var i in points_a ) {
        points_a[i] = points_a[i].split(',');
        for( var c in points_a[i] ) {
          points_a[i][c] = Number(points_a[i][c]);
        }
      }
    }



    var elem = Object.create(drawElem);
    elem.type = type;
    elem.layer_name = layer_name;
    elem.section_name = this.section_active;
    if( attrs !== undefined ) elem.attrs = attrs;
    if( type === 'line' ) {
      elem.points = points;
    } else if( type === 'poly' ) {
      elem.points = points;
    } else if( type === 'path' ) {
      elem.points = points;
    } else if( typeof points[0].x === 'undefined') {
      elem.x = points[0][0];
      elem.y = points[0][1];
    } else {
      elem.x = points[0].x;
      elem.y = points[0].y;
    }



    // Temp. NaN check
    points.forEach(function(point){
      if( point.constructor === Array ){
        point.forEach(function(num){
          if( isNaN(num) ){
            console.log( 'NaN alert:', elem);
          }
        });
      } else {
        if( isNaN(point.x) || isNaN(point.y) ){
          console.log( 'NaN alert:', elem);
        }

      }
    });

    if(this.block_active) {
      elem.block_name = this.block_active;
      this.blocks[this.block_active].add(elem);
    } else {
      this.drawing_parts.push(elem);
    }
    return this;
  };





  drawing.line = function(points, layer, attrs){ // (points, [layer])
    return this.add('line', points, layer, attrs);
  };

  drawing.poly = function(points, layer, attrs){ // (points, [layer])
    //return add('poly', points, layer)
    return this.add('poly', points, layer, attrs);
  };

  drawing.path = function(d, layer, attrs){ // (points, [layer])
    // TODO: convert this to something non SVG specific format.
    return this.add('path', [[0,0]], layer, Object.assign({}, attrs, {
      d: d
    }));
  };

  drawing.rect = function(loc, size, layer, attrs){
    return this.add('rect', [loc], layer, Object.assign({}, attrs, {
      w: size[0],
      h: size[1]
    }));
  };

  drawing.circ = function(loc, diameter, layer, attrs){
    return this.add('circ', [loc], layer, Object.assign({}, attrs, {
      d: diameter
    }));
  };

  drawing.ellipse = function(loc, diameters, layer, attrs){
    return this.add('ellipse', [loc], layer, Object.assign({}, attrs, {
      dx: diameters[0],
      dy: diameters[1]
    }));
  };

  drawing.text = function(loc, strings, layer, font, attrs){
    if( typeof strings === 'string'){
      strings = [strings];
    }
    return this.add('text', [loc], layer, Object.assign({}, attrs, {
      strings: strings,
      font: font
    }));
  };

  drawing.image = function(loc, size, href, layer, attrs){
    return this.add('image', [loc], 'image', Object.assign({}, attrs, {
      w: size[0],
      h: size[1],
      href: href
    }));
  };

  drawing.block = function(name) {// set current block
    var x,y;
    if( arguments.length === 2 ){ // if coor is passed
      if( typeof arguments[1].x !== 'undefined' ){
        x = arguments[1].x;
        y = arguments[1].y;
      } else {
        x = arguments[1][0];
        y = arguments[1][1];
      }
    } else if( arguments.length === 3 ){ // if x,y is passed
      x = arguments[1];
      y = arguments[2];
    }

    // TODO: what if block does not exist? print list of blocks?
    var blk = Object.create(this.blocks[name]);
    blk.x = x;
    blk.y = y;

    if(this.block_active){
      this.blocks[this.block_active].add(blk);
    } else {
      this.drawing_parts.push(blk);
    }
    return blk;
  };




  drawing.append =  function(drawing){
    //var blk = Object.create(Blk);
    //blk.drawing_parts = drawing.drawing_parts;

    this.drawing_parts = this.drawing_parts.concat(drawing.drawing_parts);
    //this.drawing_parts = this.drawing_parts.concat(drawing_parts);
    return this;
  };




  var d = Object.create(drawing);
  d.settings = settings;
  //console.log(d);
  d.drawing_parts = [];
  d.layer_active = false;
  d.layers = {};
  d.section_active = false;
  d.block_active = false;
  d.blocks = {};


  return d;

};
