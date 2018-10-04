var objIntripperMap = null;
var objIntripperMapLabel = null;
var map = document.getElementById('map');
var objParse = null;
var venueID = 32;
var sessionLogCount = 0;
var logData = null;
var logAccuracy = [];
var goodAccuracyCount = 0;
var okAccuracyCount = 0;
var badAccuracyCount = 0;
var goodAccuracyPercent;
var okAccuracyPercent;
var badAccuracyPercent;

var OPERATION_TYPE_POSITIONING = "positioning";
var OPERATION_TYPE_WAYFINDING_REQUESTED = "wayfinding_requested";
var OPERATION_TYPE_WAYFINDING_COMPLETED = "wayfinding_completed";
var OPERATION_TYPE_WAYFINDING_FAILED = "wayfinding_failed";
var OPERATION_TYPE_PATH_RENDER_STARTED = "path_render_started";
var OPERATION_TYPE_PATH_RENDER_FAILED = "path_render_failed";
var OPERATION_TYPE_PATH_RENDER_COMPLETE = "path_render_complete";
var OPERATION_TYPE_NAVIGATION_STARTED = "navigation_started";
var OPERATION_TYPE_NAVIGATION_REROUTE_DISPLAYED = "navigation_reroute_displayed";
var OPERATION_TYPE_NAVIGATION_SECTION_HIGHLIGHTED = "navigation_section_highlighted";
var OPERATION_TYPE_NAVIGATION_DESTINATION_REACHED = "navigation_destination_reached";
var OPERATION_TYPE_NAVIGATION_EXITED = "navigation_exited";
var OPERATION_TYPE_FLOOR_TRANSITION_STARTED = "floor_transition_started";
var OPERATION_TYPE_FLOOR_TRANSITION_ENDED = "floor_transition_ended";
var OPERATION_TYPE_APP_WENT_IN_BACKGROUND = "screen_went_in_background";
var OPERATION_TYPE_APP_STOPPED = "screen_stopped";
var OPERATION_TYPE_APP_CAME_TO_FOREGROUND = "screen_came_to_foreground";
var OPERATION_TYPE_NAO_CALLBACK = "nao_callback";
var OPERATION_TYPE_LOCATION_CORRECTION = "location_correction";
var OPERATION_TYPE_LOCATION_REQUEST = "location_request";

var forwardFlag = 0, reverseFlag = 0, rangeSelectorFlag = 0, forwardCounter, reverseCounter;
var slideStartValue, slideStopValue;

$(document).ready(function () {
    showLoaderBallAtomLoader();
    //handleVenueId();
    initToast();
    parseinit();
    //loadSessionLog(getSessionId(),0);
    initMap();
});


