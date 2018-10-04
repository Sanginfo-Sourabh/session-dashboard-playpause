$(document).ready(function () {
    sessionViewerController.parseinit();
    sessionViewerController.loadSessionLog(sessionViewerController.getSessionId(),0);
    initMap();
});
var objIntripperMap = null;
var objIntripperMapLabel = null;
var map = document.getElementById('map');
var sessionViewerController = {
    
    objParse:null,
    venueID:parseInt(localStorage.getItem("venueId")),
    sessionID:localStorage.getItem("currentsession"),
    sessionLogCount:0,
    logData: null,
    goodAccuracyCount:0,
    okAccuracyCount:0,
    badAccuracyCount:0,
    goodAccuracyPercent:0,
    okAccuracyPercent:0,
    badAccuracyPercent:0,
    // objIntripperMap :null,
    // objIntripperMapLabel :null,
    // map:document.getElementById('map'),

    parseinit: function () {
        Parse.initialize(constants.parseAppID, constants.parseKey); 

        Parse.serverURL = constants.parseServer;
        objParse = Parse.Object.extend("PositioningLog");
      
    },
    getSessionId:function(){
        var sessionID = sessionViewerController.getParameterByName("session");
               
        return sessionID;
    },
    getParameterByName:function(name, url){
        if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    loadSessionLog:function(sessionId, start){
        try {
            var query = new Parse.Query(objParse);
            var recordLimit = 1000;
            query.equalTo("SessionId",sessionId);
            query.limit(recordLimit);
            query.skip(recordLimit * start);
            query.find({
                success: function (results) {
                    try {
                        if (start == 0) {
                            sessionViewerController.logData = [];
                        }
                        sessionViewerController.sessionLogCount = sessionViewerController.sessionLogCount + results.length;
                        $.each(results, function (index, data) {
                            var locationobj = data.get("NAOLocation");
                            if(locationobj != null){
                                var lat = locationobj.latitude;
                                var lng = locationobj.longitude;
                            }
                           
                           
                            var logObject;
                            if (index == 0) {
                                displayMap = parseInt(data.get("VenueId"));
                                displayFloor = parseInt(data.get("Floor"));
                                firstLog = new Object();
                                firstLog.ActivityType = data.get("OperationType");
                                firstLog.Location = data.get("NAOLocation");
                                firstLog.Floor = data.get("Floor");
                                firstLog.Venue = data.get("VenueId");
                                firstLog.DeviceID = data.get("DeviceId");
                                firstLog.Platform = data.get("Platform");
                                if (data.get("Platform") == "iOS") {
                                    firstLog.TimeStamp = data.get("TimeStamp");
                                }
                                else {
                                    firstLog.TimeStamp = data.get("TimeStamp") / 1000;
                                }
                                firstLog.DeviceTime = data.get("DeviceTime");
                                firstLog.Accuracy = data.get("NAOAccuracy");
                                firstLog.Comment = data.get("Remarks");
                                firstLog.Device = data.get("Device");
                                firstLog.App = data.get("App");
                                firstLog.IAKey = "";//data.get("IAKey");
                                firstLog.BuildNo = data.get("AppVersion");
                                var date = new Date(firstLog.TimeStamp * 1000);
                                console.log(date.toDateString());
                                var paris = moment(firstLog.TimeStamp * 1000).utcOffset('+0200').format('YYYY-MM-DD HH:mm');
                                console.log(paris);
                            }
                            if (lat == 0 && lng == 0) {
                                // do nothing
                            }
                            else {
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
                                firstLog.App = data.get("App");
                                firstLog.IAKey = "";//data.get("IAKey");
                                firstLog.BuildNo = data.get("AppVersion");
                                sessionViewerController.logData.push(logObject);
                            }
                        });
                        if ($(results).length == 0) {
                            //loadMap(displayFloor);
                            //renderSessionInfoOnMap();
                            sessionViewerController.populateSessionInfo();
                            
                        }
                        else {
                            sessionViewerController.loadSessionLog(sessionId, start + 1);
                        }
                        //alert(logData);
                    }
                    catch (error) {
                        console.log(error);
                        alert(error);
                    }
                },
                error: function (error) {
                    console.log(error);
                }
            });

        }
        catch (error) {
            console.log(error);
            alert(error);
        }
    },
    populateSessionInfo:function(){
        var lastLog, nextLog;
                var duration, ttff;
                var sessionName;
                try {
                    lastLog = sessionViewerController.logData[sessionViewerController.logData.length - 1];
                    nextLog = sessionViewerController.logData[0];

                    sessionName = "";//getBuildingName(firstLog.Floor) + ", " + getFloorName(firstLog.Floor);

                    duration = Math.round(lastLog.TimeStamp - firstLog.TimeStamp);
                    ttff = Math.round(nextLog.TimeStamp - firstLog.TimeStamp);

                    document.getElementById("sessionName").innerText = sessionName;
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
                    document.getElementById("sessionDuration").innerText = duration + " seconds";
                    document.getElementById("timeToFirstFix").innerText = ttff + " seconds";
                    document.getElementById("deviceId").innerText = firstLog.DeviceID;
                    document.getElementById("readingCount").innerText = sessionViewerController.sessionLogCount; //logData.length;
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

                    goodAccuracyPercent = Math.round((sessionViewerController.goodAccuracyCount / sessionViewerController.logData.length) * 100);
                    okAccuracyPercent = Math.round((sessionViewerController.okAccuracyCount / sessionViewerController.logData.length) * 100);
                    badAccuracyPercent = Math.round((sessionViewerController.badAccuracyCount / sessionViewerController.logData.length) * 100);

                    document.getElementById("goodPercent").innerText = sessionViewerController.goodAccuracyPercent+"%"; //logData.length;
                    document.getElementById("okPercent").innerText = sessionViewerController.okAccuracyPercent + "%"; //logData.length;
                    document.getElementById("badPercent").innerText = sessionViewerController.badAccuracyPercent + "%"; //logData.length;

                    if (goodAccuracyPercent >= 50) {
                        $("#sessionRating").removeClass("label-inverse");
                        $("#sessionRating").addClass("label-success");
                        document.getElementById("sessionRating").innerText = "Good";
                    }
                    else if ((goodAccuracyPercent + okAccuracyPercent) >= 60) {
                        $("#sessionRating").removeClass("label-inverse");
                        $("#sessionRating").addClass("label-warning");
                        document.getElementById("sessionRating").innerText = "OK";
                    }
                    else {
                        document.getElementById("sessionRating").innerText = "Bad";
                    }
                    

                }
                catch (error) {
                    console.log(error);
                    alert(error);
                }
    },
    
    
}
function initMap() {
    objIntripperMap = new IntripperMap({
      mapid: sessionViewerController.venueID,
      authToken: '5D5BFAC8-CEE1-400D-84FC-A56C98334767',
      floorSelectorAppendTo:"map",
      map: map,
      mapReady: onMapReady
    });
    objIntripperMap.initMap();
  }
  function onMapReady(data){
     objIntripperMapLabel  = new IntripperMapLabel({
       fontFamily: 'Roboto',
       fontSize: 12,
       color: '#424243',
       _intripperMap: objIntripperMap
     });
  }