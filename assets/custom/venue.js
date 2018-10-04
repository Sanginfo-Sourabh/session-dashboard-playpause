var resultArray = [];
$(document).ready(function () {
    venuecontroller.parseinit();
    venuecontroller.getVenues();
    //showloader();
    showLoaderBallAtomLoader();
});
var venuecontroller = {
    objParse:null,


    parseinit: function () {
        Parse.initialize(constants.parseAppID, constants.parseKey); 

        Parse.serverURL = constants.parseServer;
        objParse = Parse.Object.extend("PositioningLog");
      
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
    getVenues:function(){
        var data = {};
        data["clientid"] = constants.clientID;
        var strURL = constants.intripperEndpointURL + "admintools.php?method=clientvenues";
        $.ajax({
            url: strURL,
            type: 'GET',
            data: data,
            success: function (data, status, xhr) {
                venuecontroller.getVenueSessions(data);
            }
        })
    },


    getSessionDetail: function(outerItem){
            return new Promise((resolve) => {
                var query = new Parse.Query(objParse);
                query.equalTo("VenueId", parseInt(outerItem.venueid));
                query.limit(5000);
                query.find({
                    success: function (results) {
                        var result = venuecontroller.groupBy(results, function (item) {
                            return [item.attributes["SessionId"]];
                        });
                        var objVenueDetails = {};
                        objVenueDetails.venueid = outerItem.venueid;
                        objVenueDetails.venuename = outerItem.venuename;
                        objVenueDetails.sessionsCount = result.length;
                        resolve(objVenueDetails);
                    },
                    error: function (error) {                        
                        reject(error);                                    
                        
                    }
                });
            });
    },
    getVenueSessions: function(data) {
        let i;
        let promises = [];        
        // for (i = 0; i < data.length; ++i) {
        //   promises.push(venuecontroller.getSessionDetail(data[i]));
        // }
        data.map((outerItem) => {
            promises.push(venuecontroller.getSessionDetail(outerItem));
        });
        
        Promise.all(promises)
            .then((results) => {
              console.log("All done", results);
              resultArray = results;
              $('#venue-container').empty();
            var venueElement = '';
            resultArray.sort(function(a,b){
                //return a.venuename - b. venuename;
                venuecontroller.sortByVenueName(a, b);
              });
            //resultArray.sort(venuecontroller.sortByVenueName(a, b));
            // files = _.orderBy(files,'LastModified','asc')
            venuecontroller.appendVenues();    
            })
            .catch((e) => {
                // Handle errors here
            });
      },
      appendVenues: function() {
          try{ 
              $('.custom-wrapper').show();
        
          var venueElement = '';
          $.each(resultArray, function(index, data){
              venueElement += '<div class="col-lg-3 col-md-6 col-sm-6">';
              venueElement += '<div class="card-box venue-element" data-venueid="'+data.venueid+'" data-venuename="'+data.venuename+'" data-sessioncount="'+data.sessionsCount+'"><a class="card-content">';
              venueElement += '<div class="overlay"></div><div class="card-overlay-content">';
              venueElement += '<h3 class="header-title venue-header-title m-t-0 m-b-30 text-center text-uppercase">'+data.venuename+'</h3>';
              venueElement += '<p class="venue-header-subtitle  text-center text-uppercase">'+data.sessionsCount+' Sessions</p>';
              venueElement += '</div></a></div></div>';
          });
          $('#venue-container').append(venueElement);
          //hideloader();
          hideLoaderBallAtomLoader();
        }
          catch(exception){//error
        }
       
      },
      sortByVenueName: function(){
        try{ 
        return a.venuename - b.venuename;}
        catch(exception){//error
      }
      }      
    // getVenueSessions: function(data){
    //     Promise.all([
    //         //if (data != null) {
    //             data.map((outerItem) => {
    //                 return new Promise((resolve) => {
    //                     var query = new Parse.Query(objParse);
    //                     query.equalTo("VenueId", parseInt(outerItem.venueid));
    //                     query.limit(5000);
    //                     query.find({
    //                         success: function (results) {
    //                             //console.log(results.length);
    //                             var result = venuecontroller.groupBy(results, function (item) {
    //                                 return [item.attributes["SessionId"]];
    //                             });
    //                             //console.log("Total sessions " + result.length);
    //                             var objVenueDetails = {};
    //                             objVenueDetails.venueid = outerItem.venueid;
    //                             objVenueDetails.venuename = outerItem.venuename;
    //                             objVenueDetails.sessionsCount = result.length;
    //                             resolve(objVenueDetails);
                                
    //                         },
    //                         error: function (error) {
    //                             // error is an instance of Parse.Error.
    //                             reject(error);                                    
                                
    //                         }
    //                     });
                      
    //                 });
    //             })
    //         //}
    //     ]).then(array => {
    //         resultArray = array;
    //         $('#venue-container').empty();
    //         var venueElement = '';
    //         $.each(array,function(key,item){                
    //             $.each(item,function(key1,item1){
    //                 item1.then(data => {
    //                     $('.custom-wrapper').show();
    //                     hideloader();
    //                     venueElement = '';
    //                     venueElement += '<div class="col-lg-3 col-md-6 col-sm-6">';
    //                     venueElement += '<div class="card-box venue-element" data-venueid="'+data.venueid+'" data-venuename="'+data.venuename+'" data-sessioncount="'+data.sessionsCount+'"><a class="card-content">';
    //                     venueElement += '<div class="overlay"></div><div class="card-overlay-content">';
    //                     venueElement += '<h3 class="header-title venue-header-title m-t-0 m-b-30 text-center text-uppercase">'+data.venuename+'</h3>';
    //                     venueElement += '<p class="venue-header-subtitle  text-center text-uppercase">'+data.sessionsCount+' Sessions</p>';
    //                     venueElement += '</div></a></div></div>';
    //                     $('#venue-container').append(venueElement);
    //                 });
    //             });
    //         });
            

    //     });
    // }
}


$('#venue-container').on('click','.venue-element',function(){
    var venueId,venueName,sessionCount;
    try{

        venueId = $(this).attr('data-venueid');
        venueName = $(this).attr('data-venuename');
        sessionCount = $(this).attr('data-sessioncount');

        localStorage.setItem("venueId", venueId);
        localStorage.setItem("venueName",venueName);
        localStorage.setItem("sessionCount",sessionCount);
        window.location.href = 'filter.html'; 
    }catch(error){
        console.log(error);
    }
});


