var request = require('supertest');

var app = require('../../app').express;

describe('Request to static page', function() {
  it('GET / should work', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});