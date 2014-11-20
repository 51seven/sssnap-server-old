var request = require('supertest');
var should = require('should');

var app = require('../../app');

var uploadProperties = ['id', 'userid', 'title', 'shortlink', 'views', 'created', 'info'];
var uploadInfoProperties = ['publicUrl', 'size', 'mimetype']
var userProperties = ['id', 'name', 'email', 'image', 'oauth', 'quota'];
var userOauthProperties = ['provider', 'id'];
var userQuotaProperties = ['used', 'total', 'count'];

describe('API Upload Routes', function() {
  var uploadId, userId, shortlink;

  describe('POST /api/upload', function() {
    it('should return a correct upload response object', function(done) {
      request(app)
        .post('/api/upload')
        .attach('file', 'test/files/funnydog.png')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          uploadId = res.body.id;
          shortlink = res.body.shortlink;
          userId = res.body.user.id;
          res.body.title.should.eql('funnydog.png');
          res.body.should.have.properties(uploadProperties);
          res.body.info.should.have.properties(uploadInfoProperties);
          res.body.user.should.have.properties(userProperties);
          res.body.user.oauth.should.have.properties(userOauthProperties);
          res.body.user.quota.should.have.properties(userQuotaProperties);
          done();
        });
    });

    it('should not allow no file', function(done) {
      request(app)
        .post('/api/upload')
        .set('Accept', 'application/json')
        .expect(400);
      done();
    });
  });

  describe('GET /api/upload', function() {
    it('should list the uploaded file', function(done) {
      request(app)
        .get('/api/upload')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties('user', 'uploads');
          res.body.user.should.have.properties(userProperties);
          res.body.user.oauth.should.have.properties(userOauthProperties);
          res.body.user.quota.should.have.properties(userQuotaProperties);
          res.body.user.id.should.eql(userId);
          // Is the upload in the upload object?
          res.body.uploads.should.be.an.Array.and.have.lengthOf(1);
          res.body.uploads[0].should.have.properties(uploadProperties);
          res.body.uploads[0].info.should.have.properties(uploadInfoProperties);
          // Is the correct upload in the upload object?
          res.body.uploads[0].id.should.eql(uploadId);
          done();
        });
    })
  })

  describe('GET /api/upload/:upload_id', function() {
    it('should return the uploaded file', function(done) {
      request(app)
        .get('/api/upload/'+uploadId)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties(uploadProperties);
          res.body.info.should.have.properties(uploadInfoProperties);
          res.body.id.should.eql(uploadId);
          res.body.user.should.have.properties(userProperties);
          res.body.user.oauth.should.have.properties(userOauthProperties);
          res.body.user.quota.should.have.properties(userQuotaProperties);
          res.body.user.id.should.eql(userId);
          res.body.shortlink.should.eql(shortlink);
          done();
        });
    });

    it('should throw a 404 when no file is found', function(done) {
      request(app)
        .get('/app/upload/meh')
        .set('Accept', 'application/json')
        .expect(404);
      done();
    });
  });

  describe('GET /:shortlink', function() {
    it('should show the uploaded file', function(done) {
      var splitshortlink = shortlink.split('/');
      var shortid = splitshortlink[splitshortlink.length -1];
      request(app)
        .get('/'+shortid)
        .expect(200);
      done();
    });

    it('should throw a 404 when no file is found', function(done) {
      request(app)
        .get('test123')
        .expect(404);
      done();
    });
  });
});