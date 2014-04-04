/* global L */
/*   ================================   Splash Screen  ============================*/
if ($.cookie('modal_shown') === null) {
    $.cookie('modal_shown', 'yes', { expires: 7, path: '/' });
    $('#myModal').modal({
        keyboard: false
    });
}
var L, map, thisStation, mystation;
$(document).ready(function () {


    /*   ================================    Functions   ============================*/
    $('#action').click(function () {
        $('#map-content').hide();
        $('#water-parameters-container').show();
        $("wp").scrollspy();
    });


    var flaskIcon = L.MakiMarkers.icon({icon: "chemist", color: "#09962F", size: "s"});

    var info = L.control();

    function highlightFeature(e) {
        var layer = e.target;
        info.update(layer.feature.properties);
    }

    function onEachFeature(feature, layer) {
        //if (feature.properties) {
        //   layer.bindPopup(feature.properties.station_name);
        //}
        layer.on({
            mouseover: highlightFeature,
            click: makeCharts
        });
    }

    function handleJson(data) {
        L.geoJson(data, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: flaskIcon});
            }
        }).addTo(map);
    }


    //var geojsonLayer = L.geoJson(data, {
    //    onEachFeature: onEachFeature
    //});
    // markers.addLayer(geojsonLayer, {icon: testTube});
    // map.addLayer(markers);
    // }

    /*function highlightFeature(e) {
     layer = e.target;
     thisStation = e.target.feature.properties.station_name;
     var link = '<a href="#" id="getInfo">TestLink</a>'
     layer.bindPopup('Statsdfion: ' + thisStation + '<br>' + link);//.openPopup();
     //layer.bindPopup('Station: ' + thisStation + '<br>' + '<button class="btn btn-small btn-danger" id="getInfo" type="button">Station Data</button>').openPopup();
     }*/

    $("#back-to-map").click(function () {
        $('#container1').hide();
        $('#container2').hide();
        $('#container3').hide();
        $('#map').show();
    });


    /*   ================================LeafLet Map and Popups   ============================*/

    var southWest = L.LatLng(41.39741506646461, -71.25320434570312),
        northEast = L.LatLng(42.134894984239224, -69.64645385742188),
        bounds = L.LatLngBounds(southWest, northEast);

    var map = L.map('map', {
        maxBounds: bounds
//        zoomControl: true
    }).setView([41.7672146942102, -70.35232543945312], 10);

    /*   ================================    Base Maps   ============================*/

    var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });


    var Stamen_Watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        subdomains: 'abcd',
        minZoom: 3,
        maxZoom: 16
    });

    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 10,
        maxZoom: 17,
        attribution: osmAttrib
    });

    map.addLayer(Esri_WorldTopoMap)

    var mini = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });
    var miniMap = new L.Control.MiniMap(mini,
        { toggleDisplay: true,
            position: 'bottomleft',
            zoomLevelOffset: -3,
            width: 200,
            height: 200
        }).addTo(map);

    /*   ================================    Leaflet Controls   ============================*/
    L.control.coordinates().addTo(map);
    var viewCenter = new L.Control.ViewCenter();
    map.addControl(viewCenter);


    /*  ====================    mcBrides Info Panel   ==========================================  */

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        //this._div.innerHTML = '<h4>Station Info</h4>' + (props ?
        this._div.innerHTML = (props ?
            "Station Name: " + '<b>' + props.station_name + '</b><br />' + "Station Type: " + '<b>' + props.station_type + '</b>' : 'Hover over a Marker');
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
        //console.log(mystation);
        $('#map').hide();
        $('#container1').show();//TODO there has to be a more efficient way with jquery
        $('#container2').show();
        $('#container3').show();
        $('#container4').show();

        var layer = e.target;
        thisStation = e.target.feature.properties.station_name;
        mystation = '7S'; //e.target.feature.id.split(".")[1];

        /*  =================================================================================================  */

        var temperature = [],
            salinity = [],
            dissolved_oxygen = [],
            nitrogen = [],
            phosphates = [],
            ammonium = [],
            total_nitrogen = [],
            total_phosphorus = [],
            chlorophyll = [],
            pheophytin = [],
            turbidity = [];


        /* $.ajax({
         type: "POST",
         url: "7s.js",
         //password: 'Wyliepup1',
         //data: {
         //"station_num_id": mystation
         //},
         //dataType: 'json',
         error: function (xhr, ajaxOptions, thrownError) {
         alert(xhr.status);
         alert(thrownError);
         },
         success: chartParser
         });*/

        $.getJSON("7s.js", function chartParser(data) {
            var sampleDate, d, sampleYear;
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

            var chart1 = new Highcharts.Chart(chart1_options);//TODO this could be smoother
            var chart2 = new Highcharts.Chart(chart2_options);
            var chart3 = new Highcharts.Chart(chart3_options);
            var chart4 = new Highcharts.Chart(chart4_options);


            $("a.accordion-toggle").click(function () {
                var thisYear = $(this).attr("data-attr");
                chart1.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                chart2.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                chart3.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));
                chart4.xAxis[0].setExtremes(Date.UTC(thisYear, 0, 1), Date.UTC(thisYear, 11, 31));

            });


            /* $('#2006').click(function () {


             });*/
        });


        var chart1_options = {// TODO combine all commonalities into plotOptions() real fuckin soon
            //TODO lose title, put legend up top, need vertical space

            chart: {
                height: 200,
                renderTo: 'container1',
                zoomType: 'x'
            },

            legend: {
                enabled: false
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

                },
                {

                    name: 'Dissolved Oxygen',
                    color: '#4572A7',
                    type: 'spline',
                    yAxis: 1,

                    data: dissolved_oxygen,
                    tooltip: {
                        valueSuffix: ' mg/L'
                    },
                    marker: {
                        enabled: true
                    }

                },
                {
                    name: 'Salinity',
                    type: 'spline',
                    color: '#AA4643',
                    yAxis: 2,
                    data: salinity,
                    tooltip: {
                        valueSuffix: ' ppt'
                    },

                    marker: {
                        enabled: true
                    }

                }

            ]
        };
        var chart2_options = {

            chart: {
                height: 200,
                renderTo: 'container2',
                type: 'spline',
                zoomType: 'x'
            },

            legend: {
                enabled: false
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
                    //gridLineWidth: 0,
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
                        enabled: true
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
                        enabled: true
                    }

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
                        enabled: true
                    }

                }
            ]
        };
        var chart3_options = {

            chart: {
                height: 200,
                type: 'spline',
                renderTo: 'container3',
                zoomType: 'x'
            },

            legend: {
                enabled: false
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
                        enabled: true
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
                        enabled: true
                    }
                }
            ]
        };
        var chart4_options = {

            chart: {
                height: 200,
                type: 'line',
                renderTo: 'container4',
                zoomType: 'x'
            },

            legend: {
                enabled: false
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
                            color: '#ED7842'
                        }
                    },


                    labels: {
                        formatter: function () {
                            return this.value + ' NTU';
                        },
                        style: {
                            color: '#ED7842'
                        }
                    }



                },
                {// Secondary yAxis
                    title: {
                        text: 'Chlorophyll',
                        style: {
                            color: '#556b2f'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ug/L';
                        },
                        style: {
                            color: '#556b2f'
                        }
                    },
                    opposite: true
                },

                {// Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Pheophytin',
                        style: {
                            color: '#8fbc8f'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return this.value + ' ug/L';
                        },
                        style: {
                            color: '#8fbc8f'
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
                    color: '#A0522D ',
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
                    color: '#8fbc8f',
                    yAxis: 2,
                    data: pheophytin,
                    marker: {
                        enabled: true
                    },
                    tooltip: {
                        valueSuffix: ' ug/L'
                    }

                },
                {
                    name: 'Chlorophyll',
                    color: '#556b2f',
                    yaxis: 2,
                    data: chlorophyll,
                    marker: {
                        enabled: true
                    },
                    tooltip: {
                        valueSuffix: ' ug/L'
                    }
                }

            ]
        };
    }

});