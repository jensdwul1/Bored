/* 
 * funspots.JS
 * 
 * Author Jens De Wulf <jdw.jensdewulf@gmail.com>
 * Based on P.De Pauw Shitty Places 
 *
 */
/* CONFIG */
var _datasets = {
	"title": "Datasets Bored",
	"author": "Jens De Wulf",
	"wijken":{
		"url": "http://datatank.gent.be/Grondgebied/Wijken.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"parken":{
		"url": "http://datatank.gent.be/MilieuEnNatuur/Parken.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"bibliotheken":{
		"url": "http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Bibliotheek.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"sportcentra":{
		"url": "http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Sportcentra.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"bioscopen":{
		"url": "http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Bioscopen.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"talentpunten":{
		"url": "http://datatank.gent.be/Infrastructuur/DigitaalTalentpunten.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"speelterreinen":{
		"url": "http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Speelterreinen.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"visplaatsen":{
		"url": "http://datatank.gent.be/Cultuur-Sport-VrijeTijd/VisplaatsenHavenGent.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"hotspots":{
		"url": "http://datatank.gent.be/Toerisme/VisitGentSpots.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	},
	"hotspotsUren":{
		"url": "http://datatank.gent.be/Toerisme/VisitGentOpeningsuren.json",
		"jsondata": null,
		"lastupdated":null,
		"updatefreq":1440//hours
	}
};
/* VARIABLES */
var _datasets;
var _googlemap;
var _markers = [];
var _goolemapmarkerimage_youarehere;
var _goolemapmarkerimage_dogshit;
var _mygeoposition;
var _amountofdogtoiletsinghent = 0;
var _currentGeoPositionGoogleMapMarker;

/* SAVE TO LOCALSTORAGE */
function saveToLocalStorage(key, value){
	if(Modernizr.localstorage){
		localStorage.setItem(key, value);
	}
}
function getFromLocalStorage(key){
	if(Modernizr.localstorage){
		return localStorage.getItem(key);
	}
	return null;
}

/* SAVE DATASETS */
function saveGhentShittyPlaces(){	
	saveToLocalStorage("bored-datasets", JSON.stringify(_datasets));
}

/* FUNCTION loadDataHondenToiletten */
function loadDataHondenToiletten(){
	var loadAgain = true;
	if(_datasets != null && _datasets.hondentoiletten.lastupdated != null){
		var now = new Date();
		var diff = now.getTime() - _datasets.hondentoiletten.lastupdated;
		if(diff <= _datasets.hondentoiletten.updatefreq*3600*1000){
			loadAgain = false;
		}
	}

	if(loadAgain){
		$.ajax({
			type:"GET",
			url: _datasets.hondentoiletten.url,
			dataType: "jsonp",
			cache: false,
			contenttype: "application/json",
			success:function(data){
				if(data != null && data["hondentoiletten"] != null){
					//ADD TO REPOSITORY
					_datasets.hondentoiletten.jsondata = data;
					_datasets.hondentoiletten.lastupdated = new Date().getTime();
					saveGhentShittyPlaces();
					//CURRENT WORKING VARIABLE
					_hondentoiletten = data["hondentoiletten"];
					//CREATE NAVIGATION
					createHondenToilettenNav();
					//VISUALIZE HONDENTOILETTEN
					visualizeHondenToiletten();
				}
			}
		});
	}else{
		_hondentoiletten = _datasets.hondentoiletten.jsondata["hondentoiletten"];
		//CREATE NAVIGATION
		createHondenToilettenNav();
		//SORT ON WIJK RONDE
		sortHondenToiletten("wijk_ronde", "ASC");
		//VISUALIZE HONDENTOILETTEN
		visualizeHondenToiletten();
	}
}

/* CREATE NAVIGATION FOR HONDENTOILETTEN */
function createHondenToilettenNav(){
	//SET AMOUNT
	_amountofdogtoiletsinghent = _hondentoiletten.length;
	var content="";
	//ADD SORTING, FILTERING
	content += ""
	+ "<ul class=\"list-nav clearfix\">"
	+ "<li class=\"hondentoiletten-amount\">" + _hondentoiletten.length + "</li>"
	+ "<li class=\"nav-item\" data-sort=\"straat\">Straat</li>"
	+ "<li class=\"nav-item\" data-sort=\"wijk_ronde\">Wijk</li>"
	+ "<li class=\"nav-item\" data-sort=\"code\">Code</li>"
	+ "<li class=\"nav-item\" data-sort=\"fid\">FID</li>"
	+ "</ul>";
	$("#hondentoiletten-nav").append(content);

	$('.list-nav li[data-sort="straat"]').click(function(ev){
			sortHondenToiletten("straat", "ASC");		
	});
	$('.list-nav li[data-sort="wijk_ronde"]').click(function(ev){
			sortHondenToiletten("wijk_ronde", "ASC");		
	});
	$('.list-nav li[data-sort="code"]').click(function(ev){
			sortHondenToiletten("code", "ASC");		
	});
	$('.list-nav li[data-sort="fid"]').click(function(ev){
			sortHondenToiletten("fid", "ASC");		
	});
}

/* FUNCTION VISUALIZE HONDENTOILETTEN */
function visualizeHondenToiletten(){
	//CLEAR ALL
	$("#hondentoiletten").html("");		
	var content="";
	content += "<ul>";
	$.each(_hondentoiletten, function(key, value){
		content += "<li class=\"hondentoilet\" data-code=\"" + value.code + "\" data-fid=\"" + value.fid + "\">"
		+ "<h1>" + value.plaats + " </h1>"
		+ "<ul class=\"information clearfix\">"
		+ "<li class=\"district\">" + value.wijk_ronde + "</li>"					
		+ "<li class=\"long\">" + parseFloat(value.long).toFixed(8) + "</li>"
		+ "<li class=\"lat\">" + parseFloat(value.lat).toFixed(8) + "</li>"
		+ "<li class=\"year\">"+ value.jaar + "</li>"
		+ "</ul>"
		+ "</li>";						
	});
	content += "</ul>";
	$("#hondentoiletten").append(content);
	//ANIMATION ITERATION
	setTimeout(markersAnimationIteration, 500);
	//REGISTER CLICK HANDLERS ON HONDENTOILET
	$(".hondentoilet").click(function(ev){
		//GET DATA-FID
		var fid = $(this).attr("data-fid");
		//GET OBJECT FROM LIST: _hondentoiletten
		var objects = getObjects(_hondentoiletten, "fid", fid);
		if(objects != null){
			var hondentoilet = objects[0];
			//ADD MARKER ON GOOGLE MAPS
			gotoMarkerOnGoogleMaps(hondentoilet.long, hondentoilet.lat);
			//SCROLL TO MAPS
			scrollToMaps();
		}					
	});	
}
/* MARKERS ANIMATION ITERATION */
var animationIteration = 0;
function markersAnimationIteration(){
	var hondentoilet = _hondentoiletten[animationIteration];
	addMarkerOnGoogleMaps(hondentoilet.plaats, hondentoilet.long, hondentoilet.lat);					
	if(animationIteration + 1 < _hondentoiletten.length){
		setTimeout(markersAnimationIteration, 10);
		animationIteration++;
	}
}
/* FUNCTION SEARCH FOR OBJECT WITH RECURSION */
function getObjects(jsonData, key, value){
	var objects = [];
	$.each(jsonData, function(i, v){
		if(v[key] == value)
			objects.push(v);
	})
	return objects;
}
/* FUNCTION FOR SORTING */
function sortHondenToiletten(prop, order){ 
	switch(prop){
		case "plaats":
			_hondentoiletten.sort(function (a, b) {
    			a = a.plaats;
    			b = b.plaats;
    			return a.localeCompare(b);
			});
			break;
		case "wijk_ronde":
			_hondentoiletten.sort(function (a, b) {
    			a = a.wijk_ronde;
    			b = b.wijk_ronde;
    			return a.localeCompare(b);
			});
			break;
		case "fid":
			_hondentoiletten.sort(function (a, b) {
    			a = a.fid;
    			b = b.fid;
    			return a.localeCompare(b);
			});
			break;
		case "code":
			_hondentoiletten.sort(function (a, b) {
    			a = a.code;
    			b = b.code;
    			return a.localeCompare(b);
			});
			break;
		default:
			_hondentoiletten.sort(function (a, b) {
    			a = a.plaats;
    			b = b.plaats;
    			return a.localeCompare(b);
			});
			break;
	} 
	//VISUALIZE HONDENTOILETTEN
	visualizeHondenToiletten();
};
/* FUNCTION INITALIZE GOOGLE MAPS */
function initializeGoogleMaps(){
	//PRE. YOU ARE HERE IMAGE
    _goolemapmarkerimage_youarehere = new google.maps.MarkerImage('_styles/assets/images/maps_yah.png',
        new google.maps.Size(32, 37),
        new google.maps.Point(0,0),
        new google.maps.Point(16, 37)
    );
    //PRE. DOG SHIT
    _goolemapmarkerimage_dogshit = new google.maps.MarkerImage('_styles/assets/images/maps_dogshit.png',
        new google.maps.Size(32, 37),
        new google.maps.Point(0,0),
        new google.maps.Point(16, 37)
    );
    //INFOWINDOW
    _infoWindow = new google.maps.InfoWindow({
    	content: "SLA",
    	position: new google.maps.LatLng(51.054398, 3.725224)
    });
	//1. CREATE MAPOPTIONS
	var mapOptions = {
		zoom: 14,
		center: new google.maps.LatLng(51.054398, 3.725224),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	//2. CREATE GOOGLE MAPS
	_googlemap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	google.maps.event.addListenerOnce(_googlemap, 'bounds_changed', function(){
		//3. GET GEOLOCATION
		getGeoLocation();
	});
}
/* FUNCTION TO ADD MARKER BASED ON TITLE, LONG AND LAT */
function addMarkerOnGoogleMaps(title, long, lat){
	if(_googlemap != null){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, long),
			map:_googlemap,
			title: title,
			icon: _goolemapmarkerimage_dogshit,
			content: title
		});
		google.maps.event.addListener(marker, 'click', function(){
			_infoWindow.setContent(this.content);
			_infoWindow.open(_googlemap, this);
		});
		_markers.push(marker);
	}
}
/* FUNCTION TO ADD MARKER BASED ON TITLE, LONG AND LAT */
function gotoMarkerOnGoogleMaps(long, lat){
	if(_googlemap != null){
		var match = false;
		var i = 0;
		while(!match && i < _markers.length){
			var marker = _markers[i];
			var mlat = parseFloat(marker.position.lat()).toFixed(8);
			var mlng = parseFloat(marker.position.lng()).toFixed(8);
			var clat = parseFloat(lat).toFixed(8);
			var clng = parseFloat(long).toFixed(8);
			if(mlat == clat && mlng == clng){
				match = true;
			}else{
				i++;
			}
		}
		if(match){
			var marker = _markers[i];
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function(){marker.setAnimation(null);}, 1966);
			_googlemap.setCenter(marker.getPosition());
		}
	}
}
/* FUNCTION TO GET CURRENT GEOLOCATION */
function getGeoLocation(){
	if(Modernizr.geolocation){
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true});
	}else{
		geoFallBack();
	}
}
function geoSuccess(position){
	var coordinates = position.coords;
	_currentGeoPositionGoogleMapMarker = new google.maps.Marker({
		position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
		map:_googlemap,
		title: "My Current Position",
		icon: _goolemapmarkerimage_youarehere
	})
	_currentGeoPositionGoogleMapMarker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function(){_currentGeoPositionGoogleMapMarker.setAnimation(null);}, 1966);
	_googlemap.setCenter(_currentGeoPositionGoogleMapMarker.getPosition());
}
function geoError(error){
	switch(error.code){
		//TIMEOUT
		case 3:
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
			break;
		//POSITION UNAVAILABLE
		case 2:
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
			break;
		//PERMISSION DENIED --> FALLBACK
		case 1:
			geoFallBack();
			break;
		default:
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
			break;
	};
}
function geoFallBack(){

}
function geoDistanceCalculator(myposition, targetposition){
	
}
/* FUNCTION SCROLL TO TOP */
function scrollToTop(){
	$('html, body').animate({scrollTop:0},600);
}
/* FUNCTION SCROLL TO TOP */
function scrollToMaps(){
	$('html, body').animate({scrollTop:$("#map-canvas").scrollTop()},600);
}
/* FUNCTION CHANGE UI */
function changeLayoutUI(){
	var h = $(window).height();
	var w = $(window).width();

	if(w <= 768){
		$('#map-canvas').height(280);
	}else{
		var offy = $('#map-canvas').parent().offset().top;
		$('#map-canvas').height(h - offy - 36);
	}
}
/* SELF EXECUTING METHOD */
(function(){
		//ONRESIZE WINDOW
		$(window).resize(function() {
			changeLayoutUI();
		});
		changeLayoutUI();
		//GET DATA FROM LOCALSTORAGE IF POSSIBLE
		var localStorageData = getFromLocalStorage("drdynscript_ghent_shittyplaces");
		if(localStorageData != null){			
			_datasets = JSON.parse(localStorageData);
		}
		//PRE. SETTING PROPERTIES AND LISTENERS
		$(window).scroll(function(){
			if($(this).scrollTop() > 100){
				$(".scrolltotop").fadeIn();
			}else{
				$(".scrolltotop").fadeOut();
			}
		})
		$(".scrolltotop").click(function(){
			scrollToTop();
			return false;
		})
		//1. INITALIZE GOOGLE MAPS
		initializeGoogleMaps();
		//2. LOAD HONDENTOIELETTEN DATA
		loadDataHondenToiletten();		
}(window))