var loader;

$(document).ready(function() {
  try{
    
  }catch(error){
    console.log(error);
  }
});

function showLoaderBallAtomLoader() {
  try {
    if (!loader) {
      loader = $('<div class="loaderwrapper"><div style="color: #6bd0ed" class="la-ball-atom la-3x"><div></div><div></div><div></div><div></div></div></div>').appendTo(document.body);
      var $g = $("#bodyPage");
      loader.css("position", "absolute")
        //.css("background-color", "rgba(237,233,222,0.2)")
        .css("z-index", 10000);
    }
    loader.show();
  } catch (error) {
    console.log(error);
  }
}

function hideLoaderBallAtomLoader() {
  if (loader != null) {
    loader.hide();
  }
}




function showloader() {
  try {
    if (!loader) {
      loader = $('<div class="loaderwrapper"> <div id="preloader_2"><span></span><span></span><span></span><span></span></div></div>').appendTo(document.body);
      var $g = $("#bodyPage");
      loader.css("position", "absolute")
        .css("background-color", "rgba(237,233,222,0.2)")
        .css("z-index", 10000);
    }
    loader.show();
  } catch (error) {
    console.log(error);
  }
}

function hideloader() {
  if (loader != null) {
    loader.hide();
  }
}
function forHumans ( seconds ) {
  var levels = [
      [Math.floor(seconds / 31536000), 'years'],
      [Math.floor((seconds % 31536000) / 86400), 'days'],
      [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hours'],
      [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minutes'],
      [(((seconds % 31536000) % 86400) % 3600) % 60, 'seconds'],
  ];
  var returntext = '';

  for (var i = 0, max = levels.length; i < max; i++) {
      if ( levels[i][0] === 0 ) continue;
      returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length-1): levels[i][1]);
  };
  return returntext.trim();
}
