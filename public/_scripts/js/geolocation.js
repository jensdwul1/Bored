
var Googlemap;

var currentMarker;

var locationCurrent;

var locGhent = new google.maps.LatLng(51.05865,3.763161);



function display(){
		 var myOptions = {
	    	zoom: 13,
	    	center: locGhent,
	   	 	mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			zoomControl: true,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}
	  	}
		Googlemap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                window.Googlemap = Googlemap;
		
		
}

function getGeolocation(){
		if(Modernizr.geolocation)
		{
			console.log('geolocation works');
			navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError);
		}
		else
		{
			
			var geocoder = new google.maps.Geocoder()
			if(google.loader.ClientLocation != null)
			{
				locationCurrent = new google.maps.LatLng(google.loader.ClientLocation.latitude,google.loader.ClientLocation.longitude);
				renderMap();	
			}
			else{
				locationCurrent = new google.maps.LatLng(geoip_latitude(),geoip_longitude());
				renderMap();
			}

		}
}

function geoLocationSuccess(position){
	locationCurrent = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	renderMap();
	
}

function geoLocationError(err){
	locationCurrent = locGhent;
	renderMap();
}

function renderMap(){
	
	
		zoomin = 11;
	
	
	
	Googlemap.setZoom(zoomin);
	
	

	if(locationCurrent != locGhent)
	{
		currentMarker = new google.maps.Marker({
			position: locationCurrent, 
			map: Googlemap, 
			title:'You are currently at this location'
		});
		currentMarker.setAnimation(google.maps.Animation.DROP);
		google.maps.event.addListener(currentMarker, 'click', function() {
				Googlemap.panTo(locationCurrent);
			});
		
	}
		
}

$(document).ready(function(){
	display();
	getGeolocation();
});

	