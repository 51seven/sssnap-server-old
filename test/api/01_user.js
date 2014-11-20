var request = require('supertest');
var should = require('should');

var app = require('../../app');

var userProperties = ['id', 'name', 'email', 'image', 'oauth', 'quota'];
var userOauthProperties = ['provider', 'id'];
var userQuotaProperties = ['used', 'total', 'count'];

describe('API User Routes', function() {
  describe('GET /api/user/me', function() {
    it('should return the user object', function(done) {
      var mongoose = require('mongoose');
      request(app)
        .get('/api/user/me')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties(userProperties);
          res.body.oauth.should.have.properties(userOauthProperties);
          res.body.quota.should.have.properties(userQuotaProperties);
          done();
        });
    })
  })
})