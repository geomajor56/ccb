var map, geojsonLayer, thisStation, markers, mystation;
$(document).ready(function () {

    //TODO need to put all functions in one place goddamit!!

    /*   ================================   Splash Screen  ============================*/
    if ($.cookie('modal_shown') == null) {
        $.cookie('modal_shown', 'yes', { expires: 7, path: '/' });
        $('#myModal').modal({
            keyboard: false
        });
    }
    /*   ================================    Functions   ============================*/
    $('#action').click(function () {
        $('#map-content').hide();
        $('#water-parameters-container').show();
        $("wp").scrollspy();
    });

    function handleJson(data) { //TODO need to work on popup, no hover, click, and add onclick link inside of popup
        var geojsonLayer = L.geoJson(data, {
            onEachFeature: onEachFeature //function (feature, layer) {
                //layer.bindPopup(feature.properties.station_name);
                //layer.on({
                 //   mouseover: highlightFeature
                    //click: temp  //makeCharts
                //});
            //}
        });

        markers.addLayer(geojsonLayer);
        map.addLayer(markers);
    }

    /*function highlightFeature(e) {
        layer = e.target;
        thisStation = e.target.feature.properties.station_name;
        var link = '<a href="#" id="getInfo">TestLink</a>'
        layer.bindPopup('Statsdfion: ' + thisStation + '<br>' + link);//.openPopup();
        //layer.bindPopup('Station: ' + thisStation + '<br>' + '<button class="btn btn-small btn-danger" id="getInfo" type="button">Station Data</button>').openPopup();
    }*/

    $("#back-to-map").click(function () {//TODO disable on ...
        $('#container1').hide();
        $('#container2').hide();
        $('#container3').hide();
        $('#map').show();
    });

    $("#zoom-out-cape").click(function () {//TODO disable on ...
        map.fitBounds(bounds);
    });

    function doIt(){
        alert("Hey MotherFuckers");
    }


    function highlightFeature(e) {
        var layer = e.target;

//              if (!L.Browser.ie && !L.Browser.opera) {
//            layer.bringToFront();
//        }

        info.update(layer.feature.properties);
    }




    function onEachFeature(feature, layer) {
			if (feature.properties) {
            	layer.bindPopup(feature.properties.station_name);
          	}
			layer.on({
				mouseover: highlightFeature,
				click: doIt
			});
		}

    /*   ================================LeafLet Map and Popups   ============================*/

    var southWest = L.LatLng(41.39741506646461, -71.25320434570312);
    var northEast = L.LatLng(42.134894984239224, -69.64645385742188);
    var bounds = L.LatLngBounds(southWest, northEast);

    map = L.map('map', {
        maxBounds: bounds,
        zoomControl: true
    }).setView([41.7672146942102, -70.35232543945312], 10);

    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 10,
        maxZoom: 17,
        attribution: osmAttrib
    });

    var defaultLayer = L.tileLayer.provider('Nokia.satelliteNoLabelsDay', {minZoom: 10, maxZoom: 17}).addTo(map);

    var cloudmadeURL = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/{styleId}/256/{z}/{x}/{y}.png';
    var nightTime = L.tileLayer(cloudmadeURL, {
        minZoom: 0,
        maxZoom: 17,
        styleId: 999
    });

    var baseLayers = {
        "OpenStreetMap Default": osm,
        "Nokia Satellite": defaultLayer
    };

    //L.control.layers(baseLayers).addTo(map);


    var miniMap = new L.Control.MiniMap(nightTime, {
        position: 'bottomleft',
        width: 200,
        height: 200,
        toggleDisplay: true
    }).addTo(map);

    L.control.coordinates().addTo(map);


    var markers = new L.MarkerClusterGroup({
        maxClusterRadius: 25,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 3,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
/*  ====================    mcBrides Info Panel   ==========================================  */
    // control that shows state info on hover
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Station Info</h4>' + (props ?
                 "Station Name: " + '<b>' +  props.station_name + '</b><br />' + "Station Type: " +  '<b>' + props.station_type + '</b>' : 'Hover over a Marker');
    };

    info.addTo(map);


    /*  ===========================    GeoServer request  for station points  =============================*/

    var rootUrl = 'http://tomcat.capecodgis.com/geoserver/capecodgis/ows';

    var defaultParameters = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'capecodgis:monitor_station',
        maxFeatures: 200,
        outputFormat: 'text/javascript',
        format_options: 'callback: getJson'

    };

    var parameters = L.Util.extend(defaultParameters);

    $.ajax({
        url: rootUrl + L.Util.getParamString(parameters),
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: handleJson
    });


    /*  ===========================    HighCharts   =============================*/


    function makeCharts(e) { //TODO too many arbitrary parameters in my functions, could be trouble
        console.log(mystation);
        $('#map').hide();
        $('#container1').show();//TODO there has to be a more efficient way with jquery
        $('#container2').show();
        $('#container3').show();
        $('#container4').show();

        var layer = e.target;
        thisStation = e.target.feature.properties.station_name;
        mystation = e.target.feature.id.split(".")[1];

        /*  =================================================================================================  */

        var temperature = [];
        var salinity = [];
        var dissolved_oxygen = [];
        var nitrogen = [];
        var phosphates = [];
        var ammonium = [];
        var total_nitrogen = [];
        var total_phosphorus = [];
        var chlorophyll = [];
        var pheophytin = [];
        var turbidity = [];


        /*$.ajax({
         type: "POST",
         url: "../php/get_station_data.php",
         password: 'Wyliepup1',
         data: {
         "station_num_id": mystation
         },
         dataType: 'json',
         error: function (xhr, ajaxOptions, thrownError) {
         alert(xhr.status);
         alert(thrownError);
         },
         success: chartParser
         });*/

        function chartParser(data) {
            $('#map-content').hide();//TODO again, a function with before, present, after (situation) parameter
            $('#chart-content').show();

            for (var i = 0; i < data.length; i++) {
                sampleDate = data[i][0]; // in milliseconds for Highcharts
                d = new Date(data[i][0]);
                sampleYear = d.getFullYear();
                temperature.push([sampleDate, data[i][1]]);
                salinity.push([sampleDate, data[i][2]]);
                dissolved_oxygen.push([sampleDate, data[i][3]]);
                nitrogen.push([sampleDate, data[i][4]]);
                phosphates.push([sampleDate, data[i][5]]);
                ammonium.push([sampleDate, data[i][6]]);
                total_nitrogen.push([sampleDate, data[i][7]]);
                total_phosphorus.push([sampleDate, data[i][8]]);
                chlorophyll.push([sampleDate, data[i][9]]);
                pheophytin.push([sampleDate, data[i][10]]);
                turbidity.push([sampleDate, data[i][11]]);

            }

//            var chart1 = new Highcharts.Chart(chart1_options);//TODO this could be smoother
//            var chart2 = new Highcharts.Chart(chart2_options);
//            var chart3 = new Highcharts.Chart(chart3_options);
//            var chart4 = new Highcharts.Chart(chart4_options);
        }

        var chart1_options = {// TODO combine all commonalities into plotOptions() real fuckin soon
            //TODO lose title, put legend up top, need vertical space

            chart: {
                height: 250,
                renderTo: 'container1',
                zoomType: 'x'
            },

            title: {
                text: 'Temperature, Salinity, Dissolved Oxygen for Station: ' + thisStation
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                }

            },
            yAxis: [
                {// Primary yAxis
                    labels: {
                        formatter: function () {
                            return this.value + '°C';
                        },
                        style: {
                            color: '#89A54E'
                        }
                    },
                    title: {
                        text: 'Temperature',
                        style: {
                            color: '#89A54E'
                        }
                    },
                    opposite: true

                },
                {// Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Dissolved Oxygen',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' mg/L';
                        },
                        style: {
                            color: '#4572A7'
                        }
                    }

                },
                {// Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Salinity',
                        style: {
                            color: '#AA4643'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ppt';
                        },
                        style: {
                            color: '#AA4643'
                        }
                    },
                    opposite: true
                }
            ],
            tooltip: {
                shared: true
            },
            series: [
                {
                    name: 'Temperature',
                    color: '#89A54E',
                    type: 'area',
                    data: temperature,
                    tooltip: {
                        valueSuffix: ' °C'
                    },
                    marker: {
                        enabled: false
                    }
                    //dashStyle: 'shortdot'
                },
                {

                    name: 'Dissolved Oxygen',
                    color: '#4572A7',
                    type: 'line',
                    yAxis: 1,

                    data: dissolved_oxygen,
                    tooltip: {
                        valueSuffix: ' mg/L'
                    },
                    marker: {
                        enabled: false
                    }
                    //dashStyle: 'shortdot'
                },
                {
                    name: 'Salinity',
                    type: 'line',
                    color: '#AA4643',
                    yAxis: 2,
                    data: salinity,
                    tooltip: {
                        valueSuffix: ' ppt'
                    },

                    marker: {
                        enabled: false
                    }
                    //dashStyle: 'shortdot'

                }

            ]
        };
        var chart2_options = {

            chart: {
                height: 250,
                renderTo: 'container2',
                type: 'line',
                zoomType: 'x'
            },

            title: {
                text: 'Nitrates/Nitrites, Ortho-Phosphates, Ammonium for Station: ' + thisStation
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                }

            },
            yAxis: [
                {// Primary yAxis
                    labels: {
                        formatter: function () {
                            return this.value + 'um';
                        },
                        style: {
                            color: '#89A54E'
                        }
                    },
                    title: {
                        text: 'Nitrates/Nitrites',
                        style: {
                            color: '#89A54E'
                        }
                    },
                    opposite: true

                },
                {// Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Ortho-Phosphates',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' um';
                        },
                        style: {
                            color: '#4572A7'
                        }
                    }

                },
                {// Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Ammonium',
                        style: {
                            color: '#AA4643'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' um';
                        },
                        style: {
                            color: '#AA4643'
                        }
                    },
                    opposite: true
                }
            ],
            tooltip: {
                shared: true
            },

            series: [
                {
                    name: 'Nitrates/Nitrites',
                    color: '#89A54E',
                    type: 'line',
                    data: nitrogen,
                    tooltip: {
                        valueSuffix: ' um'
                    },
                    marker: {
                        enabled: false
                    }
                    //dashStyle: 'shortdot'
                },
                {
                    name: 'Ortho-Phosphates',
                    type: 'line',
                    color: '',
                    yAxis: 1,
                    data: phosphates,
                    tooltip: {
                        valueSuffix: ' um'
                    },
                    marker: {
                        enabled: false
                    }
                    //dashStyle: 'shortdot'

                },
                {
                    name: 'Ammonium',
                    color: '#AA4643',
                    type: 'line',
                    data: ammonium,
                    tooltip: {
                        valueSuffix: ' um'
                    },
                    yAxis: 2,
                    marker: {
                        enabled: false
                    }

                }
            ]
        };
        var chart3_options = {

            chart: {
                height: 250,
                type: 'line',
                renderTo: 'container3',
                zoomType: 'x'
            },
            title: {
                text: 'Total Nitrogen and Phosphorus for Station: ' + thisStation
            },

            xAxis: [
                {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        year: '%Y'
                    }
                }
            ],
            yAxis: [
                {// Primary yAxis
                    labels: {
                        format: '{value}um',
                        style: {
                            color: '#89A54E'
                        }
                    },
                    title: {
                        text: 'Total Nitrogen',
                        style: {
                            color: '#89A54E'
                        }
                    }
                },
                {// Secondary yAxis
                    title: {
                        text: 'Total Phosphorus',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        format: '{value} um',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    opposite: true
                }
            ],
            tooltip: {
                shared: true
            },

            series: [
                {
                    name: 'Total Nitrogen',
                    color: '#4572A7',

                    yAxis: 1,
                    data: total_nitrogen,
                    tooltip: {
                        valueSuffix: ' um'
                    },
                    marker: {
                        enabled: false
                    }

                },
                {
                    name: 'Total Phosphorus',
                    color: '#89A54E',

                    data: total_phosphorus,
                    tooltip: {
                        valueSuffix: ' um'
                    },
                    marker: {
                        enabled: false
                    }
                }
            ]
        };
        var chart4_options = {

            chart: {
                height: 250,
                type: 'line',
                renderTo: 'container4',
                zoomType: 'x'
            },
            title: {
                text: 'Chlorophyll, Pheophytin, and Turbidity for Station: ' + thisStation
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                }

            },
            yAxis: [
                {// Primary yAxis
                    title: {
                        text: 'Turbidity',
                        style: {
                            color: '#89A54E'
                        }
                    },


                    labels: {
                        formatter: function () {
                            return this.value + ' NTU';
                        },
                        style: {
                            color: '#89A54E'
                        }
                    }



                },
                {// Secondary yAxis
                    title: {
                        text: 'Chlorophyll',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ug/L';
                        },
                        style: {
                            color: '#4572A7'
                        }
                    },
                    opposite: true
                },

                {// Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Pheophytin',
                        style: {
                            color: '#AA4643'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ug/L';
                        },
                        style: {
                            color: '#AA4643'
                        }
                    },
                    opposite: true

                }
            ],
            tooltip: {
                shared: true
            },

            series: [
                {
                    name: 'Turbidity',
                    color: '#F2B40C',
                    data: turbidity,
                    type: 'area',
                    yAxis: 1,
                    marker: {
                        enabled: false
                    },
                    tooltip: {
                        valueSuffix: ' NTU'
                    }
                },
                {
                    name: 'Pheophytin',
                    color: '#4572A7',
                    yAxis: 2,
                    data: pheophytin,
                    marker: {
                        enabled: false
                    },
                    tooltip: {
                        valueSuffix: ' ug/L'
                    }

                },
                {
                    name: 'Chlorophyll',
                    color: '#89A54E',
                    yaxis: 2,
                    data: chlorophyll,
                    marker: {
                        enabled: false
                    },
                    tooltip: {
                        valueSuffix: ' ug/L'
                    }
                }

            ]
        };

        /*  =================================================================================================  */

    }

});