var should = require('should');

var helper = require('../../app/api/auth/helper');

describe('Authorization Helper', function() {
  describe('convertBodyToHash', function() {
    var hash = helper.convertBodyToHash({'key': 'value'});
    it('should return a correct md5 hash', function() {
      var decoded = new Buffer(hash, 'base64').toString();
      decoded.should.equal('ef176a6c424f954fa42d4cde03949897');
    })
    it('should return a correct base64 string', function() {
      hash.should.equal('ZWYxNzZhNmM0MjRmOTU0ZmE0MmQ0Y2RlMDM5NDk4OTc=');
    });
  });
  describe('createHMAC', function() {
    var hmac = helper.createHMAC('testmessage', 'secret');
    it('should return a correct HMAC-SHA1 hash', function() {
      var decoded = new Buffer(hmac, 'base64').toString();
      decoded.should.equal('2850443b1b5c46a4e487ae66b8205ccfc0f14e58');
    })
    it('should return a correct base64 string', function() {
      hmac.should.equal('Mjg1MDQ0M2IxYjVjNDZhNGU0ODdhZTY2YjgyMDVjY2ZjMGYxNGU1OA==');
    });
  });
  describe('extractAuthorization', function() {
    it('should return an object with two values', function() {
      var arr = helper.extractAuthorization("SNP abc:def");
      arr.should.be.type('object');
      arr[0].should.equal('abc');
      arr[1].should.equal('def');
    });
  });
});