function handleVenueId() {
    try {
        venueID = localStorage.getItem("venueId") == null ? getVenueId() : parseInt(localStorage.getItem("venueId"));
    }
    catch (exception) { console.log(exception); }

}
function initToast() {
    // toastr.options = {
    //     "containerId":'session-container',
    //     "closeButton": false,
    //     "debug": false,
    //     "newestOnTop": false,
    //     "progressBar": true,
    //     "positionClass": "toast-top-right",
    //     "preventDuplicates": false,
    //     "onclick": null,
    //     "showDuration": "300",
    //     "hideDuration": "1000",
    //     "timeOut": "5000",
    //     "extendedTimeOut": "1000",
    //     "showEasing": "swing",
    //     "hideEasing": "linear",
    //     "showMethod": "fadeIn",
    //     "hideMethod": "fadeOut"
    //   }
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "5000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}

function parseinit() {
    Parse.initialize(constants.parseAppID, constants.parseKey);

    Parse.serverURL = constants.parseServer;
    objParse = Parse.Object.extend("PositioningLog");

}
function getVenueId() {
    var venueID = getParameterByName("venue");

    return venueID;
}
function getSessionId() {
    var sessionID = getParameterByName("session");

    return sessionID;
}
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function handleParseData() {
    sessionLogCount = logData.length;

    // $.each(results, function (index, data) {
    //     var locationobj = data.get("NAOLocation");
    //     if (locationobj != null) {
    //         var lat = locationobj.latitude;
    //         var lng = locationobj.longitude;
    //     }
    //     var logObject;
    //     if (index == 0) {
    //         displayMap = parseInt(data.get("VenueId"));
    //         displayFloor = parseInt(data.get("Floor"));
    //         firstLog = new Object();
    //         firstLog.ActivityType = data.get("OperationType");
    //         firstLog.Location = data.get("NAOLocation");
    //         firstLog.Floor = data.get("Floor");
    //         firstLog.Venue = data.get("VenueId");
    //         firstLog.DeviceID = data.get("DeviceId");
    //         firstLog.Platform = data.get("Platform");
    //         if (data.get("Platform") == "iOS") {
    //             firstLog.TimeStamp = data.get("TimeStamp");
    //         }
    //         else {
    //             firstLog.TimeStamp = data.get("TimeStamp") / 1000;
    //         }
    //         firstLog.DeviceTime = data.get("DeviceTime");
    //         firstLog.Accuracy = data.get("NAOAccuracy");
    //         firstLog.Comment = data.get("Remarks");
    //         firstLog.Device = data.get("Device");
    //         firstLog.App = data.get("App");
    //         firstLog.IAKey = "";//data.get("IAKey");
    //         firstLog.BuildNo = data.get("AppVersion");
    //         var date = new Date(firstLog.TimeStamp * 1000);
    //         console.log(date.toDateString());
    //         var paris = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('YYYY-MM-DD HH:mm');
    //         console.log(paris);
    //     }
    //     if (lat == 0 && lng == 0) {
    //         // do nothing
    //     }
    //     else {
    //         logObject = new Object();
    //         logObject.ActivityType = data.get("OperationType");
    //         logObject.Location = data.get("NAOLocation");
    //         logObject.Floor = data.get("Floor");
    //         logObject.Venue = data.get("VenueId");
    //         logObject.DeviceID = data.get("DeviceId");
    //         logObject.Platform = data.get("Platform");
    //         if (data.get("Platform") == "iOS") {
    //             logObject.TimeStamp = data.get("TimeStamp");
    //         }
    //         else {
    //             logObject.TimeStamp = data.get("TimeStamp") / 1000;
    //         }
    //         logObject.DeviceTime = data.get("DeviceTime");
    //         logObject.Accuracy = data.get("NAOAccuracy");
    //         logObject.Comment = data.get("Remarks");
    //         logObject.Device = data.get("Device");
    //         logObject.NavigationPathDetail = data.get("NavigationPathDetail");
    //         logObject.HighlightedPathIndex = data.get("HighlightedPathIndex");
    //         logObject.HighlightedPathSegment = data.get("HighlightedPathSegment");
    //         logObject.FromLocation = data.get("FromLocation");
    //         logObject.ToLocation = data.get("ToLocation");
    //         logObject.FromFloor = data.get("FromFloor");
    //         logObject.ToFloor = data.get("ToFloor");
    //         firstLog.App = data.get("App");
    //         firstLog.IAKey = "";//data.get("IAKey");
    //         firstLog.BuildNo = data.get("AppVersion");
    //         logData.push(logObject);

    //     }
    // });

    firstLog = new Object();
   
    firstLog = logData[0];
    // var date = new Date(firstLog.TimeStamp * 1000);
    // console.log(date.toDateString());
    // var paris = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('YYYY-MM-DD HH:mm');
    // console.log(paris);
    var initialFloorData = logData.find(isPositioning);
    initialFloor = initialFloorData.Floor == null ? 0 : initialFloorData.Floor;
    objIntripperMap.changeFloor(initialFloor);
    renderSessionInfoOnMap();
    populateSessionInfo();
}
function loadSessionLog(sessionId, start) {
    var accuracy;

    try {
        var query = new Parse.Query(objParse);
        var recordLimit = 1000;
        query.equalTo("SessionId", sessionId);
        query.limit(recordLimit);
        query.skip(recordLimit * start);
        query.find({
            success: function (results) {
                try {
                    if (start == 0) {
                        logData = [];
                    }
                    var logObject;
                    $.each(results, function (index, data) {
                        logObject = new Object();
                        logObject.ActivityType = data.get("OperationType");
                        logObject.Location = data.get("NAOLocation");
                        logObject.Floor = data.get("Floor");
                        logObject.Venue = data.get("VenueId");
                        logObject.DeviceID = data.get("DeviceId");
                        logObject.Platform = data.get("Platform");
                        if (data.get("Platform") == "iOS") {
                            logObject.TimeStamp = data.get("TimeStamp");
                        }
                        else {
                            logObject.TimeStamp = data.get("TimeStamp") / 1000;
                        }
                        logObject.DeviceTime = data.get("DeviceTime");
                        logObject.Accuracy = data.get("NAOAccuracy");
                        logObject.Comment = data.get("Remarks");
                        logObject.Device = data.get("Device");
                        logObject.NavigationPathDetail = data.get("NavigationPathDetail");
                        logObject.HighlightedPathIndex = data.get("HighlightedPathIndex");
                        logObject.HighlightedPathSegment = data.get("HighlightedPathSegment");
                        logObject.FromLocation = data.get("FromLocation");
                        logObject.ToLocation = data.get("ToLocation");
                        logObject.FromFloor = data.get("FromFloor");
                        logObject.ToFloor = data.get("ToFloor");
                        logObject.App = data.get("App");
                        logObject.IAKey = "";//data.get("IAKey");
                        logObject.BuildNo = data.get("AppVersion");
                        logData.push(logObject);
                    });
                    if ($(results).length == 0) {
                        //loadMap(displayFloor);
                        // initMap();
                        
                        handleParseData();
                        // var initialFloorData = logData.find(isPositioning);
                        // initialFloor = initialFloorData.Floor==null?0:initialFloorData.Floor;
                        // renderSessionInfoOnMap();
                        // populateSessionInfo();

                    }
                    else {
                        loadSessionLog(sessionId, start + 1);
                    }
                    
                }
                catch (error) {
                    console.log(error);
                    //alert(error);
                }
            },
            error: function (error) {
                console.log(error);
            }
        });

    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
var initialFloor = 0;
function isPositioning(element) {
    try {
        return element.ActivityType == OPERATION_TYPE_POSITIONING;
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
function isLocationRequest(element) {
    try {
        return element.ActivityType == OPERATION_TYPE_LOCATION_REQUEST;
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}

function populateSessionInfo() {
    var lastLog, nextLog;
    var duration, ttff;
    var sessionName;
    var foundPosition;
    
    try {

        lastLog = logData[logData.length - 1];
        nextLog = logData[0];
        //sessionName = "";//getBuildingName(firstLog.Floor) + ", " + getFloorName(firstLog.Floor);


        // arrPositioning = jQuery.grep(logData, function( n, i ) {
        //     return (n.ActivityType == OPERATION_TYPE_POSITIONING);
        //   });
        // if(arrPositioning.length > 0){
        //     foundPosition = arrPositioning[0];
        // }


        foundPosition = logData.findIndex(isPositioning);
        locatioRequestPosition = logData.findIndex(isLocationRequest);
        duration = Math.round(lastLog.TimeStamp - logData[locatioRequestPosition].TimeStamp);
        ttff = Math.round(logData[foundPosition].TimeStamp - logData[locatioRequestPosition].TimeStamp);
        //document.getElementById("sessionName").innerText = sessionName;
        if (firstLog.Device == null || firstLog.Device == undefined) {
            document.getElementById("device").innerText = "Unknown device";
        }
        else {
            document.getElementById("device").innerText = firstLog.Device;
        }
        document.getElementById("platform").innerText = firstLog.Platform;
        //document.getElementById("sessionDate").innerText = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('YYYY-MM-DD');
        document.getElementById("sessionDate").innerText = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('DD MMM YYYY');
        document.getElementById("statTime").innerText = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('HH:mm:ss') + " Hrs";
        document.getElementById("endTime").innerText = moment(lastLog.TimeStamp * 1000).utcOffset('+0200').format('HH:mm:ss') + " Hrs";
        document.getElementById("sessionDuration").innerText =forHumans(duration);//duration + " seconds";
        document.getElementById("timeToFirstFix").innerText = forHumans(ttff);//ttff + " seconds";
        document.getElementById("deviceId").innerText = firstLog.DeviceID;
        document.getElementById("readingCount").innerText = sessionLogCount; //logData.length;
        document.getElementById("apiKey").innerText = firstLog.IAKey;
        document.getElementById("packageName").innerText = firstLog.App;
        if (firstLog.BuildNo == undefined) {
            document.getElementById("appVersion").innerText = "Unknown";
        }
        else {
            document.getElementById("appVersion").innerText = firstLog.BuildNo;
        }
        /*
        <tr>
                        <th>API Key</th>
                        <td id="apiKey"></td>
                    </tr>
                    <tr>
                        <th>App</th>
                        <td id="packageName"></td>
                    </tr>
                    <tr>
                        <th>App Version</th>
                        <td id="appVersion"></td>
                    </tr>
        */
        goodAccuracyCount = 0;
        okAccuracyCount = 0;
        badAccuracyCount = 0;
        $.each(logData, function (index, data) {
            accuracy = ((data.Accuracy == undefined) || (data.Accuracy == null)) ? 16 : data.Accuracy;
            //accuracy = data.Accuracy;
            if (accuracy < 7) {
                goodAccuracyCount = goodAccuracyCount + 1;
            }
            else if (accuracy >= 7 && accuracy <= 15) {
                okAccuracyCount = okAccuracyCount + 1;
            }
            else if (accuracy > 15) {
                badAccuracyCount = badAccuracyCount + 1;
            }
        });
        goodAccuracyPercent = Math.round((goodAccuracyCount / logData.length) * 100);
        okAccuracyPercent = Math.round((okAccuracyCount / logData.length) * 100);
        badAccuracyPercent = Math.round((badAccuracyCount / logData.length) * 100);

        document.getElementById("goodPercent").innerText = goodAccuracyPercent + "%"; //logData.length;
        document.getElementById("okPercent").innerText = okAccuracyPercent + "%"; //logData.length;
        document.getElementById("badPercent").innerText = badAccuracyPercent + "%"; //logData.length;

        if (goodAccuracyPercent >= 50) {
            $("#sessionRating").removeClass("label-danger");
            $("#sessionRating").addClass("label-success");
            document.getElementById("sessionRating").innerText = "Good";
        }
        else if ((goodAccuracyPercent + okAccuracyPercent) >= 60) {
            $("#sessionRating").removeClass("label-danger");
            $("#sessionRating").addClass("label-warning");
            document.getElementById("sessionRating").innerText = "OK";
        }
        else {
            document.getElementById("sessionRating").innerText = "Bad";
        }
        $("#rangeSlider").show();
        $("#rangeSlider").slider({ id: "sessionSlider", min: 0, max: (parseInt(logData.length)-1), value: 0, focus: true})
        .on('slideStart', function(ev){
            slideStartValue = $("#rangeSlider").data('slider').getValue();
            rangeSelectorFlag = 1;
        })
        .on('slideStop', function(ev){
            slideStopValue = $("#rangeSlider").data('slider').getValue();
            rangeSelectorFlag = 0;
            if(slideStartValue != slideStopValue){
                 if(playbackCounter < slideStopValue){
                    if (isPlaybackInProgress) {   
                        stopPlayback(); 
                        forwardFlag = 1;
                        forwardCounter = playbackCounter;
                        playbackCounter = slideStopValue;
                        isPlaybackInProgress = true;
                        handlePlayButtonClass();
                        startPlayback();
                    }
                }else{
                    if (isPlaybackInProgress) {   
                        stopPlayback(); 
                        reverseFlag = 1;
                        reverseCounter = playbackCounter;    
                        playbackCounter = slideStopValue;
                        isPlaybackInProgress = true;
                        handlePlayButtonClass();
                        startPlayback();
                    }
                }
            }
        })
        //hideloader();
        //hideLoaderBallAtomLoader();
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}

function initMap() {
    handleVenueId();
    objIntripperMap = new IntripperMap({
        mapid: venueID,
        authToken: '5D5BFAC8-CEE1-400D-84FC-A56C98334767',
        floorSelectorAppendTo: "map",
        map: map,
        drawPath: true,
        mapReady: onMapReady
    });
    objIntripperMap.initMap();
    $('.website-heading h2').html(localStorage.getItem('venueName'));
}

function onMapReady(data) {
    objIntripperMapLabel = new IntripperMapLabel({
        fontFamily: 'Roboto',
        fontSize: 12,
        color: '#424243',
        _intripperMap: objIntripperMap
    });
    google.maps.Polyline.prototype.getBounds = function () {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function (item, index) {
            bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
        });
        return bounds;
    };
    //renderSessionInfoOnMap();
    loadSessionLog(getSessionId(), 0);
}
function clearMap() {
    try {
        if (marker2 != null) {
            if (marker2.getMap() != null) {
                marker2.setMap(null);
            }
        }
        if (drawnPolyline != null) {
            if (drawnPolyline.getMap() != null) {
                drawnPolyline.setMap(null);
            }
        }
        if (marker != null) {
            if (marker.getMap() != null) {
                marker.setMap(null);
            }
        }


    }
    catch (error) {
        //alert(error);
        console.log(error);
    }
}
var marker = null;
var marker2 = null;
var drawnPolyline = null;
function renderSessionInfoOnMap() {
    var location, nextLocation = null;
    var currentLog, nextLog;
    var latLng, nextLatLng;
    var leafletLatLngs = [];
    var lineColor = 'FF0800B9';
    var distanceFromLastReading;
    var accuracy;
    var routeCoordinates = [];
    try {
        clearMap();
        // var locationobj = data.get("NAOLocation");
        // if (locationobj != null) {
        //     var lat = locationobj.latitude;
        //     var lng = locationobj.longitude;
        // }
       
        var currentFloorLog = $.grep(logData, function (element, index) {
            return element.Floor == objIntripperMap.getCurrentFloor();
        });
        for (var counter = 0; counter < currentFloorLog.length; counter++) {
            drawnPolyline = null;

            if (currentFloorLog[counter].Location != null) {
                location = currentFloorLog[counter].Location;
            }
            else {
                continue;
            }
            currentLog = currentFloorLog[counter];


            if (counter < (currentFloorLog.length - 1)) {
                if (currentFloorLog[counter + 1].Location != null) {
                    nextLocation = currentFloorLog[counter + 1].Location;
                }

                nextLog = currentFloorLog[counter + 1];
            }
            else {
                nextLocation = null;
            }
            if (nextLocation != null) {

                latLng = new google.maps.LatLng(location[0], location[1]);
                nextLatLng = new google.maps.LatLng(nextLocation[0], nextLocation[1]);
                //routeCoordinates = [];
                routeCoordinates.push(latLng);
                routeCoordinates.push(nextLatLng);
                if (latLng.Location != null && nextLatLng.Location != null) {
                    distanceFromLastReading = Math.round(calcDistance(latLng, nextLatLng));
                }


                //distanceFromLastReading = latLng.distanceTo(nextLatLng);

                accuracy = nextLog.Accuracy;
                if (accuracy < 7) {
                    lineColor = '#193B50';
                }
                if (accuracy >= 7 && accuracy <= 15) {
                    lineColor = '#2D6A8F';
                }
                if (accuracy > 15) {
                    lineColor = '#3C8CBE';
                }
                // var circleSymbolObj = {
                //     path: google.maps.SymbolPath.CIRCLE,
                //     fillColor: '#4DB3A2',
                //     strokeColor: '#4DB3A2',
                //     fillOpacity: 1,
                //     strokeWeight: 2,
                //     strokeOpacity: 1,
                //     scale: 6
                //     //scale: _self._IntripperPath.pathOptions.pathWeight*2
                // }
                // var startPoint = circleSymbolObj;
                // var startSymbol = {
                //     icon: startPoint,
                //     offset: '0%'
                // }
                // var circleSymbolObj2 = {
                //     path: google.maps.SymbolPath.CIRCLE,
                //     fillColor: '#D05454',
                //     strokeColor: '#D05454',
                //     fillOpacity: 1,
                //     strokeWeight: 2,
                //     strokeOpacity: 1,
                //     scale: 6
                //     //scale: _self._IntripperPath.pathOptions.pathWeight*2
                // }
                // var endPoint = circleSymbolObj2;
                // var endSymbol = {
                //     icon: endPoint,
                //     offset: '100%'
                // }
                // var iconsArray = [];

                // iconsArray.push(startSymbol);
                // iconsArray.push(endSymbol);
                // var pathOptions = {
                //      path: routeCoordinates,
                // strokeColor: '#3C8CBE',
                // strokeOpacity: 1.0,
                // strokeWeight: 5.0,
                // zIndex: 1,
                // icons: iconsArray
                // };
                // if (drawnPolyline != null) {
                //     drawnPolyline.setMap(null);
                // }
                // drawnPolyline = new google.maps.Polyline(pathOptions);
                // drawnPolyline.setMap(objIntripperMap.getBaseGoogleMap());
                // objIntripperMap.getBaseGoogleMap().fitBounds(drawnPolyline.getBounds());


            }
        }

        var circleSymbolObj = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4DB3A2',
            strokeColor: '#4DB3A2',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeOpacity: 1,
            scale: 6
            //scale: _self._IntripperPath.pathOptions.pathWeight*2
        }
        var startPoint = circleSymbolObj;
        var startSymbol = {
            icon: startPoint,
            offset: '0%'
        }
        var circleSymbolObj2 = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#D05454',
            strokeColor: '#D05454',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeOpacity: 1,
            scale: 6
            //scale: _self._IntripperPath.pathOptions.pathWeight*2
        }
        var endPoint = circleSymbolObj2;
        var endSymbol = {
            icon: endPoint,
            offset: '100%'
        }
        var iconsArray = [];

        iconsArray.push(startSymbol);
        iconsArray.push(endSymbol);
        var pathOptions = {
            path: routeCoordinates,
            strokeColor: '#3C8CBE',
            strokeOpacity: 1.0,
            strokeWeight: 5.0,
            zIndex: 1,
            icons: iconsArray
        };
        var strImageURL = 'https://api.intripper.com/mapasset/mapPins/pin-green-5.png';
        var image = {
            url: strImageURL,
            origin: new google.maps.Point(0, 0),
            scaledSize: new google.maps.Size(25, 48),
        };
        marker = new google.maps.Marker({
            //map: objIntripperMap.getBaseGoogleMap(),
            icon: image,
            position: routeCoordinates[0],
            cursor: 'pointer',
            'optimized': false
        });
        //marker.setMap(objIntripperMap.getBaseGoogleMap());
        var strImageURL2 = 'https://api.intripper.com/mapasset/mapPins/pin-red-5.png';
        var image2 = {
            url: strImageURL2,
            origin: new google.maps.Point(0, 0),
            scaledSize: new google.maps.Size(25, 48),
        };
        marker2 = new google.maps.Marker({
            //map: objIntripperMap.getBaseGoogleMap(),
            icon: image2,
            position: routeCoordinates[routeCoordinates.length - 1],
            cursor: 'pointer',
            'optimized': false
        });
        //marker2.setMap(objIntripperMap.getBaseGoogleMap());
        if (drawnPolyline != null) {
            drawnPolyline.setMap(null);
        }
        drawnPolyline = new google.maps.Polyline(pathOptions);
        drawnPolyline.setMap(objIntripperMap.getBaseGoogleMap());
        objIntripperMap.getBaseGoogleMap().fitBounds(drawnPolyline.getBounds());
        hideLoaderBallAtomLoader();
    }
    catch (error) {
        ////alert(error);
        console.log(error);
    }

}
//Play session visualizer

var userPositionMarker = null;
var userPositionRadius = null;
var isPlaybackInProgress = false;
var playbackCounter = 0;
var playbackTimer = null;
var playbackSubTimer = null;
var rewindForwardIncrementVal = 20;
function onRewindClicked() {
    try {
        if (isPlaybackInProgress) {   
            stopPlayback(); 
            reverseFlag = 1;
            reverseCounter = playbackCounter;                    
            playbackCounter = (playbackCounter-rewindForwardIncrementVal < 0)?0:playbackCounter-rewindForwardIncrementVal;
            isPlaybackInProgress = true;
            handlePlayButtonClass();
            startPlayback();
        }        
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
function onForwardClicked() {
    try {
        if (isPlaybackInProgress) {   
            stopPlayback(); 
            forwardFlag = 1;
            forwardCounter = playbackCounter;
            playbackCounter = (playbackCounter+rewindForwardIncrementVal < logData.length)?playbackCounter+rewindForwardIncrementVal: logData.length;
            isPlaybackInProgress = true;
            handlePlayButtonClass();
            startPlayback();
        }
        
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
function onPlayPauseClicked() {
    try {
        if (!isPlaybackInProgress) {
            startPlayback();
            isPlaybackInProgress = (!isPlaybackInProgress);
            handlePlayButtonClass();
        }
        else {
            stopPlayback();
        }

    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}

var routeArray = [];
function startPlayback() {
    var playbackSubCounter;
    try {
        if(forwardFlag == 1){
            for(var i = forwardCounter ; i < playbackCounter; i++){
                playbackSubCounter = forwardCounter ++;
                if(i == playbackCounter - 1){
                    forwardFlag = 0;
                }
                 try {
                    console.log(playbackSubCounter);
                    if (playbackSubCounter < logData.length) {
                        activitySwitch(playbackSubCounter);
                    }
                }catch(error){
                    console.log(error);
                }
            }
        }

        if(reverseFlag == 1){
            for(var i = reverseCounter ; i > playbackCounter; i--){
                playbackSubCounter = reverseCounter --;
                if(i == playbackCounter - 1){
                    reverseFlag = 0;
                }
                 try {
                    console.log(playbackSubCounter);
                    if (playbackSubCounter > logData) {
                        activitySwitch(playbackSubCounter);
                    }
                }catch(error){
                    console.log(error);
                }
            }    
        }

        playbackTimer = setInterval(function () {
            var location;
            try {
                console.log(playbackCounter);
                if (playbackCounter < logData.length) {
                    location = logData[playbackCounter].Location;
                    
                    activitySwitch(playbackCounter);

                    if (location != null) {
                        latLng = new google.maps.LatLng(location[0], location[1]);

                        if (userPositionMarker == null) {

                            addUserPositionMarker(latLng, logData[playbackCounter].Accuracy);
                            //addUserPositionRadius(latLng, logData[playbackCounter].Accuracy);
                        }
                        else {
                            userPositionMarker.setPosition(latLng);
                            userPositionRadius.setRadius(logData[playbackCounter].Accuracy);
                        }
                        if (logData[playbackCounter].Accuracy > 0) {
                            //alert('hey');
                            //console.log(logData[playbackCounter].Accuracy);
                        }
                    }
                   
                    updateProgressbar();
                    updatePlaybackValues();
                    playbackCounter = playbackCounter + 1;
                }
                else {
                    stopPlayback();
                    playbackCounter = 0;
                }
            }
            catch (error) {
                console.log(error);
                //alert(error);
            }
        }, 500);
    }
    catch (error) {
        console.log(error);
        ////alert(error);
    }
}

function activitySwitch(playbackCount){
    try{
        switch (logData[playbackCount].ActivityType) {
            case OPERATION_TYPE_NAO_CALLBACK:
                break;
            case OPERATION_TYPE_POSITIONING:
                handlePositionAndFloor(logData[playbackCount].Floor);
                break;
            case OPERATION_TYPE_APP_CAME_TO_FOREGROUND:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Map screen came to foreground");
                }
                removeOverlayOnMap();
                break;
            case OPERATION_TYPE_APP_STOPPED: //Session Ended
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Session ended");
                }
                removeOverlayOnMap();
                break;
            case OPERATION_TYPE_APP_WENT_IN_BACKGROUND:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Map screen went to background");
                }
                addOverlayOnMap();
                break;
            case OPERATION_TYPE_FLOOR_TRANSITION_ENDED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Floor transition ended");
                }
                handlePositionAndFloor(logData[playbackCount].Floor);
                break;
            case OPERATION_TYPE_FLOOR_TRANSITION_STARTED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Floor transition started");
                }
                break;
            case OPERATION_TYPE_LOCATION_CORRECTION:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Location corrected");
                }
                break;
            case OPERATION_TYPE_NAVIGATION_DESTINATION_REACHED:
                break;
            case OPERATION_TYPE_NAVIGATION_EXITED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Navigation exited");
                }
                objIntripperMap.exitNavigation();
                objIntripperMap.getBaseGoogleMap().fitBounds(drawnPolyline.getBounds());
                break;
            case OPERATION_TYPE_NAVIGATION_REROUTE_DISPLAYED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Navigation reroute occurred");
                }
                break;
            case OPERATION_TYPE_NAVIGATION_SECTION_HIGHLIGHTED:
                objIntripperMap.stepToInstruction(logData[playbackCount].HighlightedPathIndex);
                break;
            case OPERATION_TYPE_NAVIGATION_STARTED:
                break;
            case OPERATION_TYPE_PATH_RENDER_COMPLETE:
                break;
            case OPERATION_TYPE_PATH_RENDER_FAILED:
                break;
            case OPERATION_TYPE_PATH_RENDER_STARTED:
                break;
            case OPERATION_TYPE_WAYFINDING_COMPLETED:
                plotRoute(logData[playbackCount]);
                break;
            case OPERATION_TYPE_WAYFINDING_FAILED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Wayfinding failed", "error");
                }
                break;
            case OPERATION_TYPE_WAYFINDING_REQUESTED:
                if(forwardFlag == 0 || reverseFlag == 0){
                    showToast("Wayfinding started");
                }
                setWayfindingRequestDetails(logData[playbackCount]);
                break;
        }
    }catch(error){
        console.log(error);
    }
}

