var smarterclock = require('./index.js');

var clock = new smarterclock({});

   var syncTime = clock.getTime();
   console.log('SyncTime:' + syncTime);
setInterval(function(){
   var localTime = new Date().getTime();
   var syncTime = clock.getTime();
   var drift = parseInt(localTime) - parseInt(syncTime);

   console.log('SyncTime:' + syncTime + ' vs LocalTime: ' + localTime + ' Difference: ' + drift + 'ms');
},5000);
