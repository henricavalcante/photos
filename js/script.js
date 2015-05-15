var INSTAGRAM_CLIENT_ID = '40a232e922d749259d878fdd4161deb0';
var INSTAGRAM_USER_ID = '32644002';
var GEOJSON_FILENAME = 'photos.geojson';
var MAP_LAYER;

function loadMap(_L, callback) {
	_L.mapbox.accessToken = 'pk.eyJ1IjoiaGVucmljYXZhbGNhbnRlIiwiYSI6InRDOE8tLWcifQ.JkJBQ2DXdKocb-3F7Q0tmQ';
	var map = _L.mapbox.map('map', 'henricavalcante.m67go40h').setView([0, 0], 2);
	MAP_LAYER = L.mapbox.featureLayer().addTo(map);
	callback(_L,map);
}

function loadJson(_L, map, file, callback) {
	var r = new XMLHttpRequest();
	r.open("get", file, true);
	r.onreadystatechange = function () {
	  if (r.readyState != 4 || r.status != 200) return;
	  callback(JSON.parse(r.responseText));
	};
	r.send();
}

function addImagesFromGeoJsonToMap(layer, geojson, map, callback) {
	layer.setGeoJSON(geojson, {
		style: function (feature) {
			return {color: feature.properties.color};
		},
		onEachFeature: function (feature, layer) {
			console.log(feature);
			var photo = feature.properties.photo;
			if (photo) {
				addImageToCollection(photo.src, photo.title, photo.caption);
			}
			layer.bindPopup(feature.properties.name);
		}
	}).addTo(map);

	layer.eachLayer(function(marker) {
		var properties = marker.feature.properties;
		marker.bindPopup(properties.name);
  });

  showExistingPhotos(map, layer);
}

function showExistingPhotos(map, layer) {
	clearImagesOfCollection();
	var bounds = map.getBounds();

	layer.eachLayer(function(marker) {
      if (bounds.contains(marker.getLatLng())) {
        var photo = marker.feature.properties.photo;
				if (photo) {
					addImageToCollection(photo);
				}
      }
  });
}

function clearImagesOfCollection(callback) {
	document.getElementById('collection-photos').innerHTML = '';
	if (typeof(callback) === 'function') {
		callback();
	}
}

function addImageToCollection(src, title, caption) {
	if (typeof(src) === 'object') {
		caption = src.caption;
		title = src.title;
		src = src.src;
	}
	var img = document.createElement('IMG');
	img.setAttribute('src', src);
	img.setAttribute('data-title', title);
	img.setAttribute('data-caption', caption);
	img.setAttribute('class', 'images');
	document.getElementById('collection-photos').appendChild(img);
	Intense(img);
}

window.onload = function(){
  loadMap(L, function (_L, map) {
		loadJson(_L, map, GEOJSON_FILENAME, function (geojson) {
	  	addImagesFromGeoJsonToMap(MAP_LAYER, geojson, map);
		});

		map.on('move', function(e) {
			showExistingPhotos(map, MAP_LAYER);
		});
	});
};



