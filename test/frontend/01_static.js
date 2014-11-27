var request = require('supertest');

var app = require('../../app');

describe('Request to static page', function() {
  it('GET / should work', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});