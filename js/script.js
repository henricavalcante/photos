var INSTAGRAM_FILENAME = 'instagram-data.json';
var GEOJSON_FILENAME = 'photos.geojson';
var COLLECTION_ID = 'collection-photos';

function loadMap(_L, callback) {
	_L.mapbox.accessToken = 'pk.eyJ1IjoiaGVucmljYXZhbGNhbnRlIiwiYSI6InRDOE8tLWcifQ.JkJBQ2DXdKocb-3F7Q0tmQ';
	var map = _L.mapbox.map('map', 'henricavalcante.m67go40h').setView([0, 0], 2);
	callback(_L,map);
}

function loadJson(file, callback) {
	var r = new XMLHttpRequest();
	r.open("get", file, true);
	r.onreadystatechange = function () {
	  if (r.readyState != 4 || r.status != 200) return;
	  callback(JSON.parse(r.responseText));
	};
	r.send();
}

function addImagesFromGeoJsonToMap(geojson, map, callback) {
	var layer = L.mapbox.featureLayer().addTo(map);
	layer.setGeoJSON(geojson).addTo(map);

	layer.eachLayer(function(marker) {
		var properties = marker.feature.properties;
		marker.bindPopup(properties.photo.title);
  });

  showExistingPhotosFromLayer(collection, map, layer);
}

function addImagesFromInstagramJsonToMap(instagramjson, map, callback) {
	var layer = L.mapbox.featureLayer().addTo(map);
	var features = _.map(instagramjson.data, function (feature) {
		
		if (feature.location === null) return null;

		var caption = '';
		if (feature.caption) {
			caption = feature.caption.text;
		}
		return {
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [feature.location.longitude, feature.location.latitude]
      },
      properties: {
        'marker-color': '#7a0909',
        'marker-size': 'small',
        'marker-symbol': 'square',
        'photo': {
          'src': feature.images.standard_resolution.url,
          'title': caption,
          'caption': feature.tags.join(', ')
        }
      }
    };
	});

	features = _.filter(features, function (feature) {
		return !!feature;
	});

	layer.setGeoJSON({
	    type: 'FeatureCollection',
	    features: features
	});

	layer.eachLayer(function(marker) {
		var properties = marker.feature.properties;
		marker.bindPopup(properties.photo.title);
  });

  showExistingPhotosFromLayer(collection, map, layer);
	
}

function showExistingPhotosFromLayer(collection, map, layer) {
	var bounds = map.getBounds();

	layer.eachLayer(function(marker) {
    if (bounds.contains(marker.getLatLng())) {
      var photo = marker.feature.properties.photo;
			if (photo) {
				addImageToCollection(collection, photo);
			}
    }
  });
}

function showExistingPhotos(collection, map, layers) {
	clearImagesOfCollection(collection, function () {
		for (var property in layers) {
		  if (layers.hasOwnProperty(property)) {
		    if (layers[property]._geojson) {
					showExistingPhotosFromLayer(collection, map, layers[property]);
		    }
		  }
		}
	});
}

function clearImagesOfCollection(collection, callback) {
	collection.innerHTML = '';
	if (typeof(callback) === 'function') {
		callback();
	}
}

function addImageToCollection(collection, src, title, caption) {
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
	collection.appendChild(img);
	Intense(img);
}

window.onload = function(){
  loadMap(L, function (_L, map) {
		loadJson(GEOJSON_FILENAME, function (geojson) {
	  	addImagesFromGeoJsonToMap(geojson, map);
		});
		loadJson(INSTAGRAM_FILENAME, function (instagramjson) {
	  	addImagesFromInstagramJsonToMap(instagramjson, map);
		});

		map.on('move', function(e) {
			var layers = e.target._layers;
			var collection = document.getElementById(COLLECTION_ID);
			showExistingPhotos(collection, map, layers);
		});
	});
};



