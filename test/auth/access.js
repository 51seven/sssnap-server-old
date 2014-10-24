var request = require('supertest');

var app = require('../../app')
  , helper = require('../../api/auth/helper');

process.env.NODE_ENV = 'production';

describe('Accessing the API', function() {
  describe('is forbidden with', function() {

    it('no Authorization header', function(done) {
      request(app)
        .get('/api/')
        .expect(403, done);
    });

    it('no x-snp-date header', function(done) {
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP abc:def')
        .expect(403, done);
    });

    it('a wrong ISO date', function(done) {
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP abc:def')
        .set('x-snp-date', '2000-03-10')
        .expect(403, done);
    });

    it('a too old ISO date', function(done) {
      var now = new Date();
      now.setMinutes(now.getMinutes() +6);
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP abc:def')
        .set('x-snp-date', now.toISOString())
        .expect(403, done);
    });

    it('a too early ISO date', function(done) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - 1);
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP abc:def')
        .set('x-snp-date', now.toISOString())
        .expect(403, done);
    });

    it('wrong client id', function(done) {
      var now = new Date();
      var string = 'GET\n/api/\n\n'+now.toISOString();
      var signature = helper.createHMAC(string, 'secret');
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP test:'+signature)
        .set('x-snp-date', now.toISOString())
        .expect(403, done);
    });

    it('wrong client secret', function(done) {
      var now = new Date();
      var string = "GET\n/api/\n\n"+now.toISOString();
      var signature = helper.createHMAC(string, 'nosecret');
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP test:'+signature)
        .set('x-snp-date', now.toISOString())
        .expect(403, done);
    });
  });


  describe('is allowed with', function() {

    it('correct client credentials', function(done) {
      var now = new Date();
      var string = "GET\n/api/\n\n"+now.toISOString();
      var signature = helper.createHMAC(string, 'secret');
      request(app)
        .get('/api/')
        .set('Authorization', 'SNP test:'+signature)
        .set('x-snp-date', now.toISOString())
        .expect(404, done);
    });
  });
});