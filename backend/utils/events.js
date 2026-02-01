const EventEmitter = require('events');

// Singleton emitter for in-process real-time notifications.
// For production scaling replace with Redis/Message-bus backed pub/sub.
class OrderEmitter extends EventEmitter {}

const emitter = new OrderEmitter();

module.exports = emitter;
