

var filtercontroller = {
    daterange: null,
    devices: [],
    accuracyrange: [],
    slabios: [7, 15, 999],
    slabandroid: [7, 15, 999],
    knownDevice: [["4C:66:41:C4:76:0A", "Patrice - Galaxy S7 Edge"], ["A0:CB:FD:F3:1C:A4", "Frédéric - Samsung A5"], ["10:30:47:06:4F:F7", "Juha - Unknown Samsung Device"], ["24:00:BA:19:E6:8E", "Unknown Non-Samsung Android device"], ["8BCAAC41-AD5C-4E49-AC8B-AB931A746506", "Patrice - iPhone 6s"], ["1716AB97-9036-4C1E-9EB3-7F57E7118EEC", "Juha - iPhone 5s"], ["DACDD403-B441-402A-BAEB-5E76A3C7F733", "Unknown iPhone 5s"]],
    specificDevice: null,
    floorlist: [],
    minDuration: 20,
    logCollector: null,
    logLogData: null,
    sucessCallback: null,
    errorCallback: null,
    parseClassObject: null,
    pointerStart: 0,
    onlySamsung: false,
    venueID:parseInt(localStorage.getItem("venueId")),
    init: function () {
        //Parse.initialize("ZvODaFvdplh03PzuTrIPPokbEl9dHhprdXHNWYqZ", "m5RcjrUlEossbpMUUTJUKrBRluOPSGJUL8wFA0bL"); //For AF
        //Parse.initialize("3FUOrpdam7F18ooY36DSpvCPDUvgto9zOS48lZbB", "AZmhySvaXGuhpMB939VkEEMz8WdAj9NzWVwQjYOu");//For CG
        //Parse.serverURL = 'https://parseapi.back4app.com';

        Parse.initialize(constants.parseAppID, constants.parseKey); 

        Parse.serverURL = constants.parseServer;

        filtercontroller.parseClassObject = Parse.Object.extend("PositioningLog");
    },

    groupBy: function (array, f) {
        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        })
    },
    addDateRange: function (from, to) {
        filtercontroller.daterange = [];
        filtercontroller.daterange.push(from); //Uinx Time
        filtercontroller.daterange.push(to); //Uinx Time
    },

    addDevices: function (device) {
        var found = $.inArray(device, filtercontroller.devices);
        if (found == -1) {
            filtercontroller.devices.push(device);
        }

    },

    removeDevices: function (device) {
        var found = $.inArray(device, filtercontroller.devices);
        if (found >= 0) {
            filtercontroller.devices.splice(found, 1);
        }
    },
    addAccuracyFilter: function (item) {
        var found = $.inArray(item, filtercontroller.accuracyrange);
        if (found == -1) {
            filtercontroller.accuracyrange.push(item);
        }

    },

    removeAccuracyFilter: function (item) {
        var found = $.inArray(item, filtercontroller.accuracyrange);
        if (found >= 0) {
            filtercontroller.accuracyrange.splice(found, 1);
        }
    },

    addFloor: function (floornumber) {
        floornumber = parseInt(floornumber);
        var found = $.inArray(floornumber, filtercontroller.floorlist);
        if (found == -1) {
            filtercontroller.floorlist.push(floornumber);
        }

    },

    removeFloor: function (floornumber) {
        floornumber = parseInt(floornumber);
        var found = $.inArray(floornumber, filtercontroller.floorlist);
        if (found >= 0) {
            filtercontroller.floorlist.splice(found, 1);
        }
    },

    loadParseLog: function (start) {
        //filtercontroller.pointerStart = start;
        //console.log(filtercontroller.pointerStart);
        var queryAndroid = new Parse.Query(filtercontroller.parseClassObject);
        var queryios = new Parse.Query(filtercontroller.parseClassObject);
        //daterange android
        queryAndroid.lessThanOrEqualTo("TimeStamp", filtercontroller.daterange[1] * 1000);
        queryAndroid.greaterThanOrEqualTo("TimeStamp", filtercontroller.daterange[0] * 1000);

        queryios.lessThanOrEqualTo("TimeStamp", filtercontroller.daterange[1]);
        queryios.greaterThanOrEqualTo("TimeStamp", filtercontroller.daterange[0]);

        if (filtercontroller.floorlist.length > 0) {
            queryAndroid.containedIn("Floor", filtercontroller.floorlist);
            queryios.containedIn("Floor", filtercontroller.floorlist);
        }
        if (filtercontroller.venueID) {
            queryAndroid.equalTo("VenueId", filtercontroller.venueID);
            queryios.equalTo("VenueId", filtercontroller.venueID);
        }
        if (filtercontroller.specificDevice) {
            queryAndroid.equalTo("DeviceID", filtercontroller.specificDevice);
            queryios.equalTo("DeviceID", filtercontroller.specificDevice);
        }
        
        else {
            if (filtercontroller.devices.length > 0) {
                queryAndroid.containedIn("Platform", filtercontroller.devices);
                queryios.containedIn("Platform", filtercontroller.devices);
            }
        }

        var query = Parse.Query.or(queryAndroid, queryios);
        // var query = new Parse.Query(TestObject);
        //var sectionID = sectionid;
        var recordLimit = 1000;
        //query.equalTo("Session", sectionID);
        query.limit(recordLimit);
        query.skip(recordLimit * start);
        query.find({
            success: function (results) {
                // results is an array of Parse.Object.
                if (start == 0) {
                    filtercontroller.logCollector = [];
                    filtercontroller.logLogData = [];
                    $.each(results, function (index, data) {
                        filtercontroller.logLogData.push(data);
                    });
                }
                else {
                    $.each(results, function (index, data) {
                        filtercontroller.logLogData.push(data);
                    });
                }

                $.each(results, function (index, data) {
                    var locationobj = data.get("NAOLocation");
                    if(locationobj != null){
                        var lat = locationobj.latitude;
                        var lng = locationobj.longitude;
                    }
                   
                    //if (lat == 0 && lng == 0) {

                    //}
                    //else {
                    collectOne = new Object();
                    collectOne.session = data.get("SessionId");
                    collectOne.type = "Feature";
                    collectOne.geometry = new Object();
                    collectOne.geometry.type = "Point";
                    collectOne.geometry.coordinates = [lng, lat];
                    collectOne.properties = new Object();
                    collectOne.properties.IID = data.id;
                    collectOne.properties.level = data.get("Floor");
                    collectOne.properties.deviceid = data.get("DeviceId");
                    collectOne.properties.devicetime = data.get("DeviceTime");
                    collectOne.properties.deviceModel = data.get("Device");
                    collectOne.properties.accuracy = data.get("NAOAccuracy");
                    collectOne.properties.building = data.get("Remarks");
                    collectOne.properties.floorno = data.get("Floor");
                    collectOne.properties.deviceName = data.get("Device");
                    collectOne.properties.app = data.get("App");
                    var devicePlatform = data.get("Platform");
                    collectOne.properties.platform = devicePlatform;
                    if (devicePlatform != "iOS") {
                        collectOne.properties.TimeStamp = data.get("TimeStamp") / 1000;
                    }
                    else {
                        collectOne.properties.TimeStamp = data.get("TimeStamp");
                    }
                    if (filtercontroller.onlySamsung) {
                        var abc = collectOne.properties.deviceModel;
                        if (abc != null) {
                            if (devicePlatform == "android" && abc.match("^Samsung")) {
                                filtercontroller.logCollector.push(collectOne);
                            }
                        }
                    }
                    else {

                        var abc = collectOne.properties.deviceModel;
                        if (abc != null) {
                            if (devicePlatform == "android" && abc.match("^Samsung")) {
                                console.log("Samsung");
                                filtercontroller.logCollector.push(collectOne);
                            }
                            else {
                                filtercontroller.logCollector.push(collectOne);
                            }
                        } else {
                            filtercontroller.logCollector.push(collectOne);
                        }
                    }
                    //}

                });
                if ($(results).length == 0) {
                    filtercontroller.groupParseData();
                }
                else {
                    filtercontroller.loadParseLog(start + 1);
                }

            },

            error: function (error) {
                // error is an instance of Parse.Error.
                filtercontroller.errorCallback(error);
                console.log(error);
            }
        });
    },
    getParseLog: function (sucess, failed) {
        filtercontroller.sucessCallback = sucess;
        filtercontroller.errorCallback = failed;
        var found = $.inArray("samsung", filtercontroller.devices);
        if (found >= 0) {
            var foundAndroid = $.inArray("android", filtercontroller.devices);
            if (foundAndroid == -1) {
                filtercontroller.addDevices("android");
                filtercontroller.onlySamsung = true;
            }
            else {
                filtercontroller.onlySamsung = false;
            }
        }
        filtercontroller.loadParseLog(0);
    },
    groupParseData: function (sucessresult) {
        var result = filtercontroller.groupBy(filtercontroller.logCollector, function (item) {
            return [item.session];
        });
        var summary = filtercontroller.summary(result);
        filtercontroller.sucessCallback(summary);
        //alert(sucessresult);
    },
    getBuildingName: function (floorNo, floortext) {
        if (floorNo == 0 || floorNo == 1 || floorNo == 3 || floorNo == 4 || floorNo == 5 || floorNo == 6) {
            return "Siege";
        }
        else if (floorNo == 2) {
            return "AF";
        }
        else {
            return "Pegase";
        }
    },
    getFloorName: function (floorno) {
        if (floorno == 0) {
            return "Floor 0";
        }
        else if (floorno == 1) {
            return "Floor 1";
        }
        else if (floorno == 2) {
            return "Mezzanine, Floor 1";
        }
        else if (floorno == 3) {
            return "Floor 2";
        }
        else if (floorno == 4) {
            return "Floor 3";
        }
        else if (floorno == 5) {
            return "Floor 4";
        }
        else if (floorno == 6) {
            return "Floor 5";
        }
        else if (floorno == 7) {
            return "Floor 0";
        }
        else if (floorno == 8) {
            return "Floor 1";
        }
        else if (floorno == 9) {
            return "Place Floor";
        }
        else if (floorno == 10) {
            return "-";
        }
        else if (floorno == 11) {
            return "Floor 3";
        }
        else if (floorno == 12) {
            return "Floor 4";
        }
        else if (floorno == 13) {
            return "Floor 5";
        }
        else if (floorno == 14) {
            return "Floor 6";
        }
        else if (floorno == 15) {
            return "Floor 7";
        }
    },
    summary: function (input) {
        var output = [];
        input.forEach(function (obj) {
            obj.sort(function (a, b) { return a.properties.TimeStamp - b.properties.TimeStamp });
            var firstData = $(obj).first()[0];
            //Remove Other then france
            if (firstData.properties.devicetime.match("0530$") || firstData.properties.devicetime.match("IST")) {
                console.log("India time");
                //return true;
            }
            var lastData = $(obj).last()[0];

            var temp = new Object();
            temp.sessionTime = parseFloat(lastData.properties.TimeStamp - firstData.properties.TimeStamp).toFixed(0);
            temp.os = firstData.properties.platform;
            temp.deviceid = firstData.properties.deviceid;
            temp.deviceName = firstData.properties.deviceName;
            filtercontroller.knownDevice.forEach(function (device) {
                if (device[0] == temp.deviceid) {
                    temp.deviceName = device[1];
                }
            });
            if (temp.deviceName == null) {
                temp.deviceName = "-"
            }
            if (firstData.properties.deviceModel == null) {
                temp.deviceModel = "Unknown device";
            }
            else {
                temp.deviceModel = firstData.properties.deviceModel;
            }
            temp.buildingName = "";//filtercontroller.getBuildingName(firstData.properties.floorno, firstData.properties.building);
            temp.FloorName = filtercontroller.getFloorName(firstData.properties.floorno);
            temp.building = "";//filtercontroller.getBuildingName(firstData.properties.floorno, firstData.properties.building) + ", " + filtercontroller.getFloorName(firstData.properties.floorno);
            temp.startat = firstData.properties.TimeStamp;
            temp.endat = lastData.properties.TimeStamp;
            temp.session = firstData.session;
            temp.numberOfreadings = obj.length;
            temp.devicetime = firstData.properties.devicetime;
            temp.ontime = firstData.properties.TimeStamp;
            temp.floorno = firstData.properties.floorno;
            if (firstData.properties.app.match("Green$")) {
                temp.apptype = "green";
            }
            else if (firstData.properties.app.match("Red$")) {
                temp.apptype = "red";
            }
            else if (firstData.properties.app.match("Blue$")) {
                temp.apptype = "blue";
            }
            else {
                temp.apptype = "white";
            }

            var removeNonLocation = [];
            $.each(obj, function (index, item) {
                var testfor = item.geometry.coordinates;
                if (testfor[0] == 0 && testfor[1] == 0) {
                }
                else {
                    removeNonLocation.push(item)
                }
            });
            temp.actualReading = removeNonLocation.length;
            devicePlatform = firstData.properties.platform;
            if (devicePlatform == "iOS") {
                if (temp.session == "47BE8976-6580-44C7-A13E-2691C93B536E") {
                    console.log("test here");
                }
                temp.AccuracySlab1 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, 0, filtercontroller.slabios[0]));
                temp.AccuracySlab2 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, filtercontroller.slabios[0], filtercontroller.slabios[1]));
                temp.AccuracySlab3 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, filtercontroller.slabios[1], filtercontroller.slabios[2]));

                temp.AccuracySlabRange1 = filtercontroller.slabios[0];
                temp.AccuracySlabRange2 = filtercontroller.slabios[1];
                temp.AccuracySlabRange3 = filtercontroller.slabios[1];
            }
            else {

                temp.AccuracySlab1 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, 0, filtercontroller.slabandroid[0]));
                temp.AccuracySlab2 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, filtercontroller.slabandroid[0], filtercontroller.slabandroid[1]));
                temp.AccuracySlab3 = Math.round(filtercontroller.getAcuracySlab(removeNonLocation, filtercontroller.slabandroid[1], filtercontroller.slabandroid[2]));

                temp.AccuracySlabRange1 = filtercontroller.slabandroid[0];
                temp.AccuracySlabRange2 = filtercontroller.slabandroid[1];
                temp.AccuracySlabRange3 = filtercontroller.slabandroid[1];
            }


            if (temp.sessionTime >= parseFloat(filtercontroller.minDuration)) {

                if ((temp.AccuracySlab1 / removeNonLocation.length) * 100 >= 50) {
                    temp.sessiontag = "good";
                }
                else if (((temp.AccuracySlab1 + temp.AccuracySlab2) / removeNonLocation.length) * 100 >= 60) {
                    temp.sessiontag = "poor";
                }
                else {
                    temp.sessiontag = "bad";
                }
                //addtional filter for good,bad,poor sessions
                if(filtercontroller.accuracyrange.length >0){
                    $.each(filtercontroller.accuracyrange,function(index,element){
                        if(element.toLowerCase() == temp.sessiontag){
                            output.push(temp);
                        }
                    });
                }
                else{
                    output.push(temp);
                }
                
            }

        });

        output.sort(function (a, b) { return b.ontime - a.ontime });
        filtercontroller.onlySamsung = false;
        return output;
    },
    getAcuracySlab: function (data, from, to) {
        var lastReading = null;
        var detailsession = 0;
        $.each(data, function (index, item) {
            var checkingAccuracy = parseFloat(item.properties.accuracy);
            if (checkingAccuracy >= from && checkingAccuracy < to) {
                //var diff = item.properties.TimeStamp - data[index - 1].properties.TimeStamp;
                //detailsession = detailsession + diff;
                detailsession = detailsession + 1;
            }
        });
        return detailsession;
    },
    isBadSession: function (data) {
        var firstData = $(data).first()[0];
        var lastData = $(data).last()[0];
        var timeRunning = parseFloat(lastData.properties.TimeStamp - firstData.properties.TimeStamp).toFixed(1);
        var numberOfreadings = data.length;
        var avgData = numberOfreadings / timeRunning;
        if (avgData < 0.5) {
            return true;
        }
        else {
            return false;
        }
    },
    isPoorSession: function (data) {
        var firstData = $(data).first()[0];
        var lastData = $(data).last()[0];
        var timeRunning = parseFloat(lastData.properties.TimeStamp - firstData.properties.TimeStamp).toFixed(1);
        var numberOfreadings = data.length;
        var avgData = numberOfreadings / timeRunning;
        if (avgData < 0.8) {
            return true;
        }
        else {
            return false;
        }
    }

};