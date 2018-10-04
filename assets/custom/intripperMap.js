var globalVar = 'global';
var endpoint_variable = 'endpoint.php';
//var endpoint_variable = 'ips.php';
function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object'

    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice()
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument)
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument)
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument))
        }
    })
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var destination = {}
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument)
        })
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument)
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument)
        }
    })
    return destination
}

function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var arrayMerge = options.arrayMerge || defaultArrayMerge

    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
}
var pubsub = {};

function setAuthToken(authToken) {
  $.ajaxSetup({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(authToken + ":"));
    }
  });
}
(function(myObject) {
  // Storage for topics that can be broadcast
  // or listened to
  var topics = {};
  // A topic identifier
  var subUid = -1;
  // Publish or broadcast events of interest
  // with a specific topic name and arguments
  // such as the data to pass along
  myObject.publish = function(topic, args) {
    if (!topics[topic]) {
      return false;
    }
    var subscribers = topics[topic],
      len = subscribers ? subscribers.length : 0;
    while (len--) {
      subscribers[len].func(topic, args, subscribers[len].reference);
    }
    return this;
  };
  // Subscribe to events of interest
  // with a specific topic name and a
  // callback function, to be executed
  // when the topic/event is observed
  myObject.subscribe = function(topic, func, reference) {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func,
      reference: reference
    });
    return token;
  };
  // Unsubscribe from a specific
  // topic, based on a tokenized reference
  // to the subscription
  myObject.unsubscribe = function(token) {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }
    return this;
  };
}(pubsub));

