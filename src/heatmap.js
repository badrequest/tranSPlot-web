var utm = "+proj=utm +zone=32",
	utm2 = "+proj=utm +zone=23 +south",
	wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

// Ponto 0, utilizado como base para sálculos
var baseX = -46.862748,
	baseY = -23.805917;

// Valores de base traduzidos para UTM.
var baseUtm = convertLtdLgtToUtm(baseX, baseY);

$(document).ready(function() {
	google.maps.event.addDomListener(window, 'load', function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				// Obtém dados de localização do aparelho.
				var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				// Gera uma instância do mapa configurada.
				var map = configureMap(latlng);

				// Armazena os dados geofraficos do campo visível do mapa.
				var bounds;

				// Adiciona um marcador à aplicação.
				addMarkerToMap(map, latlng);

				// Captura o evento de resize do navegador.
				window.onresize = function(event) {
					google.maps.event.trigger(map, 'resize');
					map.setCenter(map.getCenter());
				};

				// Alteração de posição no mapa da app.
				google.maps.event.addListener(map, 'dragend', function() {
					console.log("Bound was changed!");
					bounds = map.getBounds();

					// Converte de lgn/ltd para UTM
					var coX = convertToUtm(bounds.getNorthEast()),
						coY = convertToUtm(bounds.getSouthWest());

					// Realiza a subtração, encontra o valor em grid e o arredonda para o número próximo menor
					var pX = {};
					pX[0] = Math.floor((coX[0] - baseUtm[0]) / 10);
					pX[1] = Math.floor((coX[1] - baseUtm[1]) / 10);

					var pY = {};
					pY[0] = Math.floor((coY[0] - baseUtm[0]) / 10);
					pY[1] = Math.floor((coY[1] - baseUtm[1]) / 10);

					requestWebservice(map, pX, pY);
				});
			}, function(msg) {
				console.log(typeof msg == 'string' ? msg : "failed");
			});
		} else {
			alert("Seu navegador não suporta a tecnologia utilizada pela aplicação.");
		}
	});
});

// Configura o mapa de acordo com seus atributos.
function configureMap(latlng) {
	console.log(latlng);
	return new google.maps.Map(document.getElementById("map-canvas"), {
		center: latlng,
		disableDoubleClickZoom: false,
		disableDefaultUI: true,
		draggable: true,
		mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		navigationControl: true,
		panControl: true,
		scaleControl: true,
		scrollwheel: true,
		streetViewControl: true,
		zoom: 16,
		zoomControl: true,
	});
}

// Realiza a requisição ao WebService.
function requestWebservice(map, ne, sw) {
	// Realiza a requisição ao webservice para resgatar dados para a aplicação.
	$.ajax({
		crossDomain: true,
		data: {
			"ix": ne[0],
			"fx": ne[1],
			"iy": sw[0],
			"fy": sw[1]
		},
		dataType: "json",
		type: "GET",
		url: "src/request.php"
	}).done(function(response) {
		var positions = JSON.parse(response).data;

		heatmap = new google.maps.visualization.HeatmapLayer({
			data: new google.maps.MVCArray(getPoints(positions))
		});

		heatmap.set('radius', 7);
		heatmap.setMap(map);
	}).fail(function() {
		console.log("Erro na requisição ao WebService");
	}).always(function() {
		console.log("Requisição finalizada.");
	});
}

// Converte latitude e longitude para UTM.
function convertToUtm(locale) {
	return proj4(wgs84, utm, [locale.lng(), locale.lat()]);
}

// Converte latitude e longitude para UTM.
function convertLtdLgtToUtm(baseX, baseY) {
	return proj4(wgs84, utm, [baseX, baseY]);
}

// Converte UTM para latitude e longitude.
function convertUtmToLtdLgt(baseX, baseY) {
	return proj4(utm2, wgs84, [baseX, baseY]);
}

// Adiciona um marcador à aplicação.
function addMarkerToMap(map, latlng) {
	var marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		center: latlng,
		draggable: false,
		map: map,
		title: "Você está aqui!"
	});
	marker.setMap(map);
}

function getPoints(position) {
	var velocidade, points = [],
		baseUtmConvert;

	for (var x = 0; x <= positions.length; x++) {
		if (typeof positions[x] !== 'undefined') {
			position = positions[x].position;
			velocidade = positions[x].meanVelocity;

			baseUtm[0] = (position.x * 10) + 310232.1497480576;
			baseUtm[1] = (position.y * 10) + 7366015.442552164;

			baseUtmConvert = convertUtmToLtdLgt(baseUtm[0], baseUtm[1]);
			points.push({
				location: new google.maps.LatLng(baseUtmConvert[1], baseUtmConvert[0]),
				weight: 100 - velocidade
			});
		}
	}

	return points;
}