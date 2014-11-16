var should = require('should');
var hmac = require('../app/helpers/hmac');
var status = require('../app/helpers/status');

describe('Helper functions', function() {
  it('should return a correct hmac signature', function() {
    var sig = hmac.createSignature('a', 'b', 'c', new Date(1416000000000));
    sig.should.equal('N2IxYmVlYTZjMGIzOWNlMzQ3YWYzODM5MzJhMWFmNGZkZDAyZWZkMA==');
  });
  it('should return a correct forbidden error', function() {
    var err = status.Forbidden('test');
    err.should.be.an.instanceOf(Object).and.have.properties({
      message: 'test',
      status: 403
    });
  });
  it('should return a correct bad request error', function() {
    var err = status.BadRequest('test');
    err.should.be.an.instanceOf(Object).and.have.properties({
      message: 'test',
      status: 400
    });
  });
});