var fs = require('fs');
var  current_obs = require('./global_obs');
var gradient = require('./gradient');
var  turf = require('turf');

var bbox = [-179,-85,179, 85];

var grid = turf.hex(bbox, 1.0);
var grid = turf.count(grid, current_obs, 'pt_count');
var grid = turf.average(grid, current_obs, 'temp_c', 'temperature');
max = 0;
grid.features.forEach(function(cell) {
  var pt_count = cell.properties.pt_count;
  var color = pt_count === 0 ? '#000000' : getColor(cell.properties.temperature);
  cell.properties.color = color;
  cell.properties.weight = 0.5;
  cell.properties.fill = color;
  cell.properties.stroke = pt_count > 0;
  cell.properties.fillOpacity =  pt_count > 0 ? ((pt_count / 100) + 0.2) : 0;
  //max = max > pt_count ? max : pt_count;
  //console.log(max);
});

var file_contents = JSON.stringify(grid);

fs.writeFileSync('hex-obs.js', "var hexgrid = " + file_contents);

function getColor(temp) {
  var color = "#FF00FF";
  temp = temp  * 1.8000 + 60;
  gradient.some(function (value, index, array) {
    if(temp >= value.temp) {
      color = value.hex;
      return true;
    }
  });
  return color;
}
