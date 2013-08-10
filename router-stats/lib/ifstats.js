
var stream = require('stream')
  , util = require('util')
  , exec = require('child_process').exec,
    child;

// Give our module a stream interface
util.inherits(InDevice,stream);

// Export it
module.exports=InDevice;

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the cloud
 *
 * @fires data - Emit this when you wish to send data to the cloud
 */


function InDevice() {

  var self = this, 
	lastInOctets = -1,
	deltabps = 0,
	interval = 30000,
	lastHour = 0,
	startOfHourReading = 0;
  const max = 4294967296;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = false;

  this.G = "1"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 2000; // 2000 is a generic Ninja Blocks sandbox device

  process.nextTick(function() {
    setInterval(function() {

      child = exec('snmpget -v1 -c public 192.168.1.1 iso.3.6.1.2.1.2.2.1.10.1 | cut -d : -f 2',
      function (error, stdout, stderr) {
        stdout.replace(/(\n|\r|\r\n)$/, '');
	var now = new Date();
	var curr_hour = now.getHours();

	deltabps = 0;
	var inOctets = parseInt(stdout);
        if (lastInOctets > 0)
	{
	   if (curr_hour != lastHour) 
	   {
	     startOfHourReading = lastInOctets;
	   }
	   var delta = 0;
	   if (inOctets < startOfHourReading)
	   {
	      delta = inOctets - startOfHourReading + max;
	   } else
	   {
	      delta = inOctets - startOfHourReading;
	   }
	   deltabps = delta / 1024 / 1024;
	   self.emit('data',deltabps);
	} else
	{
	   startOfHourReading = inOctets;
	}
        console.log("In Mb " + deltabps);
	lastInOctets = inOctets;
	lastHour = curr_hour;
      });

      }, interval);
  });
};
//util.inherits(InDevice, Device);

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
InDevice.prototype.write = function(data) {

  // I'm being actuated with data!
  console.log(data);
  if (data.startsWith("interval"))
  {
     var newinterval = data.split(" ",2);
     if (isNan(newinterval))
     {
        console.log("Invalid interval:" + newinterval);
     } else
     {
	interval = newinterval;
	console.log("New interval:" + newinterval);
     }
  }
};
