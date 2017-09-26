var smarterClock = function (config) {
    //set client to be passed between methods
    this.client = require('ntp-client');
    // if config is not passed, create an empty config object.
    if(!config){
        config = {};
    }
    //set your servers array that you will use only shifting to a new server when the first one quits working
    this.ntpServers = config.servers || [{server: this.client.defaultNtpServer, port: this.client.defaultNtpPort}];
    //current server index
    this.currentIndex = 0;
    //set current server using current server index
    this.currentServer = this.ntpServers[this.currentIndex];
    //tickrate for getting delta from ntp server
    this.tickRate = config.syncDelay || 300;
    // set the tickRate to milliseconds.
    this.tickRate = this.tickRate * 1000;
    //array containing delta values
    this.delta = [];
    //array upper limit. Once reached the oldest value will be discarded for the new value
    this.limit = config.history || 10;
    //do an initial sync
    this.syncTime();
    //start your interval to get deltas between your local time and ntp time
    this.startTick();
};
//this function is called when the current ntp server times out
smarterClock.prototype.shiftServer = function () {
    //if another server in ntpservers array shift current server to that server
    if (this.ntpServers[this.currentIndex + 1]) {
        this.currentIndex++;
        this.currentServer = this.ntpServers[this.currentIndex];
    }
};
//this function is called to start pulling your delta values from ntp using the tickRate set in the constructor
smarterClock.prototype.startTick = function () {
    //start interval
    setInterval(function () {
        //get ntp time
        this.getDelta();
    }.bind(this), this.tickRate);
};
//this function is used to get your sync time based on average of delta times
smarterClock.prototype.getTime = function () {
    //get sum of this.delta array
    var sum = this.delta.reduce(function (a, b) {
        return a + b;
    },0);
    //get avg delta of your local time compared to ntp time
    var avg = Math.round(sum / this.delta.length)||0;
    //return your time +/- the avg delta
    return ((new Date()).getTime() + avg);
};
//this function is used for a one off sync(adds one delta value to the this.delta array)
smarterClock.prototype.syncTime = function () {
    //get the ntp time
    this.getDelta();

};

smarterClock.prototype.getDelta = function (callback) {
    this.client.getNetworkTime(this.currentServer.server, this.currentServer.port, function (err, date) {
        if (err) {
            //shift server if an error happens
            console.log('Shifting to backup server');
            this.shiftServer();
        } else {
            //get delta value and push into this.delta array
            var tempServerTime = date.getTime();
            var tempLocalTime = (new Date()).getTime();
            if (this.delta.length === this.limit) {
                this.delta.shift();
            }
            var diff = tempServerTime - tempLocalTime;
            if (Math.abs(diff) < 1000) {
              this.delta.push(tempServerTime - tempLocalTime);
            } else {
                console.log('DIFF', diff);
            }
            //if callback passed in return current delta time
            if(callback) {
            callback(diff)
            }
        }
    }.bind(this))
};

//return smarterClock
module.exports = smarterClock;

