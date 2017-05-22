module.exports = function(drawing){
  //console.log('displaying svg');
  //console.log('drawing_parts: ', drawing_parts);
  //container.empty()

  var layer_attr = drawing.settings.layer_attr;
  var fonts = drawing.settings.fonts;

  var svg_document = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg_document.setAttribute('width', drawing.settings.size.w);
  svg_document.setAttribute('height', drawing.settings.size.h);
  var view_box = '0 0 ' + drawing.settings.size.w * drawing.settings.scale + ' ' + drawing.settings.size.h * drawing.settings.scale + ' ';
  //svg_document.setAttribute('x', 0);
  //svg_document.setAttribute('y', 0);
  //svg_document.setAttribute('x', 0);
  //svg_document.setAttribute('y', 0);
  svg_document.setAttribute('viewBox', view_box);
  svg_document.setAttribute('xmlns','http://www.w3.org/2000/svg');
  svg_document.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');

  // Loop through all the drawing contents, call the function below.
  drawing.drawing_parts.forEach( function( geom ) {
    svg_document.appendChild(
      mk_svg_elem(geom)
    );
  });

  function mk_svg_elem(geom){
    var x,y,attr_name;
    if( typeof geom.x !== 'undefined' ) { x = geom.x; }
    if( typeof geom.y !== 'undefined' ) { y = geom.y; }

    var attrs = layer_attr[geom.layer];
    if( geom.attrs !== undefined){
      for( attr_name in geom.attrs ){
        attrs[attr_name] = geom.attrs[attr_name];
      }
    }

    var svg_elem;

    if( geom.type === 'rect') {

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      svg_elem.setAttribute('width', geom.w);
      svg_elem.setAttribute('height', geom.h);
      svg_elem.setAttribute('x', x-geom.w/2);
      svg_elem.setAttribute('y', y-geom.h/2);
      //console.log(geom.layer_name);
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }
      if(geom.rotated){
        //t.setAttribute('transform', 'rotate(' + geom.rotated + ' ' + x + ' ' + y + ')' );
        svg_elem.setAttribute('transform', 'rotate(' + geom.rotated + ' ' + x + ' ' + y + ')' );
      }

    } else if( geom.type === 'line') {
      var points2 = [];
      geom.points.forEach( function(point){
        if( ! isNaN(point[0]) && ! isNaN(point[1]) ){
          points2.push([ point[0], point[1] ]);
        } else {
          console.log('error: elem not fully defined', geom);
        }
      });
      //svg.polyline( points2 ).attr( layer_attr[geom.layer_name] );

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      svg_elem.setAttribute( 'points', points2.join(' ') );
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }

    } else if( geom.type === 'poly') {
      var points2 = [];
      geom.points.forEach( function(point){
        if( ! isNaN(point[0]) && ! isNaN(point[1]) ){
          points2.push([ point[0], point[1] ]);
        } else {
          console.log('error: elem not fully defined', geom);
        }
      });
      //svg.polyline( points2 ).attr( layer_attr[geom.layer_name] );

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      svg_elem.setAttribute( 'points', points2.join(' ') );
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }
    } else if( geom.type === 'path') {

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }

      //console.log(svg_elem);


    } else if( geom.type === 'text') {
      //var t = svg.text( geom.strings ).move( geom.points[0][0], geom.points[0][1] ).attr( layer_attr[geom.layer_name] )
      var font;
      if( geom.font && fonts[geom.font] ){
        font = fonts[geom.font];
      } else if(fonts[attrs.font]){
        font = fonts[attrs.font];
      } else {
        font = fonts['base'];
      }
      if( font === undefined){
        console.log('Font not found', font, fonts['base']['font-size']);

      }

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svg_elem.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space','preserve');
      if(geom.rotated){
        //t.setAttribute('transform', 'rotate(' + geom.rotated + ' ' + x + ' ' + y + ')' );
        svg_elem.setAttribute('transform', 'rotate(' + geom.rotated + ' ' + x + ' ' + y + ')' );
      } else {
        //if( font['text-anchor'] === 'middle' ) y += font['font-size']*1/3;
        y += font['font-size']*1/3;
      }
      var dy = font['font-size']*1.5;
      svg_elem.setAttribute('x', x);
      //svg_elem.setAttribute('y', y + font['font-size']/2 );
      svg_elem.setAttribute('y', y-dy );

      for( attr_name in attrs ){
        if( attr_name === 'stroke' ) {
          svg_elem.setAttribute( 'fill', attrs[attr_name] );
        } else if( attr_name === 'fill' ) {
          //svg_elem.setAttribute( 'stroke', 'none' );
        } else {
          svg_elem.setAttribute( attr_name, attrs[attr_name] );
        }

      }
      for( attr_name in font ){
        svg_elem.setAttribute( attr_name, font[attr_name] );
      }
      for( attr_name in geom.strings ){
        var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('dy', dy );
        tspan.setAttribute('x', x);
        tspan.textContent = geom.strings[attr_name]; // This does not work in IE
        //var html_string = '<tspan x=''+x+'' dy=''+dy+''>'+geom.strings[attr_name]+'</tspan>';
        //tspan.outerHTML = html_string;

        svg_elem.appendChild(tspan);
      }

    } else if( geom.type === 'circ') {
      var svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      svg_elem.setAttribute('rx', geom.d/2);
      svg_elem.setAttribute('ry', geom.d/2);
      svg_elem.setAttribute('cx', x);
      svg_elem.setAttribute('cy', y);
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }
    } else if( geom.type === 'ellipse') {
      var svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      svg_elem.setAttribute('rx', geom.dx/2);
      svg_elem.setAttribute('ry', geom.dy/2);
      svg_elem.setAttribute('cx', x);
      svg_elem.setAttribute('cy', y);
      for( attr_name in attrs ){
        svg_elem.setAttribute(attr_name, attrs[attr_name]);
      }

    } else if( geom.type === 'image') {

      //svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('x', x);
      image.setAttribute('y', y);
      image.setAttribute('width', geom.w);
      image.setAttribute('height', geom.h);
      image.setAttribute('xlink:href', 'http://spd.fsec.ucf.edu/'+geom.href);
      //image.setAttribute('xlink:href', geom.href);
      for( attr_name in attrs ){
        image.setAttribute(attr_name, attrs[attr_name]);
      }
      //settings.appendChild(svg_elem);
      //svg_elem.appendChild(g);
      //svg_elem.textContent += image.outerHTML;

      //svg_elem.appendChild(image);
      svg_elem = image;

    } else if(geom.type === 'block') {
      // if it is a block, run this function through each element.

      svg_elem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var transform = 'translate(' + x + ',' + y + ') ';
      if(geom.rotated){
        transform += 'rotate(' + geom.rotated + ')';
      }
      svg_elem.setAttribute('transform', transform);
      geom.drawing_parts.forEach( function(block_item,id){
        svg_elem.appendChild(
          mk_svg_elem(block_item)
        );
      });
    }

    return svg_elem;


  }
  return svg_document;
};
