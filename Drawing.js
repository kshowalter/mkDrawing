Drawing = function(g){

  var drawing = {};

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


  var block_active = false;
  // Create default layer,block container and functions

  // Layers

  var layer_active = false;

  drawing.layer = function(name){ // set current layer
    if( typeof name === 'undefined' ){ // if no layer name given, reset to default
      layer_active = false;
    } else if ( ! (name in layer_attr) ) {
      console.warn('Error: unknown layer "'+name+'", using base');
      layer_active = 'base' ;
    } else { // finaly activate requested layer
      layer_active = name;
    }
    //*/
  };

  var section_active = false;

  drawing.section = function(name){ // set current section
    if( typeof name === 'undefined' ){ // if no section name given, reset to default
      section_active = false;
    } else { // finaly activate requested section
      section_active = name;
    }
    //*/
  };


  drawing.block_start = function(name) {
    if( typeof name === 'undefined' ){ // if name argument is submitted
      console.log('Error: name required');
    } else {
      var blk;
      block_active = name;
      if( settings.drawing.blocks[block_active] !== undefined ){
        //console.log('Error: block already exists');
      }
      blk = Object.create(Blk);
      settings.drawing.blocks[block_active] = blk;
      return blk;
    }
  };


  drawing.block_end = function() {
    var blk = settings.drawing.blocks[block_active];
    block_active = false;
    return blk;
  };







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

  ///////
  // functions for adding drawing_parts

  drawing.add = function(type, points, layer_name, attrs) {
    if( points[0] === undefined ) console.warn("points not deffined", type, points, layer_name );

    if( ! layer_name ) { layer_name = layer_active; }
    if( ! (layer_name in layer_attr) ) {
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
    elem.section_name = section_active;
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

    if(block_active) {
      elem.block_name = block_active;
      settings.drawing.blocks[block_active].add(elem);
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
    var blk = Object.create(settings.drawing.blocks[name]);
    blk.x = x;
    blk.y = y;

    if(block_active){
      settings.drawing.blocks[block_active].add(blk);
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




  var page = Object.create(drawing);
  //console.log(page);
  page.drawing_parts = [];
  return page;

};