function stopPlayback() {
    try {
        if (playbackTimer != null) {
            clearInterval(playbackTimer);
            isPlaybackInProgress = false;
            playbackTimer = null;
            handlePlayButtonClass();
        }
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}

function updatePlaybackValues() {
    var firstLog, currentLog, prevLog;
    var elapsedTime, accuracy, dflr;
    var currentLatLng, prevLatLng;
    try {
        firstLog = logData[0];
        currentLog = logData[playbackCounter];
        if (playbackCounter > 0) {
            prevLog = logData[playbackCounter - 1];
        }
        else {
            prevLog = logData[playbackCounter];
        }

        elapsedTime = Math.round(currentLog.TimeStamp - firstLog.TimeStamp);
        accuracy = currentLog.Accuracy;

        if (currentLog.Location != null) {
            currentLatLng = new google.maps.LatLng(currentLog.Location[0], currentLog.Location[1]);
        }
        if (prevLog.Location != null) {
            prevLatLng = new google.maps.LatLng(prevLog.Location[0], prevLog.Location[1]);
        }
        if (currentLog.Location != null && prevLog.Location != null) {
            dflr = calcDistance(prevLatLng, currentLatLng);
        }
        //document.getElementById("currentAccuracy").innerHTML = parseFloat(accuracy).toFixed(2) + " meters";
        accuracy = (accuracy == null) ? 0 : accuracy;
        document.getElementById("currentAccuracy").innerHTML = Number(accuracy).toFixed(2) + " meters";
        document.getElementById("elapsedTime").innerHTML = forHumans(elapsedTime);//elapsedTime + " seconds";
        document.getElementById("dflr").innerHTML = dflr.toFixed(2) + " meters";

    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
function calcDistance(p1, p2) {
    try {
        var dist = 0;
        dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        //dist = dist.toFixed(2);
        return dist;
    }
    catch (exception) {
        //handle ecxception
    }
}

function updateProgressbar() {
    var percentComplete;
    try {
        percentComplete = Math.round((playbackCounter + 1) / logData.length * 100);
        //$("#playbackProgress").attr("style", "width:" + percentComplete + "%");
        if(rangeSelectorFlag == 0){
            $('#rangeSlider').slider('setValue', playbackCounter, true);
        }
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}

function addUserPositionRadius(latLng, radius) {

    // Add circle overlay and bind to marker
    var circle = new google.maps.Circle({
        map: objIntripperMap.getBaseGoogleMap(),
        radius: 16,
        fillColor: '#3C8CBE'
    });
    circle.bindTo('center', userPositionMarker, latLng);
    userPositionRadius = circle;
}
function addUserPositionMarker(latLng, radius) {
    var marker;
    var strImageURL = 'assets/images/user_position.png';
    var image2 = {
        url: strImageURL,
        anchor: new google.maps.Point(10, 10),
        origin: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(20, 20),
    };
    var marker = new google.maps.Marker({
        map: objIntripperMap.getBaseGoogleMap(),
        icon: image2,
        position: latLng,
        cursor: 'pointer',
        'optimized': false
    });

    // Add circle overlay and bind to marker
    var circle = new google.maps.Circle({
        map: objIntripperMap.getBaseGoogleMap(),
        radius: radius,
        fillColor: '#3C8CBE',
        fillOpacity: 0.35,
        strokeOpacity: 0,
    });
    circle.bindTo('center', marker, 'position');
    marker.setMap(objIntripperMap.getBaseGoogleMap());
    userPositionMarker = marker;
    //circle.setMap(objIntripperMap.getBaseGoogleMap());
    userPositionRadius = circle;
}

function handlePlayButtonClass() {
    try {
        //fa fa-pause
        if (isPlaybackInProgress) {
            $("#playPause").removeClass("fa fa-play");
            $("#playPause").addClass("fa fa-pause");
        }
        else {
            $("#playPause").removeClass("fa fa-pause");
            $("#playPause").addClass("fa fa-play");
        }
    }
    catch (error) {
        console.log(error);
        //alert(error);
    }
}
function removeOverlayOnMap() {
    $('#mapoverlay').css('visibility', 'hidden');
}
function addOverlayOnMap() {
    $('#mapoverlay').css('visibility', 'visible');
}
var wayfindingRequest = {};

function setWayfindingRequestDetails(logData) {
    try {
        wayfindingRequest.fromLocation = logData.FromLocation;
        wayfindingRequest.toLocation = logData.ToLocation;
        wayfindingRequest.fromLevel = logData.FromFloor;
        wayfindingRequest.toLevel = logData.ToFloor;
    }
    catch (error) {
        console.log(error);
    }
}
var objIntripperPath = {};
function plotRoute(logData) {
    routeArray = JSON.parse(logData.NavigationPathDetail);
    objIntripperPath = new IntripperPath({
        border: {
            color: '#F3C200',
            weight: 6
        },
        path: {
            color: '#F4D03F',
            weight: 3
        },
        highlightBorder: {
            color: 'rgba(0,0,0,0.1)',
            weight: 6
        },
        highlightPath: {
            color: '#000',
            weight: 3
        },
        startMarker: {
            //url: startMarkerSelection,
            //   size:{
            //     width: 25,
            //     height: 25
            //   },
            useInfowindow: false,
            isInfowindowClickable: false,
            //   infowindowCustomOptions: {
            //     offset: {
            //     top: '-10px'
            //   },
            //   backgroundColor: '#364150',
            //   fontColor: '#fff',
            //   padding: '2px 15px 3px',
            //   borderRadius: '2em',
            //   border: {
            //     width: '2px',
            //     color: '#fff'
            //   },
            //   pointer: '7px',
            //   shadow: false,
            //   }
        },
        endMarker: {
            //url: endMarkerSelection,
            //   size:{
            //     width: 25,
            //     height: 25,
            //   },
            useInfowindow: false,
            isInfowindowClickable: false,
            //   infowindowCustomOptions: {
            //     offset: {
            //     top: '-10px'
            //   },
            //   backgroundColor: '#364150',
            //   fontColor: '#fff',
            //   padding: '2px 15px 3px',
            //   borderRadius: '2em',
            //   border: {
            //     width: '2px',
            //     color: '#fff'
            //   },
            //   pointer: '7px',
            //   shadow: false,
            //   }
        },
        floorChangeMarker: {
            showFromLevelMarker: true,
            //floorChangeMarkerClick: onFloorChangeMarkerClicked,
            //url: floorChangeMarkerSelection,
            //   size:{
            //     width: 25,
            //     height: 25
            //   },
            useInfowindow: false,
            isInfowindowClickable: false,
        },
        pathAnimation: 'arrowSymbol'
    });
    objIntripperMap.plotRawRouteArray(objIntripperPath, wayfindingRequest.fromLocation[0], wayfindingRequest.fromLocation[1], wayfindingRequest.fromLevel, wayfindingRequest.toLocation[0], wayfindingRequest.toLocation[1], wayfindingRequest.toLevel, routeArray);
}

function showToast(message, mode) {
    if (mode == null) { mode = "warning" };
    //Command: toastr["error"](message);    
    toastr[mode](message);
}
function handlePositionAndFloor(floor) {
    if (objIntripperMap.getCurrentFloor() != parseInt(floor)) {
        objIntripperMap.setCurrentFloor(parseInt(floor));
        objIntripperMap.changeFloor(parseInt(floor));
        //draw polyline

        renderSessionInfoOnMap();
    }
    else { return; }
}

