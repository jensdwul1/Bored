var Googlemap;
var data;
var markers = [];
var wijken = [];
var latlngs = [];
$(document).ready(function(){
    
})

function getData(el){
    var url = window.location.pathname;
    url = url.substring(0, url.length-1);
    var tags = url.split('/');
    console.log("functioning");
    console.log(tags);
    if (tags[tags.length-1] == "public") {
        
       
        
        switch (el) {
             case 1:
                    parseJson("http://datatank.gent.be/Grondgebied/Wijken.json");
                break;
			case 2:
                    parseJson("http://datatank.gent.be/MilieuEnNatuur/Parken.json");
                break;
			case 3:
                    parseJson("http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Bibliotheek.json");
                break;
            case 4:
                    parseJson("http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Sportcentra.json");
                break;
            case 5:
                    parseJson("http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Bioscopen.json");
                break;
            case 6:
                    parseJson("http://datatank.gent.be/Infrastructuur/DigitaalTalentpunten.json");
                break;
            case 7:
                    parseJson("http://datatank.gent.be/Cultuur-Sport-VrijeTijd/Speelterreinen.json");
                break;
            case 8:
                    parseJson("http://datatank.gent.be/Cultuur-Sport-VrijeTijd/VisplaatsenHavenGent.json");
                break;
            case 9:
                    parseJson("http://datatank.gent.be/Toerisme/VisitGentOpeningsuren.json");
                break;
            case 10:
                    parseJson("http://datatank.gent.be/Toerisme/VisitGentSpots.json");
                break;
            
            default:
                break;
        }

    
    }
}

function parseJson(url){
    var s = document.createElement('script');
    s.setAttribute('type','text/javascript');
    s.setAttribute('src',url+"?callback=parse");
    var b = document.getElementsByTagName('body')[0];
    b.appendChild(s);
}
function parse(data)
{
    Googlemap = window.Googlemap;
    data = data;
    
    if (data.Wijken) {
        console.log('Wijken');
        parseHoods(data.Wijken);
    }
    if (data.Parken) {
        console.log('Parken');
        parseParks(data.Parken);
    }
    if (data.Bibliotheek) {
        console.log('Bibliotheek');
        parseLibrary(data.Bibliotheek);
    }
    if (data.Sportcentra) {
        console.log('Sportcentra');
 		parseSports(data.Sportcentra);

    }
    if (data.Bioscopen) {
        console.log('Bioscopen');
         parseTheaters(data.Bioscopen);
    }
    if (data.DigitaalTalentpunten) {
        console.log('DigitaalTalentpunten');
        parseTalent(data.DigitaalTalentpunten);
    }
    if (data.Speelterreinen) {
        console.log('Speelterreinen');
        parsePlaygrounds(data.Speelterreinen);
    }
    if (data.VisplaatsenHavenGent) {
        console.log('VisplaatsenHavenGent');
        parseFish(data.VisplaatsenHavenGent);
    }
    if (data.VisitGentSpots) {
        console.log('VisitGentSpots'); 
        parseHotspots(data.VisitGentSpots);
    }
    if (data.VisitGentOpeningsuren) {
        console.log('VisitGentOpeningsuren');
        parseHotspotshours(data.VisitGentOpeningsuren);
    }
}

function clearMap(){
    for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
    for (var i = 0; i < wijken.length; i++ ) {
    wijken[i].setMap(null);
  }
}

function parseParks(parks)
{
    clearMap();
    markers =[];
    console.log(parks);
    $.each(parks, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.adres + " " + value.huisnr
        })
        markers.push(m);
    })
    
}
function parseLibrary(libraries)
{
    clearMap();
    markers =[];
    console.log(libraries);
    $.each(libraries, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.roepnaam + ": " + value.straat
        })
        markers.push(m);
    })
    
    
}
function parseSports(sports)
{
    clearMap();
    markers =[];
    console.log(sports);
    $.each(sports, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.naamgzc + ": " + value.adres
        })
        markers.push(m);
    })
    
    
}
function parseTheaters(theaters)
{
    clearMap();
    markers =[];
    console.log(cinemas);
    $.each(cinemas, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.naam
        })
        markers.push(m);
    })
    
    
}
function parseHoods(hoods)
{
    clearMap();
    markers =[];
    console.log(sth);
    $.each(sth, function(key,value){
        var c = value.coords;
        var d = c.split(' ');
        latlngs = [];
        $.each(d, function(k,v){
            var q = v.split(',');
            var latlng = new google.maps.LatLng(q[1],q[0]);
            latlngs.push(latlng);
        })
        
        var z = new google.maps.Polygon({
            paths: latlngs,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            name: hoods.hood_na
          });

 z.setMap(Googlemap);
 wijken.push(z);

    })    
}
function parseTalent(talents)
{
    clearMap();
    markers =[];
    console.log(parkings);
    $.each(parkings, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.nr_p + ": " + value.naam
        })
        markers.push(m);
    })
    
    
}
function parseHotspots(hotspots)
{
    clearMap();
    markers =[];
    console.log(schools);
    $.each(schools, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.naam + ": " + value.adres
        })
        markers.push(m);
    })
    
    
}
function parseFish(fishs)
{
    clearMap();
    markers =[];
    console.log(centra);
    $.each(centra, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.naamgzc + ": " + value.adres
        })
        markers.push(m);
    })
    
    
}
function parsePlaygrounds(playgrounds)
{
    clearMap();
    markers =[];
    console.log(libs);
    $.each(libs, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.afdeling + ": " + value.locatie
        })
        markers.push(m);
    })
    
    
}
function parseHotspotshours(hours)
{
    clearMap();
    markers =[];
    console.log(hours);
    $.each(hours, function(key,value){
        var m = new google.maps.Marker({
            position: new google.maps.LatLng(value.lat,value.long), 
            map: Googlemap, 
            title: value.naam + ": " + value.adres
        })
        markers.push(m);
    })
    
    
}

