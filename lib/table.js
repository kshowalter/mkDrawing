var f = require('functions');

//////////////
// Tables

var Cell = {
  init: function(table, R, C){
    //var self = this;
    this.table = table;
    this.R = R;
    this.C = C;

    return this;
  },
  /*
  border_options: ['T', 'B', 'L', 'R'],
  //*/
  text: function(text){
    this.cell_text = text;
    return this;

  },
  font: function(font_name){
    this.cell_font_name = font_name;
    return this;
  },

  border: function(border_string, settings){
    this.table.border( this.R, this.C, border_string, settings );
    return this;
  }
};

var Table = {
  init: function( drawing, num_rows, num_cols ){
    this.drawing = drawing;
    this.num_rows = num_rows;
    this.num_cols = num_cols;
    var r,c;

    // setup border containers
    this.borders_rows = [];
    for( r=0; r<=num_rows; r++){
      this.borders_rows[r] = [];
      for( c=1; c<=num_cols; c++){
        this.borders_rows[r][c] = false;
      }
    }
    this.borders_cols = [];
    for( c=0; c<=num_cols; c++){
      this.borders_cols[c] = [];
      for( r=1; r<=num_rows; r++){
        this.borders_cols[c][r] = false;
      }
    }

    // set column and row size containers
    this.row_sizes = [];
    for( r=1; r<=num_rows; r++){
      this.row_sizes[r] = 15;
    }
    this.col_sizes = [];
    for( c=1; c<=num_cols; c++){
      this.col_sizes[c] = 60;
    }

    // setup cell container
    this.cells = [];
    for( r=1; r<=num_rows; r++){
      this.cells[r] = [];
      for( c=1; c<=num_cols; c++){
        this.cells[r][c] = Object.create(Cell);
        this.cells[r][c].init( this, r, c);
      }

    }
    //*/

    return this;
  },
  loc: function( x, y){
    this.x = x;
    this.y = y;
    return this;
  },
  cell: function( R, C ){
    return this.cells[R][C];
  },
  all_cells: function(){
    var cell_array = [];
    this.cells.forEach(function(row){
      row.forEach(function(cell){
        cell_array.push(cell);
      });
    });
    return cell_array;
  },
  col_size: function(col, size){
    if( typeof col === 'string' ){
      if( col === 'all'){
        f.range(this.num_cols).forEach(function(c){
          this.col_sizes[c+1] = size;
        },this);
      } else {
        size = Number(size);
        if( isNaN(size) ){
          console.log('column wrong');
        } else {
          this.col_sizes[col] = size;
        }
      }
    } else { // is number
      this.col_sizes[col] = size;
    }
    return this;
  },
  //*/
  row_size: function(row, size){
    if( typeof row === 'string' ){
      if( row === 'all'){
        f.range(this.num_rows).forEach(function(r){
          this.row_sizes[r+1] = size;
        },this);
      } else {
        size = Number(size);
        if( isNaN(size) ){
          console.log('column wrong');
        } else {
          this.row_sizes[row] = size;
        }
      }
    } else { // is number
      this.row_sizes[row] = size;
    }
    return this;
  },



  border: function( R, C, border_string, settings){
    if( settings === undefined ) settings = true;

    border_string = border_string.toUpperCase().trim();
    var borders;
    if( border_string === 'ALL' ){
      borders = ['T', 'B', 'L', 'R'];
    } else {
      borders = border_string.split(/[\s,]+/);
    }
    borders.forEach(function(side){
      switch(side){
        case 'T':
        this.borders_rows[R-1][C] = settings;
        break;
        case 'B':
        this.borders_rows[R][C] = settings;
        break;
        case 'L':
        this.borders_cols[C-1][R] = settings;
        break;
        case 'R':
        this.borders_cols[C][R] = settings;
        break;
      }
    }, this);
    return this;
  },
  border_layer: function(border_layer_name){
    this.border_layer_name = border_layer_name;
    return this;
  },
  corner: function(R,C){
    var x = this.x;
    var y = this.y;
    var r,c;
    for( r=1; r<=R; r++ ){
      y += this.row_sizes[r];
    }
    for( c=1; c<=C; c++ ){
      x += this.col_sizes[c];
    }
    return [x,y];
  },
  center: function(R,C){
    var x = this.x;
    var y = this.y;
    var r,c;
    for( r=1; r<=R; r++ ){
      y += this.row_sizes[r];
    }
    for( c=1; c<=C; c++ ){
      x += this.col_sizes[c];
    }
    y -= this.row_sizes[R]/2;
    x -= this.col_sizes[C]/2;
    return [x,y];
  },
  left: function(R,C){
    var coor = this.center(R,C);
    coor[0] = coor[0] - this.col_sizes[C]/2 + this.row_sizes[R]/4;
    return coor;
  },
  right: function(R,C){
    var coor = this.center(R,C);
    coor[0] = coor[0] + this.col_sizes[C]/2 - this.row_sizes[R]/4;
    return coor;
  },
  height: function(){
    return this.row_sizes.reduce(function(accumulator, current_value){
      if( !isNaN(current_value) ){
        return accumulator + current_value;
      } else {
        return accumulator;
      }
    });
  },
  mk: function(){
    var self = this;
    var r,c;

    for( r=1; r<=this.num_rows; r++ ){
      for( c=1; c<=this.num_cols; c++ ){
        var cell = this.cell(r,c);

        var font_name = cell.cell_font_name || 'table';
        var coor;
        if( this.drawing.settings.fonts[font_name]['text-anchor'] === 'center') coor = this.center(r,c);
        else if( this.drawing.settings.fonts[font_name]['text-anchor'] === 'right') coor = this.right(r,c);
        else if( this.drawing.settings.fonts[font_name]['text-anchor'] === 'left') coor = this.left(r,c);
        else coor = this.center(r,c);

        if( typeof cell.cell_text === 'string' ){
          this.drawing.text(
            coor,
            cell.cell_text,
            'text',
            font_name
          );
        } else if( cell.cell_text && cell.cell_text.constructor === Array ){
          cell.cell_text.forEach(function(line,i){
            coor[1] = coor[1] + (self.row_sizes[r] * i);
            self.drawing.text(
              coor,
              line,
              'text',
              font_name
            );
          });
          self.row_size(r,Math.ceil( self.row_sizes[r]*cell.cell_text.length) );
        }
      }
    }

    var border_layer_name = this.border_layer_name || 'border';
    for( r=0; r<=this.num_rows; r++ ){
      for( c=1; c<=this.num_cols; c++ ){
        if( this.borders_rows[r][c] === true ){
          this.drawing.line([
            this.corner(r,c-1),
            this.corner(r,c),
          ], border_layer_name);

        }
      }
    }
    for( c=0; c<=this.num_cols; c++ ){
      for( r=1; r<=this.num_rows; r++ ){
        if( this.borders_cols[c][r] === true ){
          this.drawing.line([
            this.corner(r-1,c),
            this.corner(r,c),
          ], border_layer_name);

        }
      }
    }
  }


};

module.exports = Table;
