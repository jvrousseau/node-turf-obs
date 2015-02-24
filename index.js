console.time('hexgrid-obs');
var fs = require('fs');
var  current_obs = require('./global_obs');
var gradient = require('./gradient');
var  turf = require('turf');
var new_features = [];
var bbox = [-179,-85,179, 85];
console.time('create-hexgrid');
var grid = turf.hex(bbox, 0.50);
console.timeEnd('create-hexgrid');
console.time('count-points');
var grid = turf.count(grid, current_obs, 'pt_count');
console.timeEnd('count-points');
console.time('average-temperature');
var grid = turf.average(grid, current_obs, 'temp_c', 'temperature');
console.timeEnd('average-temperature');
console.time('style-features');
max = 0;
grid.features.forEach(function(cell) {
  var pt_count = cell.properties.pt_count;
  if (pt_count > 0) {
    var color = pt_count === 0 ? '#000000' : getColor(cell.properties.temperature);
    cell.properties.color = color;
    cell.properties.weight = 0.5;
    cell.properties.fill = color;
    cell.properties.stroke = pt_count > 0;
    cell.properties.fillOpacity =  pt_count > 0 ? ((pt_count / 100) + 0.2) : 0;
    new_features.push(cell);
  }
  //max = max > pt_count ? max : pt_count;
  //console.log(max);
});
grid.features = new_features;
console.timeEnd('style-features');
console.time('write-file');
var file_contents = JSON.stringify(grid);

fs.writeFileSync('hex-obs.js', "var hexgrid = " + file_contents);

console.timeEnd('write-file');
console.timeEnd('hexgrid-obs');

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
