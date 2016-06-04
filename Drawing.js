var mkSVG = require('./mkSVG.js');

module.exports = function(settings){


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
      console.log('Error: block name required');
    } else {
      this.block_active = name;
      if( this.blocks[this.block_active] === undefined ){
        //console.log('Error: block already exists');
        this.blocks[this.block_active] = [];
      } else {
        console.log('Exending block:', name);
      }
    }
    return this;
  };


  drawing.block_end = function() {
    this.block_active = false;
    return this;
  };

  drawing.block = function(block_spec) {// set current block
    block_spec.parts = this.blocks[block_spec.name];

    if(this.block_active){
      this.blocks[this.block_active].push(blk);
    } else {
      this.drawing_parts.push(blk);
    }
    return this;
  };


  drawing.add = function(geom){
    if( ! geom.type ){
      console.warn('Drawing element missing type: ', geom);
      return false;
    }

    if( geom.points ) {
      if( typeof points == 'string') {
        var points_a = geom.points.split(' ');
        for( var i in points_a ) {
          points_a[i] = points_a[i].split(',');
          for( var c in points_a[i] ) {
            points_a[i][c] = Number(points_a[i][c]);
          }
        }
      }
    }

    if( geom.points && geom.points.constructor === Array ){
      geom.points.forEach(function(point){
        if( point.constructor === Array ){
          if( isNaN(point[0]) || isNaN(point[1]) ){
            console.log( 'NaN alert:', geom);
          } else {
            point = {
              x: point[0],
              y: point[1]
            };
          }
        }
      });
    }

    if( ! geom.layer_name ) {
      geom.layer_name = this.layer_active || '';
    }

    if( this.settings.later_attr && ! (geom.layer_name in this.settings.later_attr) ) {
      console.warn('Error: Layer '+ geom.layer_name +' name not found, using base. ', geom );
      geom.layer_name = 'base';
    }

    if(this.block_active) {
      geom.block_name = this.block_active;
      this.blocks[this.block_active].add(geom);
    } else {
      this.drawing_parts.push(geom);
    }

    return this;
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