var IntripperMap = (function() {
  // Define our constructor
  /**
   * @classdesc This is the central class of the IntripperMap SDK
   * @constructs IntripperMap
   * @param {Object} options IntripperMap options
   * @param {int} options.mapid The venue ID
   * @param {Element} options.map The Element object representing the map element (value returned by javascript's document.getElementById() function)
   * @param {string} options.languageCode The official locale code of language in which content is required. Multilingual support
   * @param {boolean} options.customFloorSelector Allows user to use custom floor selector if set to true
   * @param {int} options.initialZoom The initial zoom level at which the map will be loaded
   * @param {string} options.floorSelectorAppendTo The id of html element to which the floor selector element will be appended. If not set by user, the floor selector will be appended to body by default
   * @param {boolean} options.customInfoWindow If set to false, a default infowindow will be displayed on mapClick event and by findPOIOnMap method. By setting it to true, user can use a custom infowindow
   * @param {boolean}  options.isAddBounds If set to true, map view is restricted by bounds. Default is true
   * @param {boolean}  options.isMapClickEnabled If set to true, map click is enabled. Default is true
   * @param {object} options.infowindowOptions The infowindow options can be used to implement Intripper's inbuilt infowindow but change some of it's settings like border color, width, backgroundcolor etc.
   * Sample infowindow object literal: infowindow:{
     offset: {
         top: '-10px'
     },
     fontColor: '#fff',
     padding: '15px',
     backgroundColor: '#f5f3f0',
     borderRadius: '0em',
     border: {
       width: '1px',
       color: '#bbb'
     },
     pointer: '7px',
     shadow: true,
   }
   The customInfowindow option needs to be set to false for these options to be effective
   * @param {string} options.authToken Unique authToken provided to you while activating the SDK
   * @param {string} options.kmlLayerUrl Url of KML file to be loaded on map
   * @param {string} options.distanceUnit Can be one of two values.'feet' OR 'meter'
   * @param {boolean} options.drawPath Draws route on map if enabled
   * @param {function} options.mapReady Callback function called when map is ready
   * @param {function} options.mapClick Callback function called when user clicks on map
   * @param {function} options.mapZoom Callback function called when map is ready
   * @param {function} options.pathFindingCompleted Callback function called when route is found
   * @param {function} options.pathFindingFailed Callback function called when no route is found
   * @param {function} options.floorChanged Callback function called when floor is changed
   */
  function IntripperMap() {
    // Create global element references
    this._googleMap = null;
    this._intripperUrl = 'http://intripper.com/';
    this._intripperLogoUrl = 'https://api.intripper.com/mapasset/intripper.png';
    this._mapData = null;
    this._minZoom = null;
    this.totalRouteDistance = null;
    this.totalRouteTime = null;
    this._mapTileIdArray = [];
    this._mapTileCloudIdArray = [];
    this._tileSetObjArray = [];
    this._imageMapType = null;
    this._displayedFloor = null;
    this._objIntripperVenueInfo = null;
    this._routeMarkers = [];
    this._floorChangeMarkersArray = [];
    this._tileServerUrl = 'https://api.intripper.com/indoormap/v4/';
    //this._tileServerCloudUrl = 'https://s3-us-west-2.amazonaws.com/intripper-tiles/';
    //this._tileServerCloudUrl = 'https://d2m05oxjzh3xv.cloudfront.net/';
    this._tileServerCloudUrl = '';
    this._isMapboxTile = true;
    // Define option defaults
    var defaults = {
      mapid: 32,
      map: null,
      apiEnvironmentCode: 3,
      baseURL: "https://api.intripper.com/v15/bin/",
      assetURL: "https://api.intripper.com/v15/asset/",
      languageCode: 'en',
      customTiles: false,
      customFloorSelector: false,
      initialZoom: 20,
      floorSelectorAppendTo: '',
      customInfoWindow: false,
      isDefaultSearchBarEnabled: false,
      searchBarAppendTo: '',
      _mapData: {},
      _labelOptions: {},
      loadGoogle: true,
      authToken: '',
      kmlLayerUrl: '',
      isStreetViewEnabled: false,
      avgIndoorWalkingSpeedPerMtr: 0.01295494529,
      avgIndoorWalkingSpeedPerFeet: 0.003948667324392,
      distanceUnit: 'feet',
      isAddBounds: true,
      isMapClickEnabled: true,
      infowindowOptions: {
        offset: {
          top: '-10px'
        },
        fontColor: '#333',
        padding: '15px',
        backgroundColor: '#f5f3f0',
        borderRadius: '0em',
        border: {
          width: '1px',
          color: '#bbb'
        },
        pointer: '7px',
        shadow: true,
      },
      //events
      mapReady: false,
      mapClick: function(obj) {},
      mapZoom: function(obj) {},
      pathFindingCompleted: function(obj) {},
      pathFindingFailed: function(obj) {},
      floorChanged: function(obj) {},
      floorSelectorClicked: function(obj) {}
    }
    // Create options by extending defaults with the passed in arguments
    if (arguments[0] && typeof arguments[0] === "object") {
      //this.options = extendDefaults(defaults, arguments[0]);
      this.options =  deepmerge(defaults, arguments[0]);
    }
    var _self = this;
    if (_self.options != null) {
      setBaseUrl.call(_self, _self.options.apiEnvironmentCode);
      setAuthToken(_self.options.authToken);
    }
    setTimeout(function() {
      var markerWithLabelTag = '<script type="text/javascript" src="https://s3-us-west-2.amazonaws.com/intripper/externalplugins/markerwithlabel.js"></script>';
      $('head').append(markerWithLabelTag);
      var snazzywindowtag = '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/snazzy-info-window@1.1.1/dist/snazzy-info-window.min.js"></script>';
      $('head').append(snazzywindowtag);
      var snazzywindowcss = '<link href=" https://cdn.jsdelivr.net/npm/snazzy-info-window@1.1.1/dist/snazzy-info-window.min.css" rel="stylesheet" type="text/css" />';
      $('head').append(snazzywindowcss);
    }, 500);
  }

  // Public Methods

  IntripperMap.prototype.addMapZoomListener = function(e) {
    var _self = this;
    try {
      _self._googleMap.addListener('zoom_changed', function(e) {
        _self.onMapZoomChanged(e);
      });
    } catch (error) {
      console.log(error);
    }
  }

  IntripperMap.prototype.onMapZoomChanged = function(e) {
    var _self = this;
    var obj = {
      name: 'zoomed'
    };
    try {
      if (_self._googleMap.getZoom() < _self._minZoom) _self._googleMap.setZoom(_self._minZoom);
      /**
       * @event mapZoom
       * @description  Map zoom changed event
       * @returns {int} current zoom level
       * @memberof IntripperMap
       */
      _self.options.mapZoom.call(_self, _self._googleMap.getZoom());
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method setMapZoom
   * @description Sets map zoom
   * @param {int} zoomLevel The zoom level to be set for the map
   * @memberof IntripperMap
   */
  IntripperMap.prototype.setMapZoom = function(zoomLevel) {
    var _self = this;
    try {
      _self._googleMap.setZoom(parseInt(zoomLevel));
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method findPOIOnMap
   * @description for a given poi id, an infowindow is shown on map
   * @param {string} POIID
   * @param {int} level POI level (optional)
   * @returns {Object} IntripperMapArea object if found of given POIID else null
   * @memberof IntripperMap
   */
  IntripperMap.prototype.findPOIOnMap = function(POIID, level) {
    var _self = this;
    try {
      var matchedPOI = $.grep(_self._objIntripperVenueInfo.getMapAreaList(), function(element, index) {
        if (level != null) {
          return element.getAreaId() == POIID && element.getAreaLevel() == level;
        } else {
          return element.getAreaId() == POIID;
        }
      });
      if (matchedPOI[0] != null) {
        var latLng = {
          lat: parseFloat(matchedPOI[0].getAreaCentreLat()),
          lng: parseFloat(matchedPOI[0].getAreaCentreLng())
        };
        if (matchedPOI[0].getAreaLevel() != _self._displayedFloor) {
          _self.changeFloor(matchedPOI[0].getAreaLevel(), false).then(function(response) {
            if (!isEmpty(matchedPOI[0])) {
              if (_self.options.customInfoWindow == false) {
                showInfoWindow.call(_self, matchedPOI[0], latLng);
              }
              _self._googleMap.panTo(latLng);
              return matchedPOI[0];
            } else {
              return null;
            }
          });
        } else if (!isEmpty(matchedPOI[0])) {
          if (_self.options.customInfoWindow == false) {
            setTimeout(function() {
              showInfoWindow.call(_self, matchedPOI[0], latLng);
            }, 500);
          }
          _self._googleMap.panTo(latLng);
          return matchedPOI[0];
        }
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method centerMapOnLocation
   * @description center map on given location. Specified floor & zoom level will be used.
   * @param {float} locationLat
   * @param {float} locationLng
   * @param {int} floor floor number to which user wants to switch
   * @param {int} zoomLevel
   * @returns {google.maps.Map}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.centerMapOnLocation = function(locationLat, locationLng, floor, zoomLevel) {
    var _self = this;
    try {
      if (floor != null) {
        _self.changeFloor(floor, false).then(function(response) {
          _self._googleMap.panTo({
            lat: parseFloat(locationLat),
            lng: parseFloat(locationLng)
          });
          setTimeout(function() {
            if (zoomLevel != null) {
              _self.setMapZoom(zoomLevel);
            }
          }, 500);
        });
      }
      return _self._googleMap;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method getBaseGoogleMap
   * @description Gets base google map instance
   * @returns {google.maps.Map}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getBaseGoogleMap = function() {
    var _self = this;
    try {
      return _self._googleMap;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getBounds
   * @description Gets Area bounds represented in northeast and southwest format.
   * @returns {Array} An array of coordinates.
   * @memberOf IntripperMap
   */
  IntripperMap.prototype.getBounds = function() {
    var _self = this;
    try {
      return _self._mapData.bounds;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getBuildings
   * @description Gets information about all buildings in venue
   * @returns {Array} An array of objects.
   * @memberOf IntripperMap
   */
  IntripperMap.prototype.getBuildings = function() {
    var _self = this;
    try {
      return _self._mapData.buildings;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getMinZoom
   * @description gets minimum zoom of map
   * @returns {int}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getMinZoom = function() {
    try {
      return this._mapData.minZoom;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getMaxZoom
   * @description gets maximum zoom of map
   * @returns {int}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getMaxZoom = function() {
    try {
      return this._mapData.maxZoom;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getBaseUrl
   * @description gets base url
   * @returns {string}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getBaseUrl = function() {
    try {
      return this.options.baseURL;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getDistanceUnit
   * @description gets unit set by user for distance
   * @returns {string}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getDistanceUnit = function() {
    try {
      return this.options.distanceUnit;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getTotalRouteDistance
   * @description gets total route distance
   * @returns {string}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getTotalRouteDistance = function() {
    try {
      return this.totalRouteDistance;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getTotalRouteTime
   * @description gets total route time
   * @returns {int}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getTotalRouteTime = function() {
    try {
      return this.totalRouteTime;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getFloorTransition
   * @description gets object containing information about number of levels to be navigated to reach destination, direction to  be navigated in ("up" | "down"). Used during multilevel navigation to display information about route e.g. "2 levels down"
   * @returns {Object} Sample Object literal structure
   * {levelTransition:2 //integer defining number of levels to be navigated to,
   * strLevel:"levels" //level|levels,
   * transitionDirection:"down"}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getFloorTransition = function() {
    try {
      return this.floorTransition;
    } catch (error) {
      console.log(error);
    }
  }

  IntripperMap.prototype.setLabelOptions = function(value) {
    try {
      this.options._labelOptions = value;
    } catch (error) {
      console.log(error);
    }
  }

  IntripperMap.prototype.getLabelOptions = function() {
    try {
      return this._labelOptions;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getFloorSelectorElementID
   * @description gets floor selector html element's Id
   * @returns {string}
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getFloorSelectorElementID = function() {
    try {
      return 'floorSelector';
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method getFloorSelectorElement
   * @description gets floor selector element
   * @returns {Object} jQuery object
   * @memberof IntripperMap
   */
  IntripperMap.prototype.getFloorSelectorElement = function() {
    try {
      return $('#floorSelector');
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method initMap
   * @description Initializes the map
   * @memberof IntripperMap
   */
  IntripperMap.prototype.initMap = function() {
    var post = {};
    post["method"] = "getmap";
    post["id"] = this.options.mapid;
    post["online"] = "-999";
    var strURL = this.options.baseURL + endpoint_variable;
    var _self = this;
    try {      
      $.getJSON(strURL, post)
        .done(function(data) {
          var strLogo = '<a href=' + _self._intripperUrl + ' target="_blank" id="map-logo"> <img class="img-responsive" src="' + _self._intripperLogoUrl + '"/></a>';
          //$('body').prepend(strLogo);
          //$('#map').prepend(strLogo); //zw
          
          _self._mapData = data;
          _self.options._mapData = data;
          _self._displayedFloor = data.floor[0].floor;
          _self._objIntripperVenueInfo = new IntripperVenueInfo({

          });
          _self._objIntripperVenueInfo.setMapName(_self._mapData.mapname);
          _self._objIntripperVenueInfo.setVenueId(_self.options.mapid);
          if (_self._mapData.hasOwnProperty('tileurl')) {
            var url = _self._mapData.tileurl.match('.+?(?=\{)')[0];
            _self._tileServerCloudUrl = url;
          }
          if (_self.options.loadGoogle) {
            init_googleMap.call(_self);
            generateFloorsArray.call(_self);
          }
          return this;
        });
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method changeFloor
   * @description handles floor change
   * @param {int} floor floor number to which user wants to switch
   * @memberof IntripperMap
   */
  IntripperMap.prototype.changeFloor = function(floor, showEntireRoute) {
    var _self = this;
    try {
      if(showEntireRoute==null)showEntireRoute=true;
      return new Promise(function(resolve, reject) {
        removeMapAreaInfoWindow.call(_self);
        _self._googleMap.overlayMapTypes.pop();
        _self._displayedFloor = floor;
        tilesHandling.call(_self);
        /**
         * @event floorChanged
         * @description  Floor changed event
         * @returns {int} current floor index
         * @memberof IntripperMap
         */
        _self.options.floorChanged.call(_self, _self._displayedFloor);
        pubsub.publish("floorChange", "hello world!");
        if (_self.options.customFloorSelector == false) {
          $("#floorSelector li").removeClass('active');
          $("#floorSelector li[data-level=" + floor + "]").addClass('active');
        }
        if (_self._routeArray) {
          clearPath.call(_self);
          if (_self.options.drawPath) {
            _self.plotRoute(showEntireRoute);
          }
        }
        resolve(_self);
      });
    } catch (error) {
      console.log(error);
    }
  }
  IntripperMap.prototype.setCurrentFloor = function(floor) {
    var _self = this;
    try {
      _self._displayedFloor = parseInt(floor);
      return;
    } catch (error) {
      console.log(error);
    }
  }
  IntripperMap.prototype.getCurrentFloor = function() {
    var _self = this;
    try {
      return _self._displayedFloor;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method exitNavigation
   * @description handles navigation exit
   * @memberof IntripperMap
   */
  IntripperMap.prototype.exitNavigation = function() {
    var _self = this;
    try {
      clearPath.call(_self);
      _self._routeArray = null;
      _self._pathSegmentListSorted = [];
      return;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @method findRoute
   * @description Finds path from start point to end point.
   * @param {float} lat1 latitude of source
   * @param {float} lon1 longitude of source
   * @param {int} level1 floor number of source
   * @param {float} lat2 latitude of destination
   * @param {float} lon2 longitude of destination
   * @param {int} level2 floor number of destination
   * @param {boolean} retRouteArray (optional) if set to true, the method returns the raw route array
   * @memberof IntripperMap
   */
  IntripperMap.prototype.findRoute = function(objIntripperPath, lat1, lon1, level1, lat2, lon2, level2, retRouteArray, usestore, cropentrance) {
    var _self = this;
    try {
      if (usestore == null) {
        usestore = 1;
      }
      if (cropentrance == null) {
        cropentrance = 0;
      }
      if (retRouteArray == null) {
        retRouteArray = 0;
      }
      var pathSegmentList = [];
      _self._pathSegmentList = [];
      var post = {};
      post["method"] = "searchroute";
      post["id"] = this.options.mapid;
      post["lat1"] = lat1;
      post["lon1"] = lon1;
      post["level1"] = level1;
      post["lat2"] = lat2;
      post["lon2"] = lon2;
      post["level2"] = level2;
      post["usestore"] = usestore;
      post["cropenterance"] = cropentrance;
      post["lng"] = _self.options.languageCode;
      var strURL = this.options.baseURL + endpoint_variable;
      var jqxhr = $.getJSON(strURL, post)
        .done(function(data) {
          if (data.features.length > 0) {
            _self._IntripperPath = objIntripperPath;
            _self._routeArray = data;
            _self._pathSegmentList = [];

            var args = {};

            var sourceIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(lat1, lon1), level1);
            var destIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(lat2, lon2), level2);
            args.source=sourceIntripperMapAreaObj;
            args.destination=destIntripperMapAreaObj;
            pubsub.publish("findRouteCompleted", args);
            if(isEmpty(_self.destCentroid)){
              var locationObj = {};
              locationObj.lat=lat2;
              locationObj.lng= lon2;
              _self.destCentroid = locationObj;
            }
            if(isEmpty(_self.sourceCentroid)){
              var locationObj = {};
              locationObj.lat=lat1;
              locationObj.lng= lon1;
              _self.sourceCentroid = locationObj;
            }
            //create path segments
            $.each(data.features, function(index, item) {
              var objIntripperPathSegment = new IntripperPathSegment();
              objIntripperPathSegment.setIndex(item.properties['index']);
              objIntripperPathSegment.setInstruction(item.properties['instruction']);
              objIntripperPathSegment.setLevel(item.properties['level']);
              objIntripperPathSegment.setCoordinates(item.geometry['coordinates']);
              objIntripperPathSegment.setInstructionIcon(item.properties['icon']);
              objIntripperPathSegment.setDistance(item.properties['distance']);
              _self._pathSegmentList.push(objIntripperPathSegment);
              pathSegmentList.push(objIntripperPathSegment);
            });
            generatePathSegmentsArray.call(_self, _self._pathSegmentList);
            setFloorTransition.call(_self, calculateFloorTransition.call(_self, pathSegmentList[0].getLevel(), pathSegmentList[pathSegmentList.length - 1].getLevel()));
            var totalDistMtrs = 0;
            totalDistMtrs = calculateTotalDistanceMtrs.call(_self, pathSegmentList);
            var totalTime = 0;
            if (_self.options.distanceUnit == 'meters') {
              setTotalRouteDistance.call(_self, totalDistMtrs);
              totalTime = calculateTimeFromMtrsDistance.call(_self, totalDistMtrs);
            } else if (_self.options.distanceUnit == 'feet') {
              var totalDistFeet = convertMtrsToFeet.call(_self, totalDistMtrs);
              setTotalRouteDistance.call(_self, totalDistFeet);
              totalTime = calculateTimeFromFeetDistance.call(_self, totalDistFeet);
            }
            setTotalRouteTime.call(_self, totalTime);
            var pathsegmentListSorted;
            var pathsegmentListSortedArray = [];
            $.each(_self._pathSegmentListSorted, function(index, value) {
              pathsegmentListSorted = new IntripperPathSegmentList();
              pathsegmentListSorted.level = value.level;
              pathsegmentListSorted.instructions = value.instructions;
              pathsegmentListSorted.indexInfo = value.indexInfo;
              pathsegmentListSorted.instructionSetIndex = value.instructionSetIndex;
              pathsegmentListSortedArray.push(pathsegmentListSorted);
            });
            /**
             * @event pathFindingCompleted
             * @description  Path finding completed event
             * @returns {Array} Array of IntripperPathSegment objects
             * @memberof IntripperMap
             */
            if (retRouteArray) {
               _self.options.pathFindingCompleted.call(_self, _self._routeArray);
              // _self.options.pathFindingCompleted.call(_self, pathsegmentListSortedArray);
            } else {
              //_self.options.pathFindingCompleted.call(_self, pathSegmentList);
              _self.options.pathFindingCompleted.call(_self, pathsegmentListSortedArray);
            }

            if (_self.options.drawPath) {
              if (level1 != _self._displayedFloor) {
                _self.changeFloor(level1);
              } else {
                _self.plotRoute();
              }
            }
          } else {
            /**
             * @event pathFindingFailed
             * @description  Path finding failed event
             * @returns {Array} Array of IntripperPathSegment objects
             * @memberof IntripperMap
             */
            _self.options.pathFindingFailed.call(_self, pathSegmentList);
          }

        })
        .fail(function() {
          _self.options.pathFindingFailed.call(_self, pathSegmentList);
        });
    } catch (error) {
      console.log(error);
    }
  }

  function getInstructionSetIndexFromIndex(index) {
    var instructionSetIndex = 0;
    try {
      return instructionSetindex;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method stepToInstruction
   * @description Highlights segment of polyline of the index passed
   * @param {int} index index of the instruction
   * @memberof IntripperMap
   */
  IntripperMap.prototype.stepToInstruction = function(index) {
    var _self = this;
    var pathCoordinates = [];
    var bounds;
    try {
      var currentPathSegment = _self._pathSegmentList[index];
      var coordinates = currentPathSegment.getCoordinates();
      _self.bounds = new google.maps.LatLngBounds();
      if (currentPathSegment.getLevel() != _self._displayedFloor) {
        _self.changeFloor(currentPathSegment.getLevel(), false);
      }
      toggleAllPolylineVisibility.call(_self, currentPathSegment.instructionSetIndex);
      removePathHighlight.call(_self);
      for (var counter = 0; counter < coordinates.length; counter++) {
        var locationObj = {};
        locationObj.lat = coordinates[counter][1];
        locationObj.lng = coordinates[counter][0];
        latlng = new google.maps.LatLng(coordinates[counter][1], coordinates[counter][0]);
        pathCoordinates.push(locationObj);
        _self.bounds.extend(locationObj);
      }
      highlightedPathBorderOptions = {
        path: pathCoordinates,
        strokeColor: _self._IntripperPath.pathOptions.highlightBorder.color,
        strokeOpacity: 1.0,
        strokeWeight: _self._IntripperPath.pathOptions.border.weight,
        zIndex: 2
      };
      _self.highlightedOuterPath = new google.maps.Polyline(highlightedPathBorderOptions);
      highlightedPathOptions = {
        path: pathCoordinates,
        strokeColor: _self._IntripperPath.pathOptions.highlightPath.color,
        strokeOpacity: 1.0,
        strokeWeight: _self._IntripperPath.pathOptions.path.weight,
        zIndex: 3
      };
      _self.highlightedPath = new google.maps.Polyline(highlightedPathOptions);
      _self.highlightedOuterPath.setMap(_self._googleMap);
      _self.highlightedPath.setMap(_self._googleMap);
      setTimeout(function() {
        _self._googleMap.fitBounds(_self.bounds);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method stepToInstructionSet
   * @description Highlights instruction set
   * @param {int} index index of the instruction set
   * @memberof IntripperMap
   */
  IntripperMap.prototype.stepToInstructionSet = function(instructionIndex) {
    var _self = this;
    var pathCoordinates = [];
    var bounds;
    var currentInnerPath = [];
    var matchedPolyline;
    var polylineBounds;
    try {
      if (_self._pathSegmentListSorted != null) {
        currentInnerPath = $.grep(_self._pathSegmentListSorted, function(element, index) {
          return element.instructionSetIndex == parseInt(instructionIndex);
        });
      }
      _self.bounds = new google.maps.LatLngBounds();
      if (currentInnerPath[0] != null) {
        if (parseInt(currentInnerPath[0].level) != _self._displayedFloor) {
          _self.changeFloor(currentInnerPath[0].level, false).then(function(response) {
            if (instructionIndex == null) {
              if (_self._polylineArray.innerPaths[0] != null) {
                polylineBounds = _self._polylineArray.innerPaths[0].innerPathPolyLine.getBounds();
              }
            } else {
              matchedPolyline = $.grep(_self._polylineArray.innerPaths, function(element, index) {
                return element.instructionSetIndex == instructionIndex;
              });
              toggleAllPolylineVisibility.call(_self, instructionIndex);
              if (matchedPolyline[0] != null) {
                polylineBounds = matchedPolyline[0].innerPathPolyLine.getBounds();
              }
            }
          });
        } else {
          matchedPolyline = $.grep(_self._polylineArray.innerPaths, function(element, index) {
            return element.instructionSetIndex == instructionIndex;
          });
          toggleAllPolylineVisibility.call(_self, instructionIndex);
          if (matchedPolyline[0] != null) {
            polylineBounds = matchedPolyline[0].innerPathPolyLine.getBounds();
          }
        }
        var mapDim = {
          height: _self.options.map.clientHeight,
          width: (_self.options.map.clientWidth / 2.5)
        };
        setTimeout(function() {
          if (!polylineBounds.isEmpty()) {
            _self._googleMap.fitBounds(polylineBounds);
            var boundsZoomLevel = getBoundsZoomLevel(polylineBounds, mapDim);
            _self._googleMap.setZoom(boundsZoomLevel);
          }
        }, 1000);
        removePathHighlight.call(_self);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function toggleAllPolylineVisibility(instructionSetIndex){
    var _self = this;
    try{
    $.each(_self._snazzyMarkersArray, function(index, marker) {
      if(parseInt(marker._marker.instructionSetIndex) != parseInt(instructionSetIndex)){
        marker.setMap(null);
      }
      else{
        if(marker._marker.getMap()==null){
            marker.setMap(_self._googleMap);
        }
      }
    });
    $.each(_self._routeMarkers, function(index, marker) {
      if(parseInt(marker.instructionSetIndex) != parseInt(instructionSetIndex)){
        marker.setMap(null);
      }
      else{
        if(marker.getMap()==null){
            marker.setMap(_self._googleMap);
        }
      }
    });
    $.each(_self._polylineArray.innerPaths, function(index, path) {
      if(path.instructionSetIndex != parseInt(instructionSetIndex)){
        if(path.innerPathPolyLine.getMap()!=null){
          removePolyline.call(_self, path.innerPathPolyLine);
        }
      }
      else{
        addPolyLine.call(_self, path.innerPathPolyLine, _self._googleMap);
      }
    });
    $.each(_self._polylineArray.outerPaths, function(index, path) {
      if(path.instructionSetIndex != parseInt(instructionSetIndex)){
        if(path.outerPathPolyLine.getMap()!=null){
          removePolyline.call(_self, path.outerPathPolyLine);
        }
      }
      else{
        addPolyLine.call(_self, path.outerPathPolyLine, _self._googleMap);
      }
    });
  } catch (error) {
    console.log(error);
  }
  }

  // Private Methods
  function extendDefaults(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }

  function appendScript(filepath) {
    try {
      if ($('head script[src="' + filepath + '"]').length > 0)
        return;
      var ele = document.createElement('script');
      ele.setAttribute("type", "text/javascript");
      ele.setAttribute("src", filepath);
      $('head').append(ele);
    } catch (error) {
      console.log(error);
    }
  }

  function setBaseUrl(apiEnvironmentCode) {
    var _self = this;
    try {
      switch (apiEnvironmentCode) {
        case 1:
          _self.options.baseURL = "https://api.intripper.com/dev/bin/";
          _self.options.assetURL = "https://api.intripper.com/dev/asset/";
          break;
        case 2:
          _self.options.baseURL = "https://api.intripper.com/stage/bin/";
          _self.options.assetURL = "https://api.intripper.com/stage/asset/";
          break;
        case 3:
          _self.options.baseURL = "https://api.intripper.com/v15/bin/";
          _self.options.assetURL = "https://api.intripper.com/v15/asset/";
          break;
        default:
          _self.options.baseURL = "https://api.intripper.com/v15/bin/";
          _self.options.assetURL = "https://api.intripper.com/v15/asset/";
      }
    } catch (error) {
      console.log(error);
    }
  }

  function addMapClickListener() {
    var _self = this;
    try {

        _self._googleMap.addListener('click', function(e) {
          var obj = {
            name: 'clicked'
          };
            if(_self.options.isMapClickEnabled){
              getTappedArea.call(_self, e.latLng);
            }
        });

    } catch (error) {
      console.log(error);
    }
  }

  function getMapAreaContainsPoint(latLng, level) {
    var _self = this;
    try {
      var mapAreaList = _self._objIntripperVenueInfo.getMapAreaList();
      var objMapArea;
      var objClickedMapArea = {};
      var mapAreaCoordinates = [];
      var location;
      var mapAreaPoly;
      // mapAreaList = $.grep(mapAreaList, function(index, value){
      //   return value.level == _self._displayedFloor;
      // });
      for (var counter = 0; counter < mapAreaList.length; counter++) {
        var bounds;
        objMapArea = mapAreaList[counter];
        if (objMapArea.floor == level) {
          mapAreaCoordinates = [];
          for (var innerCounter = 0; innerCounter < objMapArea.coordinates.length; innerCounter++) {
            location = {
              lat: parseFloat(objMapArea.coordinates[innerCounter][1]),
              lng: parseFloat(objMapArea.coordinates[innerCounter][0])
            };
            mapAreaCoordinates.push(location);
          }
          mapAreaPoly = new google.maps.Polygon({
            paths: mapAreaCoordinates
          });
          if (google.maps.geometry.poly.containsLocation(latLng, mapAreaPoly)) {
            objClickedMapArea = objMapArea;
            break;
          }
        }
      }
      return objClickedMapArea;
    } catch (error) {
      console.log(error);
    }
  }

  function getTappedArea(latLng) {
    var _self = this;
    try {
      var mapAreaList = _self._objIntripperVenueInfo.getMapAreaList();
      var objMapArea;
      var objClickedMapArea = {};
      var mapAreaCoordinates = [];
      var location;
      var mapAreaPoly;
      for (var counter = 0; counter < mapAreaList.length; counter++) {
        var bounds;
        objMapArea = mapAreaList[counter];
        if (objMapArea.floor == _self._displayedFloor) {
          mapAreaCoordinates = [];
          for (var innerCounter = 0; innerCounter < objMapArea.coordinates.length; innerCounter++) {
            location = {
              lat: parseFloat(objMapArea.coordinates[innerCounter][1]),
              lng: parseFloat(objMapArea.coordinates[innerCounter][0])
            };
            mapAreaCoordinates.push(location);
          }
          mapAreaPoly = new google.maps.Polygon({
            paths: mapAreaCoordinates
          });
          if (google.maps.geometry.poly.containsLocation(latLng, mapAreaPoly)) {
            objClickedMapArea = objMapArea;
            break;
          }
        }
      }
      /**
       * @event mapClick
       * @description Map click event
       * @returns {Object} IntripperMapArea object which was clicked on if any found else empty object, google.maps.LatLng class object of clicked point
       * @memberof IntripperMap
       */
      _self.options.mapClick.call(_self, objClickedMapArea, latLng);
      if (!isEmpty(objClickedMapArea)) {
        _self._googleMap.panTo({
          lat: parseFloat(objClickedMapArea.getAreaCentreLat()),
          lng: parseFloat(objClickedMapArea.getAreaCentreLng())
        });
        if (_self.options.customInfoWindow == false) {
          showInfoWindow.call(_self, objClickedMapArea, latLng);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function isEmpty(obj) {
    try {
      return Object.keys(obj).length === 0;
    } catch (error) {
      console.log(error);
    }
  }

  function showInfoWindow(area, coordinates) {
    var _self = this;
    var strImageURL = 'https://api.intripper.com/mapasset/blank.png';
    try {
      var image = {
        url: strImageURL,
        origin: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(35, 35),
      };
      var storeMarker = new google.maps.Marker({
        map: _self._googleMap,
        icon: image,
        position: {
          lat: parseFloat(area.getAreaCentreLat()),
          lng: parseFloat(area.getAreaCentreLng())
        }
      });
      if (area.getAreaLogo()) {
        itemLogo = area.getAreaLogo();
      } else {
        itemLogo = 'https://api.intripper.com/mapasset/blank.png';
      }
      removeMapAreaInfoWindow.call(this);
      var strAreaName = '';
      var strAreaDetail = '';
      strAreaName = area.getAreaNameLanguage();
      strAreaDetail = area.getAreaDescriptionLanguage();
      _self._mapareaInfoWindow = new SnazzyInfoWindow({
        marker: storeMarker,
        content: '' +
          '<div class="infoImg"><img alt="" class="logo-infowindow" src="' + itemLogo + '">' +
          '<span class="storename-infowindow">' + strAreaName + '</span></div>',
        offset: {
          top: _self.options.infowindowOptions.offset.top
        },
        padding: _self.options.infowindowOptions.padding,
        fontColor: _self.options.infowindowOptions.fontColor,
        backgroundColor: _self.options.infowindowOptions.backgroundColor,
        borderRadius: _self.options.infowindowOptions.borderRadius,
        border: {
          width: _self.options.infowindowOptions.border.width,
          color: _self.options.infowindowOptions.border.color
        },
        pointer: _self.options.infowindowOptions.pointer,
        shadow: _self.options.infowindowOptions.shadow,
        showCloseButton: true,
        closeOnMapClick: true,
        callbacks: {
          close: function() {},
        }
      });
      _self._mapareaInfoWindow.open();
    } catch (error) {
      console.log(error);
    }
  }

  function init_googleMap() {
    var _self = this;
    var mapCenter = {};
    var map;
    try {
      mapCenter = {
        lat: parseFloat(_self._mapData.lat),
        lng: parseFloat(_self._mapData.lng)
      };
      var myLatlng = new google.maps.LatLng(mapCenter.lat, mapCenter.lng);
      //var _minZoomLevel = _self._mapData.minzoom;
      if (_self._mapData.hasOwnProperty('minzoom')) {
        _self._minZoom = _self._mapData.minzoom;
      } else {
        _self._minZoom = 17;
      }
      if (_self._mapData.hasOwnProperty('maxzoom')) {
        _self._maxZoom = _self._mapData.maxzoom;
      } else {
        _self._maxZoom = 22;
      }
      var myOptions = {
        zoom: _self.options.initialZoom,
        maxZoom: _self._maxZoom,
        center: myLatlng,
        streetViewControl: false,
        disableDefaultUI: true,
        zoomControl: true,
        draggableCursor: 'default',
        gestureHandling: 'greedy',
        mapTypeControlOptions: {
          mapTypeIds: []
        },
        styles: [{
            "elementType": "labels",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "administrative.neighborhood",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "landscape.man_made",
            "stylers": [{
              "visibility": "off"
            }]
          },
          {
            "featureType": "poi.business",
            "elementType": "geometry.fill",
            "stylers": [{
              "visibility": "off"
            }]
          }
        ]
      };
      map = new google.maps.Map(_self.options.map, myOptions);
      globalVar = 'I am updated';
      _self._googleMap = map;
      google.maps.Polyline.prototype.getBounds = function() {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function(item, index) {
          bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
        });
        return bounds;
      };
      _self._tileServerCloudUrl = _self._tileServerCloudUrl + _self.options.mapid + '/';
      if(_self._mapData.bounds!=null){
        _self._googleMapBounds = new google.maps.LatLngBounds();
        $.each(_self._mapData.bounds, function(index, element){
          _self._googleMapBounds.extend(new google.maps.LatLng(element[0],element[1]));
        });
        // mapBounds.extend(new google.maps.LatLng(mapBounds[1][0],mapBounds[1][1]));
        // mapBounds.extend(new google.maps.LatLng(mapBounds[2][0],mapBounds[2][1]));
        // mapBounds.extend(new google.maps.LatLng(mapBounds[3][0],mapBounds[3][1]));
        if(_self.options.isAddBounds){
          _self._googleMap.addListener('dragend', function () {
            if (_self._googleMapBounds.contains(_self._googleMap.getCenter())) return;
             var mapCenter = _self._googleMap.getCenter(),
                 mapLat = mapCenter.lng(),
                 mapLng = mapCenter.lat(),
                 maxX = _self._googleMapBounds.getNorthEast().lng(),
                 maxY = _self._googleMapBounds.getNorthEast().lat(),
                 minX = _self._googleMapBounds.getSouthWest().lng(),
                 minY = _self._googleMapBounds.getSouthWest().lat();
                 if(mapLat < minX || mapLat > maxX || mapLng < minY || mapLng > maxY) {
                     if (mapLat < minX) mapLat = minX;
                     if (mapLat > maxX) mapLat = maxX;
                     if (mapLng < minY) mapLng = minY;
                     if (mapLng > maxY) mapLng = maxY;
                     _self._googleMap.setCenter(new google.maps.LatLng(mapLng, mapLat));
                  }
          });
        }
      }
      buildTileArray.call(this).then(function(response) {
        tilesHandling.call(_self);
      });
      return _self;
    } catch (error) {
      console.log(error);
    }
  }

  function addDefaultSearchBar() {
    var _self = this;
    try {
      if (_self.options.isDefaultSearchBarEnabled) {
        var strDefaultSearchBar =
          '<div id="Searchcontainer">' +
          '<form id="search_navigation" name="search_navigation" class="search-container">' +
          '<div class="search-content">' +
          '<input class="initialSearch" id="initialSearch" name="initialSearch" type="search" placeholder="" autocomplete="on">' +
          '<span id="no-result-source" class="hidden">No Result Found</span>' +
          '<div class="search-loader"></div>' +
          '</div>' +
          '<div id="directionIcon" class="directioniconclose" data-toggle="tooltip" data-placement="bottom" title="Directions" directionIcon>' +
          '<i class="mdi mdi-close md-light" style="color:#acacac;"></i>' +
          '</div>' +
          '<div id="directionLoader">' +
          '<img class="img-responsive" src="../assets/images/image-loader.gif"/>' +
          '</div>' +
          '</form>' +
          '</div>';
        if (_self.options.searchBarAppendTo != "" && _self.options.searchBarAppendTo != null) {
          var selector = '#' + _self.options.searchBarAppendTo;
          if ($(selector) != null) {
            $(selector).append(strDefaultSearchBar);
          }
        } else {
          $('body').append(strDefaultSearchBar);
        }
        $('#directionIcon').hide();
        $('#Searchcontainer').show();
        //$('#initialSearch').val('');
        $.ui.autocomplete.prototype._renderItem = function(ul, item) {

          item.poiName = item.poiName.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
          return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<a>" + item.poiName + "<br/><small style='color:#4285F4;'>Level (" + item.floor + ")</small></a>")
            .appendTo(ul);
        };
        $("#initialSearch").autocomplete({
          highlightClass: "bold-text",
          open: function(event, ui) {
            searchObj = {};

            $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
            $('.search-loader').hide();
          },
          search: function(event, ui) {
            $('.search-loader').show();
          },
          source: function(request, response) {
            var deferred = $.Deferred();
            var objSearchTask = {};
            objSearchTask = new IntripperSearchTask({
              searchCompleted: onSearchCompleted,
              searchfailed: onSearchFailed
            });

            function onSearchCompleted(result) {
              deferred.resolve(result);
              response(result);
            }

            function onSearchFailed() {
              deferred.reject("Invalid data.");
            }
            objSearchTask.SearchPOI(request.term.toLowerCase(), mapid);
            deferred.always(function() {});
          },
          minLength: 2,
          select: function(event, selectedObj) {
            var searchObj = selectedObj;
            //$('#initialSearch').val((searchObj.item.getAttributeValue('attrs-store')).replace(/<\/?strong>/g, ""));
            //var poi = _self.findPOIOnMap(searchObj.item.getAttributeValue('IID'),searchObj.item.getAttributeValue('level'));
            searchResult.call(_self, searchObj.item);

          },
          response: function(event, ui) {
            if (!ui.content.length) {
              //$("#no-result-search").show();

              $('.search-loader').hide();
            } else {
              //$("#no-result-search").hide();
              $('.search-loader').hide();
            }
          }
        });

      }

    } catch (error) {
      console.log(error);
    }
  }

  function searchResult(item) {
    try {
      var _self = this;
      $('#initialSearch').val((item.getAttributeValue('attrs-store')).replace(/<\/?strong>/g, ""));
      var poi = _self.findPOIOnMap(item.getAttributeValue('IID'), item.getAttributeValue('level'));
    } catch (error) {
      console.log(error);
    }
  }

  function generateFloorsArray() {
    var _self = this;
    var floorObj = {};
    var floorArray = [];
    try {
      $.each(_self._mapData.floor, function(key, item) {
        var objFloorInfo = new IntripperFloorInfo();
        objFloorInfo.setFloorNumber(item.floor);
        objFloorInfo.setFloorName(item.name);
        floorArray.push(objFloorInfo);
      });
      _self._objIntripperVenueInfo.setFloorInfoList(floorArray);
      if (_self.options.customFloorSelector == false) {
        var strFloorSelector = '<ul id="floorSelector"></ul>';
        if (_self.options.floorSelectorAppendTo != "" && _self.options.floorSelectorAppendTo != null) {
          var selector = '#' + _self.options.floorSelectorAppendTo;
          if ($(selector) != null) {
            $(selector).append(strFloorSelector);
          }
        } else {
          $('body').append(strFloorSelector);
        }
        $('#floorSelector').html('');
        $.each(_self._objIntripperVenueInfo.getFloorInfoList().reverse(), function(i, obj) {
          $('#floorSelector').append("<li class='list-group-item list-group-item-" + obj.getFloorNumber() + "' value='" + obj.getFloorNumber() + "' data-level='" + obj.getFloorNumber() + "'>" + obj.getFloorName() + "</li>");
        });
        $("#floorSelector li").last().addClass('active level-zero');
        var mapId = '#' + _self.options.map.id;
        $("#floorSelector").css({
          'top': ($(mapId).height() / 2) - ($("#floorSelector").height() / 2),
          'bottom': 'auto'
        });

        //zw
        var strLogo = '<a href=' + _self._intripperUrl + ' target="_blank" id="map-logo"> <img class="img-responsive" src="' + _self._intripperLogoUrl + '"/></a>';
        if (_self.options.floorSelectorAppendTo != "" && _self.options.floorSelectorAppendTo != null) {
          var selector = '#' + _self.options.floorSelectorAppendTo;
          if ($(selector) != null) {
            $(selector).append(strLogo);
          }
        } else {
          $('body').append(strLogo);
        }
        $("#floorSelector").on("click", '.list-group-item', function(e) {
          /**
           * @event floorSelectorClicked
           * @description floor selector Click event
           * @returns int floor
           * @memberof Intrippermap
           */
          return;
          _self.options.floorSelectorClicked.call(_self, e.currentTarget.value);
          _self.changeFloor(e.currentTarget.value, true);
        });
        $("#floorSelector").show();
      }
      return this;
    } catch (error) {
      console.log(error);
    }
  }

  function clearPath() {
    var _self = this;
    try {
      removeMapAreaInfoWindow.call(this);
      removePath.call(_self);
      removePathHighlight.call(_self);
      if (_self._polylineArray != null) {
        $.each(_self.lineAnimationInterval, function(index, element) {
          window.clearInterval(element);
        });
      }
      return;
    } catch (error) {
      console.log(error);
    }
  }

  function removePath() {
    var _self = this;
    try {
      removeMapAreaInfoWindow.call(this);
      if (_self._polylineArray != null) {
        if (_self._polylineArray.outerPaths != null) {
          $.each(_self._polylineArray.outerPaths, function(index, value) {
            value.outerPathPolyLine.setMap(null);
          });
        }
      }
      if (_self._polylineArray != null) {
        if (_self._polylineArray.innerPaths != null) {
          $.each(_self._polylineArray.innerPaths, function(index, value) {
            value.innerPathPolyLine.setMap(null);
          });
        }
      }
      //markers
      if (_self._routeMarkers != null) {
        $.each(_self._routeMarkers, function(index, value) {
          value.setMap(null);
        });
      }
      // if (_self.startMarker != null) {
      //   _self.startMarker.setMap(null);
      // }
      // if (_self.endMarker != null) {
      //   _self.endMarker.setMap(null);
      // }
      removeSnazzyMarkers.call(_self);
      //removeFloorChangeMarkers.call(_self);
    } catch (error) {
      console.log(error);
    }
  }

  function removeSnazzyMarkers() {
    var _self = this;
    try {
      if (_self._snazzyMarkersArray != null) {
        $.each(_self._snazzyMarkersArray, function(index, item) {
          item.setMap(null);
        });
      }
      _self._snazzyMarkersArray = [];
    } catch (error) {
      console.log(error);
    }
  }

  function removeMapAreaInfoWindow() {
    var _self = this;
    try {
      if (_self._mapareaInfoWindow != null) {
        _self._mapareaInfoWindow.close();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function removeFloorChangeMarkers() {
    var _self = this;
    try {
      $.each(_self._floorChangeMarkersArray, function(index, item) {
        item.setMap(null);
      });
      _self._floorChangeMarkersArray = [];
    } catch (error) {
      console.log(error);
    }
  }

  function removePathHighlight() {
    var _self = this;
    try {
      if (_self.highlightedPath) {
        _self.highlightedPath.setMap(null);
      }
      if (_self.highlightedOuterPath) {
        _self.highlightedOuterPath.setMap(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function buildTileArray() {
    var _self = this;
    try {
      return new Promise(function(resolve, reject) {
        _self._mapTileIdArray = [];
        _self._mapTileCloudIdArray = [];
        _self._tileSetObjArray = [];
        _self._cloudTileSetArray = [];
        $.each(_self._mapData.floor, function(key, value) {
          if (_self._mapData.hasOwnProperty("tileurl")) {
            var tileObject = {};
            tileObject.intripperCloudID = value.fileName;
            tileObject.floor = value.floor;
            _self._mapTileCloudIdArray.push(tileObject);
          }
          var mbTileObj = {};
          mbTileObj.floor=value.floor;
          mbTileObj.tileId = value.fileName;
          _self._mapTileIdArray.push(mbTileObj);
          //_self._mapTileIdArray.push(value.fileName);

          $.each(value.tileSetArray, function(key1, value1) {
            var tilesetObject = {};
            tilesetObject.zoomLevels = value1.zoom;
            tilesetObject.floor = value.floor;
            if (_self._mapData.hasOwnProperty("tileUrl")) {
              tilesetObject.intripperCloudID = value1.tileid;
              _self._cloudTileSetArray.push(tilesetObject);
            } else {
              tilesetObject.tileid = value1.tileid;
              _self._tileSetObjArray.push(tilesetObject);
            }
          });
        });
        resolve(_self);
      });
    } catch (error) {
      console.log(error);
    }

  }

  function renderTileOnGoogleMap(tileid, tileServerUrl, isMapboxTile) {
    var _self = this;
    try {
      var map = _self.getBaseGoogleMap();
      this._imageMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          if (zoom < _self.getMinZoom() || zoom > _self.getMaxZoom()) {
            return null;
          }
          if (isMapboxTile) {
            return [tileServerUrl, tileid, '/', zoom, '/', coord.x, '/', coord.y, '@2x.png?access_token=', _self._mapData.maptoken].join('');
          } else {
            return [tileServerUrl, tileid, '/', zoom, '/', coord.x, '/', coord.y, '.png'].join('');
          }

        },
        minZoom: _self.getMinZoom(),
        maxZoom: _self.getMaxZoom()
      });
      this._googleMap.overlayMapTypes.push(this._imageMapType);
    } catch (error) {
      console.log(error);
    }
  }

  function tilesHandling() {
    var hasTileSet;
    var hasCloudTileSet;
    var _self = this;
    var tileRendered = false;
    try {
      if (_self._cloudTileSetArray != null && _self._cloudTileSetArray.length > 0) {
        _self._isMapboxTile = false;
        hasTileSet = $.grep(_self._cloudTileSetArray, function(element, index) {
          return element.floor == _self._displayedFloor;
        });
        if (hasTileSet.length != '') {
          $.each(hasTileSet, function(key, value) {
            renderTileOnGoogleMap.call(_self, value.intripperCloudID, _self._tileServerCloudUrl, _self._isMapboxTile);
          });
          tileRendered = true;
        }
      }
      if (!tileRendered) {
        if (_self._mapTileCloudIdArray != null && _self._mapTileCloudIdArray.length > 0) {
          _self._isMapboxTile = false;
          hasCloudTileSet = $.grep(_self._mapTileCloudIdArray, function(element, index) {
            return element.floor == _self._displayedFloor;
          });
          if (hasCloudTileSet != null && hasCloudTileSet.length > 0) {
            renderTileOnGoogleMap.call(_self, hasCloudTileSet[0].intripperCloudID, _self._tileServerCloudUrl, _self._isMapboxTile);
            tileRendered = true;
          }
        }
      }
      if (!tileRendered) {
        if (_self._tileSetObjArray != null && _self._tileSetObjArray.length > 0) {
          _self._isMapboxTile = true;
          hasTileSet = $.grep(_self._tileSetObjArray, function(element, index) {
            return element.floor == _self._displayedFloor;
          });
          if (hasTileSet.length != '') {
            $.each(hasTileSet, function(key, value) {
              renderTileOnGoogleMap.call(_self, value.tileid, _self._tileServerUrl, _self._isMapboxTile);
            });
            tileRendered = true;
          }
        }
      }
      if (!tileRendered) {
        _self._isMapboxTile = true;
        var tileObj = $.grep(_self._mapTileIdArray, function(value, index){
          return parseInt(value.floor) == parseInt(_self._displayedFloor);
        });
        renderTileOnGoogleMap.call(_self, tileObj[0].tileId, _self._tileServerUrl, _self._isMapboxTile);
      }
      if (_self._objIntripperVenueInfo.getMapAreaList() == null || _self._objIntripperVenueInfo.getMapAreaList().length === 0) {
        getMapAreaList.call(_self);
      }
    } catch (error) {
      console.log(error);
    }
  }


  IntripperMap.prototype.plotRawRouteArray = function(objIntripperPath, lat1, lon1, level1, lat2, lon2, level2, routeArray, retRouteArray, usestore, cropentrance) {
    var _self = this;
    try {
      _self._routeArray = routeArray;
      if (usestore == null) {
        usestore = 1;
      }
      if (cropentrance == null) {
        cropentrance = 0;
      }
      if (retRouteArray == null) {
        retRouteArray = 0;
      }
      var pathSegmentList = [];
      _self._pathSegmentList = [];
        if (_self._routeArray.features.length > 0) {
          _self._IntripperPath = objIntripperPath;
          
          _self._pathSegmentList = [];
          var args = {};
          var sourceIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(lat1, lon1), level1);
          var destIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(lat2, lon2), level2);
          args.source=sourceIntripperMapAreaObj;
          args.destination=destIntripperMapAreaObj;
          pubsub.publish("findRouteCompleted", args);
          if(isEmpty(_self.destCentroid)){
            var locationObj = {};
            locationObj.lat=lat2;
            locationObj.lng= lon2;
            _self.destCentroid = locationObj;
          }
          if(isEmpty(_self.sourceCentroid)){
            var locationObj = {};
            locationObj.lat=lat1;
            locationObj.lng= lon1;
            _self.sourceCentroid = locationObj;
          }
          //create path segments
          $.each(_self._routeArray.features, function(index, item) {
            var objIntripperPathSegment = new IntripperPathSegment();
            objIntripperPathSegment.setIndex(item.properties['index']);
            objIntripperPathSegment.setInstruction(item.properties['instruction']);
            objIntripperPathSegment.setLevel(item.properties['level']);
            objIntripperPathSegment.setCoordinates(item.geometry['coordinates']);
            objIntripperPathSegment.setInstructionIcon(item.properties['icon']);
            objIntripperPathSegment.setDistance(item.properties['distance']);
            _self._pathSegmentList.push(objIntripperPathSegment);
            pathSegmentList.push(objIntripperPathSegment);
          });
          generatePathSegmentsArray.call(_self, _self._pathSegmentList);
          setFloorTransition.call(_self, calculateFloorTransition.call(_self, pathSegmentList[0].getLevel(), pathSegmentList[pathSegmentList.length - 1].getLevel()));
          var totalDistMtrs = 0;
          totalDistMtrs = calculateTotalDistanceMtrs.call(_self, pathSegmentList);
          var totalTime = 0;
          if (_self.options.distanceUnit == 'meters') {
            setTotalRouteDistance.call(_self, totalDistMtrs);
            totalTime = calculateTimeFromMtrsDistance.call(_self, totalDistMtrs);
          } else if (_self.options.distanceUnit == 'feet') {
            var totalDistFeet = convertMtrsToFeet.call(_self, totalDistMtrs);
            setTotalRouteDistance.call(_self, totalDistFeet);
            totalTime = calculateTimeFromFeetDistance.call(_self, totalDistFeet);
          }
          setTotalRouteTime.call(_self, totalTime);
          var pathsegmentListSorted;
          var pathsegmentListSortedArray = [];
          $.each(_self._pathSegmentListSorted, function(index, value) {
            pathsegmentListSorted = new IntripperPathSegmentList();
            pathsegmentListSorted.level = value.level;
            pathsegmentListSorted.instructions = value.instructions;
            pathsegmentListSorted.indexInfo = value.indexInfo;
            pathsegmentListSorted.instructionSetIndex = value.instructionSetIndex;
            pathsegmentListSortedArray.push(pathsegmentListSorted);
          });
          /**
           * @event pathFindingCompleted
           * @description  Path finding completed event
           * @returns {Array} Array of IntripperPathSegment objects
           * @memberof IntripperMap
           */
          // if (retRouteArray) {
          //     _self.options.pathFindingCompleted.call(_self, _self._routeArray);
          //   // _self.options.pathFindingCompleted.call(_self, pathsegmentListSortedArray);
          // } else {
          //   //_self.options.pathFindingCompleted.call(_self, pathSegmentList);
          //   _self.options.pathFindingCompleted.call(_self, pathsegmentListSortedArray);
          // }

          if (_self.options.drawPath) {
            if (level1 != _self._displayedFloor) {
              _self.changeFloor(level1);
            } else {
              _self.plotRoute();
            }
          }
        } else {
          /**
           * @event pathFindingFailed
           * @description  Path finding failed event
           * @returns {Array} Array of IntripperPathSegment objects
           * @memberof IntripperMap
           */
          _self.options.pathFindingFailed.call(_self, pathSegmentList);
        }

        
    } catch (error) {
      console.log(error);
    }
  }
  

  function generatePathSegmentsArray(pathSegmentList) {
    var _self = this;
    try {
      _self._pathSegmentListSorted = [];
      var instructionSetIndex = 0;
      var routeArrayLength = _self._routeArray.features.length;
      this.routePathCoordinates = [];
      this.plottedPathSegments = [];
      if (!_self._routeArray) {
        return;
      }
      var pathSegmentArrayLevelSort = [];
      var startIndex = 0;
      pathSegmentList[0].marker = 'start';
      $.each(pathSegmentList, function(index, item) {
        item.instructionSetIndex = instructionSetIndex;
        if (pathSegmentList[index + 1] != undefined) {
          if (item.getLevel() != pathSegmentList[index + 1].getLevel()) {
            var pathSegmentLevelObj = {};
            pathSegmentLevelObj.level = item.getLevel();
            if (startIndex != 0) {
              if (pathSegmentList[startIndex].getCoordinates().length > 2) {
                pathSegmentList[startIndex].getCoordinates().splice(0, 1);
              }
              pathSegmentList[startIndex].marker = 'floorchange';
              pathSegmentList[startIndex].floorchangeInfo = 'start';
              var transition = calculateFloorTransition.call(_self, pathSegmentList[startIndex].getLevel(), pathSegmentList[startIndex - 1].getLevel());
              pathSegmentList[startIndex].transitionInfo = transition;
              pathSegmentList[startIndex].fromInfo = {};
              pathSegmentList[startIndex].fromInfo.text = 'From L';
              pathSegmentList[startIndex].fromInfo.level = Math.abs(pathSegmentList[startIndex - 1].getLevel());
              pathSegmentList[startIndex].destinationIndex = startIndex - 1;
              pathSegmentList[startIndex].destinationInstructionSetIndex = instructionSetIndex - 1;
            }
            pathSegmentList[index].marker = 'floorchange';
            pathSegmentList[index].floorchangeInfo = 'end';
            var transition = calculateFloorTransition.call(_self, item.getLevel(), pathSegmentList[index + 1].getLevel());
            pathSegmentList[index].transitionInfo = transition;
            pathSegmentList[index].destinationIndex = index + 1;
            pathSegmentList[index].destinationInstructionSetIndex = instructionSetIndex + 1;
            pathSegmentLevelObj.instructions = pathSegmentList.slice(startIndex, index + 1);
            pathSegmentLevelObj.indexInfo = {};
            pathSegmentLevelObj.indexInfo.startIndex = startIndex;
            pathSegmentLevelObj.indexInfo.endIndex = index;
            var reformattedArray = pathSegmentLevelObj.instructions.map(obj => {
              var index = 0;
              index = obj.getIndex();
              return index;
            });
            pathSegmentLevelObj.indexInfo.indexRange = [];
            pathSegmentLevelObj.indexInfo.indexRange.push(reformattedArray);
            pathSegmentLevelObj.instructionSetIndex = instructionSetIndex;
            instructionSetIndex++;
            pathSegmentArrayLevelSort.push(pathSegmentLevelObj);
            _self._pathSegmentListSorted.push(pathSegmentLevelObj);
            startIndex = index + 1;
          }
        } else if (index == pathSegmentList.length - 1) {
          pathSegmentList[index].marker = 'end';
          var pathSegmentLevelObj = {};
          pathSegmentLevelObj.level = item.getLevel();
          if (startIndex != 0) {
            pathSegmentList[startIndex].marker = 'floorchange';
            var transition = calculateFloorTransition.call(_self, pathSegmentList[startIndex].getLevel(), pathSegmentList[startIndex - 1].getLevel());
            pathSegmentList[startIndex].transitionInfo = transition;
            pathSegmentList[startIndex].fromInfo = {};
            pathSegmentList[startIndex].fromInfo.text = 'From L';
            pathSegmentList[startIndex].floorchangeInfo = 'start';
            pathSegmentList[startIndex].fromInfo.level = Math.abs(pathSegmentList[startIndex - 1].getLevel());
            pathSegmentList[startIndex].destinationIndex = startIndex - 1;
            pathSegmentList[startIndex].destinationInstructionSetIndex = instructionSetIndex - 1;
          }
          pathSegmentLevelObj.instructions = pathSegmentList.slice(startIndex, index + 1);
          pathSegmentLevelObj.indexInfo = {};
          pathSegmentLevelObj.indexInfo.startIndex = startIndex;
          pathSegmentLevelObj.indexInfo.endIndex = index;
          var reformattedArray = pathSegmentLevelObj.instructions.map(obj => {
            var index = 0;
            index = obj.getIndex();
            return index;
          });
          pathSegmentLevelObj.indexInfo.indexRange = [];
          pathSegmentLevelObj.indexInfo.indexRange.push(reformattedArray);
          pathSegmentLevelObj.instructionSetIndex = instructionSetIndex;
          instructionSetIndex++;
          pathSegmentArrayLevelSort.push(pathSegmentLevelObj);
          _self._pathSegmentListSorted.push(pathSegmentLevelObj);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method plotRoute
   * @description Plots route
   * @memberof IntripperMap
   */
  IntripperMap.prototype.plotRoute = function(showEntireRoute) {
    var _self = this;
    try {
      _self._snazzyMarkersArray = [];
      _self._routeMarkers = [];
      _self.lineAnimationInterval = [];
      var pathPolyline;
      var outerPath;
      var outerPathOptions;
      var innerPath;
      var innerPathOptions;
      var arrowSymbol = {
        strokeColor: '#FFFFFF',
        scale: 2,
        zIndex: 10,
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
      };
      var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeColor: '#FFFFFF',
        strokeOpacity: 1,
        fillColor: '#FFFFFF',
        scale: 4
      };
      var planeSymbol = {
        path: 'M0.051948159933090265,1.2207792401313786 C-1.0496138400669093,1.2207792401313786 -1.9480518400669098,2.1192172401313787 -1.9480518400669098,3.220779240131378 L-1.9480518400669098,7.408279240131378 L-8.94805184006691,14.314529240131378 L-8.94805184006691,16.220779240131378 L-1.9480518400669098,12.783279240131378 L-1.9480518400669098,17.002029240131378 L-3.94805184006691,19.220779240131378 L-3.94805184006691,21.220779240131378 L-0.9480518400669098,20.220779240131378 L1.0519481599330902,20.220779240131378 L4.05194815993309,21.220779240131378 L4.05194815993309,19.220779240131378 L2.05194815993309,17.002029240131378 L2.05194815993309,12.783279240131378 L9.05194815993309,16.220779240131378 L9.05194815993309,14.314529240131378 L2.05194815993309,7.408279240131378 L2.05194815993309,3.220779240131378 C2.05194815993309,2.1192172401313787 1.1535111599330907,1.2207792401313786 0.051948159933090265,1.2207792401313786 z',
        strokeColor: '#fff',
        strokeOpacity: 1,
        fillColor: '#eb81a9',
        fillOpacity: 1,
        scale: 2
      };
      var walkingManSymbol = {
        path: 'M1.5714281499385834,0.9610389471054076 C0.4659591499385842,0.9610389471054076 -0.4285718500614175,1.855569947105408 -0.4285718500614175,2.9610389471054077 C-0.4285718500614175,4.066507947105408 0.4659591499385842,4.961038947105408 1.5714281499385834,4.961038947105408 C2.6768971499385827,4.961038947105408 3.5714281499385834,4.066507947105408 3.5714281499385834,2.9610389471054077 C3.5714281499385834,1.855569947105408 2.6768971499385827,0.9610389471054076 1.5714281499385834,0.9610389471054076 zM0.040178149938583485,5.992288947105408 C-0.16294685006141657,6.004007947105408 -0.3816968500614166,6.035257947105408 -0.5848218500614167,6.086038947105408 L-0.6160718500614166,6.086038947105408 L-2.7098218500614175,6.711038947105408 C-3.6277908500614173,6.972757947105407 -4.366071850061417,7.554788947105408 -4.866071850061417,8.304788947105408 L-6.272321850061417,10.398538947105408 L-4.584821850061417,11.523538947105408 L-3.2098218500614175,9.429788947105408 C-2.909040850061416,8.980569947105408 -2.627790850061416,8.754007947105407 -2.1473218500614175,8.617288947105408 L-1.1160718500614175,8.304788947105408 L-1.8348218500614175,11.648538947105408 C-2.034040850061416,12.347757947105407 -1.7332588500614161,13.054788947105408 -1.3348218500614166,13.554788947105408 L1.5089281499385834,16.679788947105408 L1.6651781499385834,16.867288947105408 L3.1651781499385834,20.961038947105408 L5.258928149938583,20.961038947105408 C4.860491149938582,19.961038947105408 3.876116149938584,17.472757947105407 3.4776781499385834,16.273538947105408 L1.1339281499385834,12.867288947105408 L1.0714281499385834,12.554788947105408 L1.7901781499385834,9.336038947105408 L2.1339281499385834,10.117288947105408 C2.141741149938584,10.140726947105408 2.157366149938584,10.156351947105408 2.1651781499385834,10.179788947105408 C2.5831471499385827,11.222757947105407 3.4464281499385834,11.941507947105407 4.415178149938583,12.304788947105408 L4.446428149938583,12.304788947105408 L6.258928149938583,12.898538947105408 L6.883928149938583,11.023538947105408 L5.133928149938583,10.429788947105408 C5.114397149938583,10.421976947105408 5.118303149938583,10.406351947105408 5.102678149938583,10.398538947105408 C4.524553149938583,10.171976947105408 4.196428149938583,9.902444947105408 4.008928149938583,9.398538947105408 L4.008928149938583,9.367288947105408 L3.9776781499385834,9.336038947105408 L3.4151781499385834,8.117288947105408 C3.407366149938584,8.093851947105408 3.391741149938584,8.078226947105408 3.3839281499385834,8.054788947105408 L3.3526781499385834,8.054788947105408 C2.8175221499385827,6.711038947105408 1.4620531499385834,5.9024449471054075 0.040178149938583485,5.992288947105408 zM-2.2410718500614175,14.273538947105408 L-3.1160718500614175,17.148538947105408 L-6.116071850061417,20.961038947105408 L-3.8348218500614175,20.961038947105408 L-1.5223218500614166,18.367288947105408 L-0.7410718500614175,15.961038947105408 z',
        strokeColor: '#fff',
        strokeOpacity: 1,
        fillColor: '#eb81a9',
        fillOpacity: 1,
        scale: 2
      };
      var animationSymbol = {};
      var animationInterval = 30;
      switch (_self._IntripperPath.pathOptions.pathAnimation.toString().trim()) {
        case "snake":
          animationSymbol = {
            icon: lineSymbol,
            offset: '0',
            repeat: '25px'
          };
          animationInterval = 95;
          break;
        case "plane":
          animationSymbol = {
            icon: planeSymbol
          };
          animationInterval = 40;
          break;
        case "walkingMan":
          animationSymbol = {
            icon: walkingManSymbol,
            rotate: 180,
            fixedRotation: true
          };
          animationInterval = 40;
          break;
        default:
          animationSymbol = {
            icon: arrowSymbol
          };
          animationInterval = 30;
          break;
      }
      var iconsArray = [];
      var circleSymbolObj = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor:_self._IntripperPath.pathOptions.path.color,
        strokeColor:_self._IntripperPath.pathOptions.border.color,
        fillOpacity:1,
        strokeWeight:2,
        strokeOpacity: 1,
        scale: 6
        //scale: _self._IntripperPath.pathOptions.pathWeight*2
      }
      var endPoint = circleSymbolObj;
      var endSymbol = {
        icon: endPoint,
        offset: '100%'
      }
      var startPoint = circleSymbolObj;
      var startSymbol = {
        icon: startPoint,
        offset: '0%'
      }

      this.routePathCoordinates = [];
      if (_self._pathSegmentListSorted.length > 0) {
        _self._polylineArray = {};
        _self._polylineArray.outerPaths = [];
        _self._polylineArray.innerPaths = [];
        _self._currentLevelPathSegmentList = [];
        _self._currentLevelPathSegmentList = $.grep(_self._pathSegmentListSorted, function(element, index) {
          return element.level == _self._displayedFloor;
        });

        $.each(_self._currentLevelPathSegmentList, function(index, value) {
          iconsArray = [];
          iconsArray.push(animationSymbol);
          var outerItem = value;
          var routeCoordinates = [];
          var outerPathObj = {};
          var innerPathObj = {};
          $.each(value.instructions, function(innerIndex, innerItem) {

            var locationObj = {};
            locationObj.lat = innerItem.getCoordinates()[0][1];
            locationObj.lng = innerItem.getCoordinates()[0][0];

            //var sourceIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(locationObj.lat, locationObj.lng));

            if (innerItem.marker != null && innerItem.marker != '') {
              switch (innerItem.marker.toLowerCase()) {
                case "start":
                  // _self.startMarker = addMarker.call(_self, locationObj, _self._IntripperPath.pathOptions.startMarker, null, null, 'Start', null, null, null);
                  iconsArray.push(startSymbol);
                  _self._routeMarkers.push(addMarker.call(_self, _self.sourceCentroid, _self._IntripperPath.pathOptions.startMarker, value.instructionSetIndex, null, null, 'Start', null, null, null));
                 // _self._routeMarkers.push(addMarker.call(_self, sourceIntripperMapAreaObj.getAreaCentre(), _self._IntripperPath.pathOptions.startMarker, value.instructionSetIndex, null, null, 'Start', null, null, null));

                 break;
                case "end":
                  locationObj.lat = innerItem.getCoordinates()[innerItem.getCoordinates().length - 1][1];
                  locationObj.lng = innerItem.getCoordinates()[innerItem.getCoordinates().length - 1][0];
                  //var destIntripperMapAreaObj = getMapAreaContainsPoint.call(_self, new google.maps.LatLng(locationObj.lat, locationObj.lng));
                  //_self.endMarker = addMarker.call(_self, locationObj, _self._IntripperPath.pathOptions.endMarker, null, null, 'End', null, null, null);
                  iconsArray.push(endSymbol);
                  _self._routeMarkers.push(addMarker.call(_self, _self.destCentroid, _self._IntripperPath.pathOptions.endMarker, value.instructionSetIndex, null, null, 'End', null, null, null));
                  //_self._routeMarkers.push(addMarker.call(_self, destIntripperMapAreaObj.getAreaCentre(), _self._IntripperPath.pathOptions.endMarker, value.instructionSetIndex, null, null, 'End', null, null, null));

                  break;
                case "floorchange":
                  if (innerItem.floorchangeInfo == 'end') {
                    locationObj.lat = innerItem.getCoordinates()[innerItem.getCoordinates().length - 1][1];
                    locationObj.lng = innerItem.getCoordinates()[innerItem.getCoordinates().length - 1][0];
                  } else {
                    locationObj.lat = innerItem.getCoordinates()[0][1];
                    locationObj.lng = innerItem.getCoordinates()[0][0];
                  }
                  var floorChangeMarker;
                  if(innerItem.fromInfo!=null){
                    if(_self._IntripperPath.pathOptions.floorChangeMarker.showFromLevelMarker){
                      floorChangeMarker = addMarker.call(_self, locationObj, _self._IntripperPath.pathOptions.floorChangeMarker, value.instructionSetIndex, innerItem.transitionInfo, innerItem.destinationIndex, null, innerItem.fromInfo, innerItem.instructionIcon, innerItem.destinationInstructionSetIndex);
                      _self._routeMarkers.push(floorChangeMarker);
                    }
                  }
                  else{
                    floorChangeMarker = addMarker.call(_self, locationObj, _self._IntripperPath.pathOptions.floorChangeMarker, value.instructionSetIndex, innerItem.transitionInfo, innerItem.destinationIndex, null, innerItem.fromInfo, innerItem.instructionIcon, innerItem.destinationInstructionSetIndex);
                    _self._routeMarkers.push(floorChangeMarker);
                  }
                  break;
              }
            }
            $.each(innerItem.getCoordinates(), function(innerIndex2, innerItem2) {
              var locationObj = {};
              locationObj.lat = innerItem.getCoordinates()[innerIndex2][1];
              locationObj.lng = innerItem.getCoordinates()[innerIndex2][0];
              routeCoordinates.push(locationObj);
            });
          });
          outerPathOptions = {
            path: routeCoordinates,
            strokeColor: _self._IntripperPath.pathOptions.border.color,
            strokeOpacity: 1.0,
            strokeWeight: _self._IntripperPath.pathOptions.border.weight,
            zIndex: 0
          };
          outerPathObj.outerPathPolyLine = new google.maps.Polyline(outerPathOptions);
          outerPathObj.type = 'outer';
          outerPathObj.level = outerItem.level;
          outerPathObj.instructionSetIndex = outerItem.instructionSetIndex;
          if(showEntireRoute == true){
            addPolyLine.call(_self, outerPathObj.outerPathPolyLine, _self._googleMap);
          }
          //addPolyLine.call(_self, outerPathObj.outerPathPolyLine, _self._googleMap);
          _self._polylineArray.outerPaths.push(outerPathObj);
          innerPathOptions = {
            path: routeCoordinates,
            strokeColor: _self._IntripperPath.pathOptions.path.color,
            strokeOpacity: 1.0,
            strokeWeight: _self._IntripperPath.pathOptions.path.weight,
            zIndex: 1,
            //icons: [animationSymbol]
            icons: iconsArray
          };
          innerPathObj.innerPathPolyLine = new google.maps.Polyline(innerPathOptions);
          innerPathObj.type = 'inner';
          innerPathObj.level = outerItem.level;
          innerPathObj.instructionSetIndex = outerItem.instructionSetIndex;
          if(showEntireRoute == true){
            addPolyLine.call(_self, innerPathObj.innerPathPolyLine, _self._googleMap);
          }
          //addPolyLine.call(_self, innerPathObj.innerPathPolyLine, _self._googleMap);
          animatePath.call(_self, innerPathObj.innerPathPolyLine, animationInterval);
          _self._polylineArray.innerPaths.push(innerPathObj);
        });
        if (showEntireRoute == null) {
          toggleAllPolylineVisibility.call(_self, 0);
        }
        var mapDim = {
          height: _self.options.map.clientHeight,
          width: (_self.options.map.clientWidth / 2.5)
        };
        var matchedPolyline;
        var polylineBounds = new google.maps.LatLngBounds();
        if (showEntireRoute == null) {
          if (_self._polylineArray != null) {
            if (_self._polylineArray.innerPaths != null) {
              if (_self._polylineArray.innerPaths.length > 0) {
                polylineBounds = _self._polylineArray.innerPaths[0].innerPathPolyLine.getBounds();
              }
            }
          }
          if (_self._polylineArray.innerPaths.length > 0) {
            if (_self._polylineArray.innerPaths[0] != null) {
              polylineBounds = _self._polylineArray.innerPaths[0].innerPathPolyLine.getBounds();
            }
          }

        } else if (showEntireRoute == false) {
          //bounds handled in steptoinstructionset function
        } else if (showEntireRoute == true) {
          if (_self._polylineArray.innerPaths.length > 0) {
            $.each(_self._polylineArray.innerPaths, function(index, element) {
              element.innerPathPolyLine.getPath().forEach(function(item, index) {
                polylineBounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
              });

            });
          }
        }
        setTimeout(function() {
          if (!polylineBounds.isEmpty()) {
            _self._googleMap.fitBounds(polylineBounds);
            var boundsZoomLevel = getBoundsZoomLevel(polylineBounds, mapDim);
            _self._googleMap.setZoom(boundsZoomLevel);
          }
        }, 500);
      } else {
        clearPath.call(_self);
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * A generic function add polyline on map.
   * @param {any} path
   * @param {any} map
   */
  function addPolyLine(path, map) {
    try {
      if(path!=null){
        if(path.getMap()==null){
          path.setMap(map);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function removePolyline(path) {
    try {
      if(path!=null){
          path.setMap(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function togglePolyLineVisibility(path) {
    try {
      if(path.getVisible() == false){
          path.setVisible(true);
      }
      else{
        path.setVisible(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function getBoundsZoomLevel(bounds, mapDim) {
    try {
      var WORLD_DIM = {
        height: 256,
        width: 256
      };
      var ZOOM_MAX = 21;

      function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
      }

      function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
      }

      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();

      var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

      var lngDiff = ne.lng() - sw.lng();
      var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

      var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
      var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

      return Math.min(latZoom, lngZoom, ZOOM_MAX);
    } catch (error) {
      console.log(error);
    }
  }

  function animatePath(innerPath, animationInterval) {
    var _self = this;
    var count = 0;
    var animation;
    try {
      animation = window.setInterval(function() {
        count = (count + 1) % 200;
        var icons = innerPath.get('icons');
        icons[0].offset = (count / 2) + '%';
        innerPath.set('icons', icons);
      }, animationInterval);
      _self.lineAnimationInterval.push(animation);
    } catch (error) {
      console.log(error);
    }
  }

  function addMarker(location, markerOptions, instructionSetIndex, transitionInfo, destinationIndex, labelText, fromInfo, instructionIcon, destInstructionSetIndex) {
    var _self = this;
    var marker;
    var snazzyMarker;
    var label = '';
    var arrowClass = '';
    var strContent = '';
    var strImageURL = '';
    var cursor = 'default';
    try {
      var strImageURL = markerOptions.useInfowindow == true ? 'https://api.intripper.com/mapasset/blank.png' : markerOptions.url;
      var image = {
        url: strImageURL,
        origin: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(markerOptions.size.width, markerOptions.size.height),
      };
      marker = new google.maps.Marker({
        map: _self._googleMap,
        icon: image,
        position: new google.maps.LatLng(location),
        cursor: 'pointer',
        'optimized': false
      });
      marker.set("instructionSetIndex", instructionSetIndex);
      marker.addListener('click', function() {});
      if (markerOptions.useInfowindow) {
        if (fromInfo != null && fromInfo != '') {
          label = fromInfo.text + fromInfo.level;
          instructionIcon = null;
          cursor = 'pointer';
        } else if (transitionInfo != null && transitionInfo != '') {
          //label = ' Go ' + transitionInfo.levelTransition +  ' ' + transitionInfo.strLevel + ' ' + transitionInfo.transitionDirection;
          label = ' Go ' + transitionInfo.transitionDirection;
          cursor = 'pointer';
          arrowClass = 'mdi mdi-arrow-' + transitionInfo.transitionDirection.toLowerCase() + '';
        } else if (labelText != null && labelText != '') {
          label = labelText;
          instructionIcon = null;
        }
        if (instructionIcon != null) {
          strContent = '' +
            '<div style="cursor:'+ cursor +'; min-height:21px; min-width:79px; text-align:center;" class="markerInfo marker-click" data-destination-index=' + destinationIndex + ' data-dest-instruct-set-index=' + destInstructionSetIndex + '>' +
            '<img src="' + instructionIcon + '" style="max-width: 19px;">' +
            //'<i class="'+ arrowClass +'"></i>' +
            '<span class="marker-infowindow" style="vertical-align:middle;">' + label + '</span></div>'
        } else {
          strContent = '' +
            '<div style="cursor:'+ cursor +'; min-height:21px;text-align:center;" class="markerInfo marker-click" data-destination-index=' + destinationIndex + ' data-dest-instruct-set-index=' + destInstructionSetIndex + '>' +
            '<i class="' + arrowClass + '"></i>' +
            '<span class="marker-infowindow" style="vertical-align:middle;">' + label + '</span></div>'
        }
        snazzyMarker = new SnazzyInfoWindow({
          marker: marker,
          content: strContent,
          offset: {
            top: markerOptions.infowindowCustomOptions.offset.top
          },
          backgroundColor: markerOptions.infowindowCustomOptions.backgroundColor,
          fontColor: markerOptions.infowindowCustomOptions.fontColor,
          padding: markerOptions.infowindowCustomOptions.padding,
          borderRadius: markerOptions.infowindowCustomOptions.borderRadius,
          border: {
            width: markerOptions.infowindowCustomOptions.border.width,
            color: markerOptions.infowindowCustomOptions.border.color
          },
          pointer: markerOptions.infowindowCustomOptions.pointer,
          shadow: markerOptions.infowindowCustomOptions.shadow,
          showCloseButton: false,
          closeOnMapClick: false,
          callbacks: {
            close: function() {},
            open: function() {},
            afterOpen: function() {
              var wrapper = $(this.getWrapper());
              wrapper.find('.marker-click').on('click', function() {
                if (markerOptions.isInfowindowClickable) {
                  if (this.dataset.destInstructSetIndex != null) {
                    //raise floorchange marker click event
                    /**
                     * @event floorChangeMarkerClick
                     * @description floor Change Marker Click event
                     * @returns int instruction set index from route to be plotted
                     * @memberof IntripperPath
                     */
                    markerOptions.floorChangeMarkerClick.call(_self, this.dataset.destInstructSetIndex);
                    _self.stepToInstructionSet(this.dataset.destInstructSetIndex);
                  }
                }
              });
            },
          }
        });
        _self._snazzyMarkersArray.push(snazzyMarker);
        snazzyMarker.open();
      }
    } catch (error) {
      console.log(error);
    }
    return marker;
  }

  function getMapAreaList() {
    var _self = this;
    var post = {};
    try {
      post["method"] = "venuestore";
      post["id"] = this.options.mapid;
      post["lng"] = _self.options.languageCode;
      var strURL = this.options.baseURL + endpoint_variable;
      var jqxhr = $.getJSON(strURL, post)
        .done(function(data) {
          var mapAreaList = [];
          $.each(data.features, function(index, object) {
            var objIntripperMapArea = new IntripperMapArea();
            objIntripperMapArea.setAllAttributes(object.properties);
            if (object.properties['businessarea'] == 1) {
              objIntripperMapArea.setAreaLogo(object.properties['attrs-store_logo']);
            }
            if (object.properties.hasOwnProperty('attrs-_referenceLocation')) {
              objIntripperMapArea.setAreaName(object.properties['attrs-store']);
              var sectionNameAttr = 'section_name_' + _self.options.languageCode;
              if (object.properties.hasOwnProperty(sectionNameAttr)) {
                objIntripperMapArea.setAreaNameLanguage(object.properties[sectionNameAttr]);
              } else {
                objIntripperMapArea.setAreaNameLanguage(object.properties['attrs-store']);
              }
              var sectionDetailAttr = 'section_detail_' + _self.options.languageCode;
              if (object.properties.hasOwnProperty(sectionDetailAttr)) {
                objIntripperMapArea.setAreaDescriptionLanguage(object.properties[sectionDetailAttr]);
              } else {
                objIntripperMapArea.setAreaDescriptionLanguage(object.properties['attrs-store_description']);
              }
              objIntripperMapArea.setAreaID(object.properties['IID']);
              objIntripperMapArea.setAreaLevel(object.properties['level']);
              objIntripperMapArea.setAreaLevelDesc(object.properties['leveldesc']);
              objIntripperMapArea.setAreaCoordinates(object.geometry.coordinates[0]);
              objIntripperMapArea.setAreaCentre(object.properties['attrs-_referenceLocation']);
              objIntripperMapArea.setAreaCoverPhoto(object.properties['attrs-store_image']);
              objIntripperMapArea.setAreaDescription(object.properties['attrs-store_description']);
              objIntripperMapArea.setAreaWorkingHours(object.properties['poi_working_hours']);
              objIntripperMapArea.setWorkingHours(object.properties['attrs-hours']);
              objIntripperMapArea.setAreaContactNumber(object.properties['tel']);
              objIntripperMapArea.setAreaUrl(object.properties['attrs-store_url']);
              objIntripperMapArea.setAreaCategory(object.properties['attrs-maincategory']);
              objIntripperMapArea.setAreaCategoryId(object.properties['attrs-maincategoryid']);
              mapAreaList.push(objIntripperMapArea);
            } else {
              var poi = object;
            }
          });
          _self._objIntripperVenueInfo.setMapAreaList(mapAreaList);
          /**
           * @event mapReady
           * @description  Map ready event
           * @returns {Object} IntripperVenueInfo object
           * @memberof IntripperMap
           */
          _self.options.mapReady.call(_self, _self._objIntripperVenueInfo);
          addKMLLayerToMap.call(_self);
          //addDefaultSearchBar.call(_self);
          var subscription = pubsub.subscribe("labelClicked", onLabelClicked, _self);


          addMapClickListener.call(_self);
          _self.addMapZoomListener();
        })
        .fail(function() {

        });
    } catch (error) {
      console.log(error);
    }
  }

  // function onLabelDataFetched(string, args, reference) {
  //   try {
  //     var _self = reference;
  //     _self.labelArray = [];
  //     $.each(args, function(index, value){
  //       var labelObj = new IntripperLabel();
  //       labelObj.setCentroid(value.centroid);
  //       labelObj.setLevel(value.level);
  //       labelObj.setName(value.name);
  //       _self.labelArray.push(labelObj);
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  function addKMLLayerToMap() {
    var _self = this;
    try {
      var src = _self.options.kmlLayerUrl;
      if (src != '') {
        var kmlLayer = new google.maps.KmlLayer(src, {
          suppressInfoWindows: false,
          preserveViewport: true,
          map: _self._googleMap
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function onLabelClicked(string, args, reference) {
    try {
      var _self = reference;
      if(_self.options.isMapClickEnabled){
          getTappedArea.call(_self, args);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function calculateTotalDistanceMtrs(pathSegmentList) {
    var totalDistMtrs = 0;
    try {
      $.each(pathSegmentList, function(index, item) {
        totalDistMtrs += parseFloat(item.getDistance()) || 0;
      });
      return totalDistMtrs;
    } catch (error) {
      console.log(error);
    }
  }

  function convertMtrsToFeet(distanceMeters) {
    try {
      var totalDistanceFeet = Math.ceil(parseFloat(parseFloat(distanceMeters) * parseFloat(3.28084)));
      return totalDistanceFeet;
    } catch (error) {
      console.log(error);
    }
  }

  function calculateTimeFromMtrsDistance(totalRouteDistanceMtrs) {
    var _self = this;
    try {
      var totalTime = Math.ceil(totalRouteDistanceMtrs * parseFloat(_self.options.avgIndoorWalkingSpeedPerMtr));
      return totalTime;
    } catch (error) {
      console.log(error);
    }
  }

  function calculateTimeFromFeetDistance(totalRouteDistanceFeet) {
    var _self = this;
    try {
      var totalTime = Math.ceil(totalRouteDistanceFeet * parseFloat(_self.options.avgIndoorWalkingSpeedPerFeet));
      return totalTime;
    } catch (error) {
      console.log(error);
    }
  }

  function calculateFloorTransition(sourceLevel, destinationLevel) {
    try {
      var levelTransition = Math.abs(destinationLevel - sourceLevel);
      var strLevel = levelTransition <= 1 ? 'level' : 'levels';
      var transitionDirection = sourceLevel == destinationLevel ? '' : (sourceLevel > destinationLevel ? 'down' : 'up');
      var floorTransition = {
        'levelTransition': levelTransition,
        'strLevel': strLevel,
        'transitionDirection': transitionDirection
      };
      return floorTransition;
    } catch (error) {
      console.log(error);
    }
  }

  function setTotalRouteDistance(value) {
    try {
      this.totalRouteDistance = parseFloat(value).toFixed();
    } catch (error) {
      console.log(error);
    }
  }

  function setTotalRouteTime(value) {
    try {
      this.totalRouteTime = value;
    } catch (error) {
      console.log(error);
    }
  }

  function setFloorTransition(value) {
    try {
      this.floorTransition = value;
    } catch (error) {
      console.log(error);
    }
  }
  return IntripperMap;
}());

var IntripperMapLabel = (function(globalVar) {
  /**
   * @classdesc The labels on map represented as marker overlay
   * @constructs IntripperMapLabel
   * @param {Object} options IntripperMapLabel options
   * @param {string} options.fontFamily Font family name e.g. Roboto
   * @param {int} options.fontSize Font size e.g. 12
   * @param {string} options.color Label forecolor. Hexcode e.g #ffffff
   * @param {IntripperMap} options._intripperMap object of IntripperMap instantiated by user
   */
  function IntripperMapLabel() {
    try {
      IntripperMap.call(this);
      var _self = this;
      this.plottedLabels = [];
      this.plottedLabelNames = [];
      var defaults = {
        fontFamily: 'OpenSans',
        fontSize: 12,
        color: '#141414',
        _intripperMap: null
      }
      if (arguments[0] && typeof arguments[0] === "object") {
        //this.labelOptions = extendDefaults(defaults, arguments[0]);
        this.labelOptions =  deepmerge(defaults, arguments[0]);
      }
      this.mapOptions = this.labelOptions._intripperMap.options;
      getLabels.call(this);
    } catch (error) {
      console.log(error);
    }
  }
  IntripperMapLabel.prototype = Object.create(IntripperMap.prototype);
  IntripperMapLabel.prototype.constructor = IntripperMapLabel;
  IntripperMapLabel.prototype.onMapZoomChanged = function() {
    try {
      renderLabels.call(this);
      return 'Something';
    } catch (error) {
      console.log(error);
    }
  }
  IntripperMapLabel.prototype.addMapZoomListener = function(e) {
    var _self = this;
    try {
      _self.labelOptions._intripperMap._googleMap.addListener('zoom_changed', function(e) {
        _self.onMapZoomChanged(e);
      });
    } catch (error) {
      console.log(error);
    }
  }

  function extendLabelOptions(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property) && property != '_intripperMap') {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }

  function onFloorChange(string, args, reference) {
    try {
      var _self = reference;
      renderLabels.call(_self);
    } catch (error) {
      console.log(error);
    }
  }

  function extendDefaults(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }

  function getLabels() {
    var post = {};
    var strURL;
    var _self = this;
    try {
      post["method"] = "labels";
      post["id"] = this.mapOptions.mapid;
      post["lng"] = this.mapOptions.languageCode;
      post["device"] = "1";
      strURL = this.mapOptions.baseURL + endpoint_variable;
      $.getJSON(strURL, post)
        .done(function(data) {
          _self._intripperLabels = data;
          renderLabels.call(_self);
          _self.addMapZoomListener();
          var subscription = pubsub.subscribe("floorChange", onFloorChange, _self);
          var findRouteSubscription = pubsub.subscribe("findRouteCompleted", onFindRouteCompleted, _self);
          //pubsub.publish("labelsFetched", data);
        });
    } catch (error) {
      console.log(error);
    }
  }
  function onFindRouteCompleted(string, args, reference) {
    var _self = reference;
    var sourceLabel, destLabel;
    sourceLabel = $.grep(_self._intripperLabels, function(value, index){
      return args.source.areaID == value.polygonid;
    });
    destLabel = $.grep(_self._intripperLabels, function(value, index){
      return args.destination.areaID == value.polygonid;
    });

    locationObj = {};
    if(sourceLabel.lngth>0){
      locationObj.lat = sourceLabel[0].centroid[0][0];
      locationObj.lng = sourceLabel[0].centroid[0][1];
      _self.labelOptions._intripperMap.sourceCentroid = locationObj;
    }
    else{
      _self.labelOptions._intripperMap.sourceCentroid = {};
    }
    locationObj = {};
    if(destLabel.length>0){
      locationObj.lat = destLabel[0].centroid[0][0];
      locationObj.lng = destLabel[0].centroid[0][1];
      _self.labelOptions._intripperMap.destCentroid = locationObj;
    }
    else{
      _self.labelOptions._intripperMap.destCentroid = {};
    }
  }
  /**
   * Renders labels on map.
   */
  function renderLabels() {
    var objLabel;
    var labelZoom;
    try {
      removeAllLabels.call(this);
      /**
       * Overrides custom options for labels if any. Such as font-size, color etc.
       */
      var _self = this;
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.maplabel { font-size: ' + _self.labelOptions.fontSize + 'px;font-family: "' + _self.labelOptions.fontFamily + '"; overflow: visible !important; }';
      document.getElementsByTagName('head')[0].appendChild(style);
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.maplabel span{ color: ' + _self.labelOptions.color + ';margin-left:-50%;text-align:center;padding:0 5px;width:auto;display:inline-block;white-space:nowrap;text-shadow:-1px -1px 0 #f5f5f5,1px -1px 0 #f5f5f5,-1px 1px 0 #f5f5f5,1px 1px 0 #f5f5f5 }';
      document.getElementsByTagName('head')[0].appendChild(style);
      for (var counter = 0; counter < _self._intripperLabels.length; counter++) {

        objLabel = _self._intripperLabels[counter];
        labelZoom = parseFloat(objLabel.startzoomlevel).toFixed(2);
        if (objLabel.level == _self.labelOptions._intripperMap._displayedFloor) {
          if (labelZoom <= _self.labelOptions._intripperMap._googleMap.getZoom()) {
            if (_self.labelOptions._intripperMap.languageCode == "en") {
              addSingleLabel.call(_self, objLabel.hide, objLabel.isbusinessarea, objLabel.name, objLabel.category, objLabel.centroid[0][0], objLabel.centroid[0][1], objLabel.catid, objLabel.icon, objLabel.customicon);
            } else {
              addSingleLabel.call(_self, objLabel.hide, objLabel.isbusinessarea, objLabel.localize, objLabel.category, objLabel.centroid[0][0], objLabel.centroid[0][1], objLabel.catid, objLabel.icon, objLabel.customicon);
            }

          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Removes all labels on map.
   */
  function removeAllLabels() {
    var _self = this;
    try {
      for (var counter = 0; counter < _self.plottedLabels.length; counter++) {
        _self.plottedLabels[counter].setMap(null);
      }
      _self.plottedLabels = [];
      _self.plottedLabelNames = [];
    } catch (error) {}
  }
  /**
   * Adds labels as markers on map.
   * @param {any} hide
   * @param {any} isbusinessarea
   * @param {any} name
   * @param {any} category
   * @param {any} lat
   * @param {any} lng
   * @param {any} categoryid
   * @param {any} icon
   * @param {any} customicon
   */
  function addSingleLabel(hide, isbusinessarea, name, category, lat, lng, categoryid, icon, customicon) {
    var markerImageName = '';
    var iconSize = 25;
    var image;
    var marker;
    var _self = this;
    try {
      name = name.replace(/(?:\r\n|\r|\n)/g, '<br />');
      if (hide == false) {
        if (isbusinessarea == true) {
          var cols = document.getElementsByClassName('maplabel');
          marker = new MarkerWithLabel({
            cursor: 'default',
            position: new google.maps.LatLng(lat, lng),
            map: _self.labelOptions._intripperMap._googleMap,
            labelContent: '<span>' + name + '</span>',
            labelAnchor: new google.maps.Point(0, 5),
            labelClass: "maplabel"
          });
          google.maps.event.addListener(marker, "click", function(e) {
            pubsub.publish("labelClicked", this.position);
          });
          markerImageName = customicon;
          if (markerImageName != '') {
            image = {
              url: _self.labelOptions._intripperMap.options.assetURL + 'poi/' + markerImageName,
              scaledSize: new google.maps.Size(iconSize, iconSize)
            };
          } else if (icon != "") {
            image = {
              url: _self.labelOptions._intripperMap.options.assetURL + 'categories/' + icon,
              scaledSize: new google.maps.Size(iconSize, iconSize)
            };
          } else {
            image = {
              url: 'https://api.intripper.com/mapasset/blank.png'
            };
          }
        } else {
          iconSize = 22;
          marker = new google.maps.Marker({
            cursor: 'default'
          });
          marker.setPosition(new google.maps.LatLng(lat, lng));
          marker.setMap(_self.labelOptions._intripperMap._googleMap);
          markerImageName = customicon;
          if (markerImageName != '') {
            image = {
              url: _self.labelOptions._intripperMap.options.assetURL + 'poi/' + markerImageName,
              scaledSize: new google.maps.Size(iconSize, iconSize),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(10, 10)
            };
          } else if (icon != "") {
            image = {
              url: _self.labelOptions._intripperMap.options.assetURL + 'categories/' + icon,
              scaledSize: new google.maps.Size(iconSize, iconSize),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(10, 10)
            };
          } else {
            image = {
              url: 'https://api.intripper.com/mapasset/blank.png'
            };
          }
        }
      }
      marker.setDraggable(false);
      marker.setIcon(image);
      _self.plottedLabels.push(marker);
      _self.plottedLabelNames.push(name);
      return marker;
    } catch (error) {
      console.log(error);
    }
  }
  return IntripperMapLabel;
}(globalVar));

var IntripperLabel = (function() {
  function IntripperLabel() {

  }
  IntripperLabel.prototype.setPolygonId = function(value) {
    try {
      this.polygonid = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperLabel.prototype.getPolygonId = function() {
    try {
      return this.polygonid;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperLabel.prototype.setLevel = function(value) {
    try {
      this.level = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperLabel.prototype.getLevel = function() {
    try {
      return this.level;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperLabel.prototype.setName = function(value) {
    try {
      this.name = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperLabel.prototype.getName = function() {
    try {
      return this.name;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperLabel.prototype.setCentroid = function(value) {
    try {
      this.centroid = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperLabel.prototype.getCentroid = function() {
    try {
      return this.centroid;
    } catch (error) {
      console.log(error);
    }
  };
  return IntripperLabel;
}());

var IntripperPath = (function() {
  /**
   * @classdesc A linear overlay of connected path segments on the map.
   * @constructs IntripperPath
   * @param {Object} options IntripperPath options
   * @param {Object} options.border The path border. Sample border object literal:
   * {color: '#fff' //hexcode,
   * weight: 6 //int. Typically the border path weight should be twice the path weight of path}
   * @param {Object} options.path The path. Sample path object literal:
   * {color: '#2c8ded',
   * weight: 3}
   * @param {Object} options.highlightBorder The highlighted border option. Sample highlight border object literal: {color: '#fff'}
   * @param {Object} options.highlightPath The highlighted path option. Sample highlight path object literal:   {color: '#000'}
   * @param {Object} options.startMarker The start marker. Sample startMarker object literal:
   * {url: 'https://admin.intripper.com/webviewer/html/assets/images/google_start_pin.png' //string,
   * size:{width: 40 //int,
   * height: 40 //int}
   * }
   * @param {Object} options.endMarker The end marker. Sample endMarker object literal:
   * {url: 'https://admin.intripper.com/webviewer/html/assets/images/google_start_pin.png',
   * size:{width: 40,height: 40}}
   * @param {Object} options.floorChangeMarker The floor change marker Sample floorChangeMarker object literal:
   * {url: 'https://admin.intripper.com/webviewer/html/assets/images/google_start_pin.png',
   * size:{width: 40,height: 40}}
   */
  function IntripperPath() {
    try {
      var defaultPathWeight = 3;
      var defaults = {
        border: {
          color: '#fff',
          weight: defaultPathWeight * 2
        },
        path: {
          color: '#2c8ded',
          weight: defaultPathWeight
        },
        highlightBorder: {
          color: '#fff'
        },
        highlightPath: {
          color: '#000'
        },
        startMarker: {
          url: 'https://admin.intripper.com/webviewer/html/assets/images/google_start_pin.png',
          size: {
            width: 40,
            height: 40
          },
          useInfowindow: false,
          isInfowindowClickable: true,
          infowindowCustomOptions: {
            offset: {
              top: '-10px'
            },
            fontColor: '#fff',
            padding: '2px 15px 4px',
            backgroundColor: '#a5a5a5',
            borderRadius: '2em',
            border: {
              width: '2px',
              color: '#fff'
            },
            pointer: '7px',
            shadow: false,
          }
        },
        endMarker: {
          url: 'https://admin.intripper.com/webviewer/html/assets/images/google_end_pin_red.png',
          size: {
            width: 40,
            height: 40
          },
          useInfowindow: false,
          isInfowindowClickable: false,
          infowindowCustomOptions: {
            offset: {
              top: '-10px'
            },
            fontColor: '#fff',
            padding: '2px 15px 4px',
            backgroundColor: '#a5a5a5',
            borderRadius: '2em',
            border: {
              width: '2px',
              color: '#fff'
            },
            pointer: '7px',
            shadow: false,
          }
        },
        floorChangeMarker: {
          floorChangeMarkerClick:function(obj) {},
          showFromLevelMarker:true,
          url: 'https://admin.intripper.com/webviewer/html/assets/images/google_end_pin.png',
          size: {
            width: 40,
            height: 40
          },
          useInfowindow: false,
          isInfowindowClickable: true,
          infowindowCustomOptions: {
            offset: {
              top: '0px'
            },
            fontColor: '#fff',
            padding: '2px 15px 4px',
            backgroundColor: '#a5a5a5',
            borderRadius: '2em',
            border: {
              width: '2px',
              color: '#fff'
            },
            pointer: '7px',
            shadow: false,
          }

        }
      }
      if (arguments[0] && typeof arguments[0] === "object") {
        //this.pathOptions = extendDefaults(defaults, arguments[0]);
        this.pathOptions =  deepmerge(defaults, arguments[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function extendDefaults(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }
  IntripperPath.prototype.test = function() {
    console.log("test Path");
  };
  return IntripperPath;
}());
var IntripperPathSegment = (function() {
  /**
   * @classdesc Represents a segment on a path from source to destination.
   * @constructs IntripperPathSegment
   */
  function IntripperPathSegment() {

  }
  IntripperPathSegment.prototype.setCoordinates = function(value) {
    try {
      this.coordinates = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getCoordinates
   * @description Gets Geocoordinates of the segment
   * @returns {Array}
   * @memberOf IntripperPathSegment
   * @instance
   */
  IntripperPathSegment.prototype.getCoordinates = function() {
    try {
      return this.coordinates;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperPathSegment.prototype.setLevel = function(value) {
    try {
      this.level = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getLevel
      * @description Gets Floor on which the segment is located
      * @returns {int}
      * @memberOf IntripperPathSegment

    */
  IntripperPathSegment.prototype.getLevel = function() {
    try {
      return this.level;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperPathSegment.prototype.setIndex = function(value) {
    try {
      this.index = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
       * @method getIndex
       * @description Gets position of the segment.Get particular segment of the path using this index number.
       * @returns {int}
       * @memberOf IntripperPathSegment

   */
  IntripperPathSegment.prototype.getIndex = function() {
    try {
      return this.index;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperPathSegment.prototype.setInstruction = function(value) {
    try {
      this.instruction = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getInstruction
      * @description Gets walking intruction for that segment.
      * @returns {string}
      * @memberOf IntripperPathSegment

  */

  IntripperPathSegment.prototype.getInstruction = function() {
    try {
      return this.instruction;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperPathSegment.prototype.setInstructionIcon = function(value) {
    try {
      this.instructionIcon = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getInstruction
      * @description Gets the URL of the direction icon associated with this path segment.
      * @returns {string}
      * @memberOf IntripperPathSegment

  */
  IntripperPathSegment.prototype.getInstructionIcon = function() {
    try {
      return this.instructionIcon;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getInstruction
      * @description Gets walking intruction for that segment.
      * @returns {string}
      * @memberOf IntripperPathSegment

  */

  IntripperPathSegment.prototype.getDistance = function() {
    try {
      return this.distance;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperPathSegment.prototype.setDistance = function(value) {
    try {
      this.distance = value;
    } catch (error) {
      console.log(error);
    }
  };
  return IntripperPathSegment;
}());
var IntripperPathSegmentList = (function() {
  /**
   * @classdesc Represents a list of path segments sorted level wise
   * @constructs IntripperPathSegmentList
   */
  function IntripperPathSegmentList() {

  }
  /**
   * @method getInstructionsList
   * @description Gets the list of instructions. Array of IntripperPathSegment class objects.
   * @returns {Array}
   * @memberOf IntripperPathSegmentList
   */
  IntripperPathSegmentList.prototype.getInstructionsList = function() {
    try {
      return this.instructions;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getInstructionListLevel
      * @description Gets floor of the instruction set
      * @returns {string}
      * @memberOf IntripperPathSegmentList

    */
  IntripperPathSegmentList.prototype.getInstructionListLevel = function() {
    try {
      return this.level;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getInstructionSetIndex
      * @description Gets Instruction Set's Index
      * @returns {string}
      * @memberOf IntripperPathSegmentList

    */
  IntripperPathSegmentList.prototype.getInstructionSetIndex = function() {
    try {
      return this.instructionSetIndex;
    } catch (error) {
      console.log(error);
    }
  };
  /**
      * @method getIndexInfo
      * @description Gets Information about index of instruction set. Start index, end index & index range having indices of all instructions in that instruction set.
      * @returns {Object}
      * @memberOf IntripperPathSegmentList

    */
  IntripperPathSegmentList.prototype.getIndexInfo = function() {
    try {
      return this.indexInfo;
    } catch (error) {
      console.log(error);
    }
  };
  return IntripperPathSegmentList;
}());
var IntripperPathPolyline = (function() {

  function IntripperPathPolyline(outerPath, outerPathOptions, innerPath, innerPathOptions) {
    setOuterPolyline.call(this, outerPath);
    setInnerPolyline.call(this, innerPath);
    setOuterPolylineOptions.call(this, outerPathOptions);
    setInnerPolylineOptions.call(this, innerPathOptions);
  }

  function setOuterPolyline(value) {
    this.outerPolyline = value;
  };

  function setInnerPolyline(value) {
    this.innerPolyline = value;
  };

  function setHighlightOuterPolyline(value) {
    this.outerPolyline = value;
  };

  function setHighlightinnerPolyline(value) {
    this.outerPolyline = value;
  };

  function setOuterPolylineOptions(value) {
    this.outerPolylineOptions = value;
  };

  function setInnerPolylineOptions(value) {
    this.innerPolylineOptions = value;
  };

  function setHighlightOuterPolylineOptions(value) {
    this.innerPolylineOptions = value;
  };

  function setHighlightInnerPolylineOptions(value) {
    this.innerPolylineOptions = value;
  };
  IntripperPathPolyline.prototype.getOuterPolyline = function() {
    return this.outerPolyline;
  };
  IntripperPathPolyline.prototype.getInnerPolyline = function() {
    return this.innerPolyline;
  };
  IntripperPathPolyline.prototype.getHighlightOuterPolyline = function() {
    return this.innerPolyline;
  };
  IntripperPathPolyline.prototype.getOuterPolylineOptions = function() {
    return this.outerPolylineOptions;
  };
  IntripperPathPolyline.prototype.getInnerPolylineOptions = function() {
    return this.innerPolylineOptions;
  };
  IntripperPathPolyline.prototype.getHighlightOuterPolylineOptions = function() {
    return this.innerPolylineOptions;
  };
  IntripperPathPolyline.prototype.getHighlightInnerPolylineOptions = function() {
    return this.innerPolylineOptions;
  };
  return IntripperPathPolyline;
}());
var IntripperMapArea = (function() {
  /**
   * @classdesc Represents a specific geographical area on the map.
   * @constructs IntripperMapArea
   */
  function IntripperMapArea() {

  }
  IntripperMapArea.prototype.setAllAttributes = function(value) {
    try {
      this.allAttributes = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAttributeValue
   * @description Gets value for the given attribute name
   * @param {string} attributeName The name of attribute for which value is to be fetched
   * @returns {} value for the given attribute name
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAttributeValue = function(attributeName) {
    try {
      return this.allAttributes[attributeName];
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaLogo = function(value) {
    try {
      this.logo = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
     * @method getAreaLogo
     * @description Gets URL of the logo of this area, if any present..
     * @returns {string} Image URL of the logo.
     * @memberOf IntripperMapArea

   */
  IntripperMapArea.prototype.getAreaLogo = function() {
    try {
      return this.logo;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaCoordinates = function(value) {
    try {
      this.coordinates = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
    * @method getAreaCoordinates
    * @description Gets perimeter coordinates of the area.
    * @returns {Array} An array of coordinates.
    * @memberOf IntripperMapArea

  */
  IntripperMapArea.prototype.getAreaCoordinates = function() {
    try {
      return this.coordinates;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaLevel = function(value) {
    try {
      this.floor = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaLevelDesc = function(value) {
    try {
      this.floorDescription = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
    * @method getAreaLevel
    * @description Gets floor number of the area in the venue.
    * @returns {int} Numeric value of the floor.
    * @memberOf IntripperMapArea

  */
  IntripperMapArea.prototype.getAreaLevel = function() {
    try {
      return this.floor;
    } catch (error) {
      console.log(error);
    }
  };
  /**
    * @method getAreaLevelDesc
    * @description Gets floor of the area in the venue.
    * @returns {string} Floor Level.
    * @memberOf IntripperMapArea

  */
  IntripperMapArea.prototype.getAreaLevelDesc = function() {
    try {
      return this.floorDescription;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaName = function(value) {
    try {
      this.areaName = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
     * @method getAreaName
     * @description Gets area name.
     * @returns {string} Name of the area.
     * @memberOf IntripperMapArea

   */
  IntripperMapArea.prototype.getAreaName = function() {
    try {
      return this.areaName;
    } catch (error) {
      console.log(error);
    }
  };
  /**
     * @method getAreaId
     * @description Gets area id.
     * @returns {int} Unique ID of the area.
     * @memberOf IntripperMapArea

   */
  IntripperMapArea.prototype.getAreaId = function() {
    try {
      return this.areaID;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaNameLanguage
   * @description Gets area name in language requested.
   * @returns {string} Area name.
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaNameLanguage = function() {
    try {
      return this.areaNameLanguage;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaDescriptionLanguage
   * @description Gets area detail in language requested.
   * @returns {string} Area detail.
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaDescriptionLanguage = function() {
    try {
      return this.areaDescriptionLanguage;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaID = function(value) {
    try {
      this.areaID = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaDescriptionLanguage = function(value) {
    try {
      this.areaDescriptionLanguage = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaNameLanguage = function(value) {
    try {
      this.areaNameLanguage = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaID = function(value) {
    try {
      this.areaID = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperMapArea.prototype.setAreaCentre = function(value) {
    try {
      var arrSourceCoordinates = [];
      arrSourceCoordinates = value.split(',');
      this.centre = {};
      this.centre.lat = parseFloat(arrSourceCoordinates[1]);
      this.centre.lng = parseFloat(arrSourceCoordinates[0]);
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaCentreVal = function(value) {
    try {
      this.centre = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentre
   * @description Returns the centre coordinates of the area
   * @returns {object} object with lat,lng values
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCentre = function() {
    try {
      return this.centre;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentreLat
   * @description Returns the centre coordinates of latitude of the area
   * @returns {float} lat value
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCentreLat = function() {
    try {
      return this.centre.lat;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentreLng
   * @description Returns the centre coordinates of longitude of the area
   * @returns {float} lng value
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCentreLng = function() {
    try {
      return this.centre.lng;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperMapArea.prototype.getAreaCentreVal = function() {
    try {
      return this.centre;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaCoverPhoto = function(value) {
    try {
      this.coverPhoto = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCoverPhoto
   * @description Get URL of the cover image of this area.
   * @returns {string} Image URL of the area.
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCoverPhoto = function() {
    try {
      return this.coverPhoto;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaDescription = function(value) {
    try {
      this.description = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaDescription
   * @description Gets description of this area, if any present.
   * @returns {string} Description of the area.
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaDescription = function() {
    try {
      return this.description;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaWorkingHours = function(value) {
    try {
      this.workingHours = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaWorkingHours
   * @description Gets working hours of this area.
   * @returns {string}
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaWorkingHours = function() {
    try {
      return this.workingHours;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setWorkingHours = function(value) {
    try {
      this.working_Hours = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperMapArea.prototype.getWorkingHours = function() {
    try {
      return this.working_Hours;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaContactNumber = function(value) {
    try {
      this.contactNumber = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaContactNumber
   * @description Gets telephone number of this area.
   * @returns {string}
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaContactNumber = function() {
    try {
      return this.contactNumber;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaUrl = function(value) {
    try {
      this.url = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaUrl
   * @description Gets URL of the website of this area.
   * @returns {string}
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaUrl = function() {
    try {
      return this.url;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaCategory = function(value) {
    try {
      this.category = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCategory
   * @description Gets category name of this area.
   * @returns {string}
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCategory = function() {
    try {
      return this.category;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperMapArea.prototype.setAreaCategoryId = function(value) {
    try {
      this.categoryId = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCategoryId
   * @description Gets category ID of this area.
   * @returns {int}
   * @memberOf IntripperMapArea
   */
  IntripperMapArea.prototype.getAreaCategoryId = function() {
    try {
      return this.categoryId;
    } catch (error) {
      console.log(error);
    }
  };

  return IntripperMapArea;
}());
var IntripperVenueInfo = (function() {
  /**
   * @classdesc Represents a venue.
   * @constructs IntripperVenueInfo
   */
  function IntripperVenueInfo() {
    var defaults = {
      //venueId: 00
    }
    try {
      if (arguments[0] && typeof arguments[0] === "object") {
        //this.venueOptions = extendDefaults(defaults, arguments[0]);
        this.venueOptions =  deepmerge(defaults, arguments[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function extendDefaults(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }
  IntripperVenueInfo.prototype.setMapName = function(value) {
    try {
      this.mapName = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperVenueInfo.prototype.setMapAreaList = function(value) {
    try {
      this.mapAreaList = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**

   * @description Gets list of all areas present in this venue.
   * @returns {Array} An array of objects of type InTripperMapArea
   * @memberOf IntripperVenueInfo

   */
  IntripperVenueInfo.prototype.getMapAreaList = function() {
    try {
      return this.mapAreaList;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperVenueInfo.prototype.setFloorInfoList = function(value) {
    try {
      this.floorInfoList = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getFloorInfoList
   * @description Gets floor information for the venue.
   * @returns {Array} An array of objects of type IntripperFloorInfo
   * @memberOf IntripperVenueInfo

   */
  IntripperVenueInfo.prototype.getFloorInfoList = function() {
    try {
      return this.floorInfoList;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getMapName
   * @description Gets name of the venue.
   * @returns {string} Name of venue
   * @memberOf IntripperVenueInfo

   */
  IntripperVenueInfo.prototype.getMapName = function() {
    try {
      return this.mapName;
    } catch (error) {
      console.log(error);
    }
  };
  /**
  * @method getVenueId
  * @description Gets unique ID of the venue.
  * @returns {int} VenueID,
  * @memberOf IntripperVenueInfo

  */
  IntripperVenueInfo.prototype.getVenueId = function() {
    try {
      return this.venueId;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperVenueInfo.prototype.setVenueId = function(value) {
    try {
      this.venueId = value;
    } catch (error) {
      console.log(error);
    }
  };

  return IntripperVenueInfo;
}());
var IntripperFloorInfo = (function() {
  /**
   * @classdesc Holds information about the floor.
   * @constructs IntripperFloorInfo
   */
  function IntripperFloorInfo() {


  }
  IntripperFloorInfo.prototype.setFloorName = function(value) {
    try {
      this.name = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperFloorInfo.prototype.setFloorNumber = function(value) {
    try {
      this.floorNumber = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperFloorInfo.prototype.setMapId = function(value) {
    try {
      this.mapId = value;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperFloorInfo.prototype.setBuildings = function(value) {
    try {
      this.buildings = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getFloorName
   * @description Gets floor name of the selected venue.
   * @memberof IntripperFloorInfo
   * @returns {string} The floor to be displayed on floor selector.
   */
  IntripperFloorInfo.prototype.getFloorName = function() {
    try {
      return this.name;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getFloorNumber
   * @description Gets floor number.
   * @memberof IntripperFloorInfo
   * @returns {int} The numeric value of floor.
   */
  IntripperFloorInfo.prototype.getFloorNumber = function() {
    try {
      return this.floorNumber;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getMapId
   * @description Gets unique map id of the venue.
   * @memberof IntripperFloorInfo
   * @returns {int} MapID of the venue.
   */
  IntripperFloorInfo.prototype.getMapId = function() {
    try {
      return this.mapId;
    } catch (error) {
      console.log(error);
    }
  };
  IntripperFloorInfo.prototype.getBuildings = function() {
    try {
      return this.buildings;
    } catch (error) {
      console.log(error);
    }
  };
  return IntripperFloorInfo;
}());

var IntripperSearchPOI = (function() {
  /**
   * @classdesc  Holds information about the search result.
   * @constructs IntripperSearchPOI
   */
  function IntripperSearchPOI() {

  }
  IntripperSearchPOI.prototype.setAllAttributes = function(value) {
    try {
      this.allAttributes = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAttributeValue
   * @description Gets value for the given attribute name
   * @param {string} attributeName The name of attribute for which value is to be fetched
   * @returns {} value for the given attribute name
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getAttributeValue = function(attributeName) {
    try {
      return this.allAttributes[attributeName];
    } catch (error) {
      console.log(error);
    }
  };
  /**
   *  Sets name of this point of interest.
   */

  IntripperSearchPOI.prototype.setPoiName = function(value) {
    try {
      this.poiName = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getPoiName
   * @description Gets the name of the searched point of interest
   * @memberof IntripperSearchPOI
   * @returns {string} The name of the point of interest
   */
  IntripperSearchPOI.prototype.getPoiName = function() {
    try {
      return this.poiName;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   *  Sets centre point of the point of interest.
   */
  IntripperSearchPOI.prototype.setPoint = function(value) {
    try {
      this.point = value;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperSearchPOI.prototype.getPoint = function() {
    try {
      return this.point;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   *  Sets area of the point of interest
   */
  IntripperSearchPOI.prototype.setMapArea = function(value) {
    try {
      this.area = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getMapArea
   * @description Gets an object of the point of interest searched.
   * @memberof IntripperSearchPOI
   * @returns {Object} An object of the point of interest search of type IntripperMapArea
   */
  IntripperSearchPOI.prototype.getMapArea = function() {
    try {
      return this.area;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   *   Sets the floor name associated with this POI
   */
  IntripperSearchPOI.prototype.setFloorName = function(value) {
    try {
      this.floor = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getFloorName
   * @description Gets floor name of the point of interest searched.
   * @memberof IntripperSearchPOI
   * @returns {string} The floor to be displayed on floor selector where the point of interest is located.
   */
  IntripperSearchPOI.prototype.getFloorName = function() {
    try {
      return this.floor;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperSearchPOI.prototype.setFloor = function(value) {
    try {
      this.floor = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getFloor
   * @description Gets floor of the point of interest searched.
   * @memberof IntripperSearchPOI
   * @returns {int} The floor where the point of interest is located.
   */
  IntripperSearchPOI.prototype.getFloor = function() {
    try {
      return this.floor;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperSearchPOI.prototype.setAreaCentre = function(value) {
    try {
      var arrSourceCoordinates = [];
      arrSourceCoordinates = value.split(',');
      this.centre = {};
      this.centre.lat = parseFloat(arrSourceCoordinates[1]);
      this.centre.lng = parseFloat(arrSourceCoordinates[0]);
    } catch (error) {
      console.log(error);
    }
  };
  IntripperSearchPOI.prototype.setAreaCentreVal = function(value) {
    try {
      this.centre = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentre
   * @description Returns the centre coordinates of the area
   * @returns {object} object with lat,lng values
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getAreaCentre = function() {
    try {
      return this.centre;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentreLat
   * @description Returns the centre coordinates of latitude of the area
   * @returns {float} lat value
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getAreaCentreLat = function() {
    try {
      return this.centre.lat;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentreLng
   * @description Returns the centre coordinates of longitude of the area
   * @returns {float} lng value
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getAreaCentreLng = function() {
    try {
      return this.centre.lng;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getAreaCentreVal
   * @description Returns the centre coordinates of the area.
   * @returns {string} Comma seperated string of lat,long.
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getAreaCentreVal = function() {
    try {
      return this.centre;
    } catch (error) {
      console.log(error);
    }
  };

  IntripperSearchPOI.prototype.setLevel = function(value) {
    try {
      this.level = value;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * @method getLevel
   * @description Returns the level of the area.
   * @returns {int} level.
   * @memberOf IntripperSearchPOI
   */
  IntripperSearchPOI.prototype.getLevel = function() {
    try {
      return this.level;
    } catch (error) {
      console.log(error);
    }
  };
  return IntripperSearchPOI;
}());

var IntripperSearchTask = (function() {
  /**
   * @classdesc Performs search operations.
   * @constructs IntripperSearchTask
   * @param {function} options.searchCompleted Callback function called when search is completed
   * @param {function} options.searchStarted Callback function called when search is started
   * @param {function} options.searchFailed Callback function called when search is failed
   */
  function IntripperSearchTask() {
    try {
      // Define option defaults
      var defaults = {
        baseURL: "https://api.intripper.com/v15/bin/",
        assetURL: "https://api.intripper.com/v15/asset/",
        //events
        searchCompleted: function(obj) {},
        searchStarted: function(obj) {},
        searchFailed: function(obj) {}
      }
      // Create options by extending defaults with the passed in arguments
      if (arguments[0] && typeof arguments[0] === "object") {
        //this.searchoptions = extendDefaults(defaults, arguments[0]);
        this.searchoptions =  deepmerge(defaults, arguments[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @method SearchPOI
   * @description Searches a POI
   * @param {string} searchtext The text string to search
   * @param {int} venueid unique venue id
   * @memberof IntripperSearchTask
   * @returns {Array} An array of type IntripperSearchPOI
   */
  IntripperSearchTask.prototype.SearchPOI = function(searchtext, venueid) {
    var _self = this;
    var poiList = [];
    var post = {};
    try {
      post["method"] = "search";
      post["id"] = venueid;
      post["q"] = searchtext;
      var strURL = _self.searchoptions.baseURL + endpoint_variable;
      var jqxhr = $.getJSON(strURL, post)
        .done(function(data) {
          $.each(data.features, function(index, item) {
            if (item.properties.hasOwnProperty('attrs-_referenceLocation')) {
              var objIntripperSearchPOI = new IntripperSearchPOI();
              objIntripperSearchPOI.setAllAttributes(item.properties);
              objIntripperSearchPOI.setPoiName(item.properties['attrs-store']);
              objIntripperSearchPOI.setAreaCentre(item.properties['attrs-_referenceLocation']);
              objIntripperSearchPOI.setLevel(item.properties['level']);
              objIntripperSearchPOI.setPoint(item.properties['attrs-_referenceLocation']);
              objIntripperSearchPOI.setFloorName(item.properties['leveldesc']);
              var objMapArea = new IntripperMapArea();
              objMapArea.setAreaID(item.properties['IID']);
              objIntripperSearchPOI.setMapArea(objMapArea);
              poiList.push(objIntripperSearchPOI);
            } else {
              var poi = item;
            }
          });
          /**
           * @event searchCompleted
           * @description  On search completed event
           * @returns {Array} Array of IntripperSearchPOI objects
           * @memberof IntripperSearchTask
           */
          _self.searchoptions.searchCompleted.call(_self, poiList);
        })
        .fail(function() {
          /**
           * @event searchFailed
           * @description  On search failed event
           * @memberof IntripperSearchTask
           */
          _self.searchoptions.searchFailed.call(_self);
        });
    } catch (error) {
      console.log(error);
    }
  };

  function extendDefaults(source, properties) {
    var property;
    try {
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    } catch (error) {
      console.log(error);
    }
  }
  return IntripperSearchTask;
}());
