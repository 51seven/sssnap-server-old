var request = require('supertest');
var should = require('should');

var app = require('../../app');

describe('API User Routes', function() {
  describe('GET /api/user', function() {
    it('should return the user object', function(done) {
      var mongoose = require('mongoose');
      request(app)
        .get('/api/user')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            image: 'https://lh4.googleusercontent.com/-xUelHR_l_mk/AAAAAAAAAAI/AAAAAAAACS4/zvs8v_wLjyo/photo.jpg',
            oauth: {
              provider: 'google',
              id: '113540964082774770000'
            }
          });
          done();
        });
    })
  })
})