var InDevice = require('./lib/device')
  , util = require('util')
  , stream = require('stream');

// Give our module a stream interface
util.inherits(myModule,stream);

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default module configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the cloud
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the cloud
 */
function myModule(opts,app) {

  var self = this;

  app.on('client::up',function(){

    // The client is now connected to the cloud

    // Do stuff with opts, and then commit it to disk
    if (!opts.hasMutated) {
      opts.hasMutated = true;
    }

    self.save();

    // Register a device
    self.emit('register', new InDevice('iso.3.6.1.2.1.2.2.1.10.1', '1'));
    self.emit('register', new InDevice('iso.3.6.1.2.1.2.2.1.16.1', '2'));
  });
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
myModule.prototype.config = function(config) {
   console.log('Config data:' + config);
};

// Export it
module.exports = myModule;