var Table = require('./table');
var mkSVG = require('./mkSVG');


//////
// BLOCKS
var Blk = {
  type: 'block',
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


//////
// prototype element
var SvgElem = {
  object: 'SvgElem'
};
SvgElem.move = function(x, y){
  if( typeof this.points != 'undefined' ) {
    for( var i in this.points ) {
      this.points[i][0] += x;
      this.points[i][1] += y;
    }
  }
  return this;
};
SvgElem.rotate = function(deg){
  this.rotated = deg;
};



var drawing = {};
drawing.layer = function(name){ // set current layer
  if( typeof name === 'undefined' ){ // if no layer name given, reset to default
    this.layer_active = false;
  } else if ( ! (name in this.settings.layer_attr) ) {
    console.warn('Error: unknown layer "'+name+'", using base');
    this.layer_active = 'base' ;
  } else { // finaly activate requested layer
    this.layer_active = name;
  }
  //*/
};
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
    console.log('name required');
  } else {
    var blk;
    this.block_active = name;
    if( this.blocks[this.block_active] !== undefined ){
      console.log('block already exists, and is being overwritten');
    } else {
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

drawing.add = function(type, points, layer_name, attrs) {
  if( points[0] === undefined ) console.warn('points not defined', type, points, layer_name );

  if( ! layer_name ) { layer_name = this.layer_active; }
  if( ! (layer_name in this.settings.layer_attr) ) {
    console.warn('Error: Layer "'+ layer_name +'" name not found, using base. ', [type, points, layer_name, attrs] );
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

  var elem = Object.create(SvgElem);
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

  if(this.block_active) {
    elem.block_name = this.block_active;
    this.blocks[this.block_active].add(elem);
  } else {
    this.drawing_parts.push(elem);
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

  return elem;
};

drawing.line = function(points, layer, attrs){ // (points, [layer])
  //return add('line', points, layer)
  var line =  this.add('line', points, layer, attrs);
  return line;
};

drawing.poly = function(points, layer, attrs){ // (points, [layer])
  //return add('poly', points, layer)
  var poly =  this.add('poly', points, layer, attrs);
  return poly;
};

drawing.path = function(d, layer, attrs){ // (points, [layer])
  //return add('poly', points, layer)
  var path_attrs = attrs || {};
  path_attrs.d = d;
  var path =  this.add('path', [[0,0]], layer, path_attrs);
  return path;
};

drawing.rect = function(loc, size, layer, attrs){
  var rec = this.add('rect', [loc], layer, attrs);
  rec.w = size[0];
  rec.h = size[1];
  return rec;
};

drawing.circ = function(loc, diameter, layer, attrs){
  var cir = this.add('circ', [loc], layer, attrs);
  cir.d = diameter;
  return cir;
};

drawing.ellipse = function(loc, diameters, layer, attrs){
  var cir = this.add('ellipse', [loc], layer, attrs);
  cir.dx = diameters[0];
  cir.dy = diameters[1];
  return cir;
};

drawing.text = function(loc, strings, layer, font, attrs){
  var txt = this.add('text', [loc], layer, attrs);
  if( typeof strings === 'string'){
    strings = [strings];
  }
  txt.strings = strings;
  txt.font = font;
  return txt;
};

drawing.image = function(loc, size, href, layer, attrs){
  var img = this.add('image', [loc], 'image', attrs);
  img.w = size[0];
  img.h = size[1];
  img.href = href;
  return img;
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




if( Table ){
  drawing.table = function( num_rows, num_cols ){
    var new_table = Object.create(Table);
    new_table.init( this, num_rows, num_cols );
    return new_table;
  };
}

if( mkSVG ){
  drawing.mkSVG = function(){
    var svg = mkSVG(this);
    return svg;
  };
}




var layer_attr_base = {
  'fill': 'none',
  'stroke': '#000000',
  'stroke-width': '1px',
  'stroke-linecap': 'butt',
  'stroke-linejoin': 'miter',
  'stroke-opacity': 1
};
var fonts_base = {
  'font-family': 'monospace',
  'font-size': 10,
  'text-anchor': 'middle'
};








var Drawing = function(settings){
  var d = Object.create(drawing);
  d.settings = settings || {};

  d.settings.size = d.settings.size || {};
  d.settings.size.h = d.settings.size.h || 100;
  d.settings.size.w = d.settings.size.w || 100;
  d.settings.scale = d.settings.scale || 1;
  d.blocks = d.settings.blocks || {};

  d.settings.layer_attr = d.settings.layer_attr || {
    base: layer_attr_base
  };
  d.settings.fonts = d.settings.fonts || {
    base: fonts_base
  };
  d.drawing_parts = [];
  d.layer_active = false;
  //d.layers = {};
  d.section_active = false;
  d.block_active = false;
  return d;
};


module.exports = Drawing;
