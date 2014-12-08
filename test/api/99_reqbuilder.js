var request = require('supertest');
var should = require('should');

var app = require('../../app').express;

describe('Request Object Builder', function() {
  it('should exclude a normal key', function(done) {
    request(app)
      .get('/api/upload?exclude=user')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.should.not.have.property('user');
        done();
      });
  });
  it('should exclude two normal keys', function(done) {
    request(app)
      .get('/api/upload?exclude=user,uploads')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.should.not.have.property('user');
        res.body.should.not.have.property('uploads');
        done();
      });
  });
  it('should exclude a nested key', function(done) {
    request(app)
      .get('/api/upload?exclude=user.id')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.user.should.not.have.property('id');
        done();
      });
  });
  it('should exclude more nested keys', function(done) {
    request(app)
      .get('/api/upload?exclude=user.id,user.name')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.user.should.not.have.property('id');
        res.body.user.should.not.have.property('name');
        done();
      });
  });
  it('should exclude and include nested keys', function(done) {
    request(app)
      .get('/api/upload?exclude=user&include=user.id')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.user.should.have.property('id');
        res.body.user.should.not.have.property('name');
        done();
      });
  });
  it('should exclude nested keys in an array', function(done) {
    request(app)
      .get('/api/upload?exclude=uploads.id')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.uploads[0].should.not.have.property('id');
        res.body.uploads[0].should.have.property('userid');
        done();
      });
  });
  it('should exclude and include nested keys in an array', function(done) {
    request(app)
      .get('/api/upload?exclude=uploads&include=uploads.id')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.uploads[0].should.not.have.property('userid');
        res.body.uploads[0].should.have.property('id');
        done();
      });
  });
  it('should use select as shorthand for exclude and include', function(done) {
    request(app)
      .get('/api/upload?select=uploads.id')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.uploads[0].should.have.property('id');
        res.body.uploads[0].should.not.have.property('userid');
        res.body.should.not.have.property('user');
        done();
      });
  });
});