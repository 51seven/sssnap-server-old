String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

var request = require('supertest');
var should = require('should');
var Qs = require('qs');

var app = require('../../app').express;

var uploadProperties = ['id', 'userid', 'title', 'shortlink', 'views', 'created', 'publicUrl', 'size', 'mimetype'];
var userProperties = ['id', 'name', 'email', 'image', 'oauth', 'quota'];
var userOauthProperties = ['provider', 'id'];
var userQuotaProperties = ['used', 'total', 'count'];

describe('API Upload Routes', function() {
  var uploadId, userId, shortlink, publicUrl, falsePublicUrl;

  describe('POST /api/upload', function() {
    it('should return a correct upload response object', function(done) {
      request(app)
        .post('/api/upload')
        .attach('file', 'test/files/funnydog.png')
        .set('Accept', 'application/json')
        .expect(201)
        .end(function(err, res) {
          uploadId = res.body.id;
          shortlink = res.body.shortlink;
          userId = res.body.user.id;

          // manipulate publicUrl for later tests
          var publicFullUrl = res.body.publicUrl;
          publicUrl = publicFullUrl.replace('https://localhost:3000', '');
          publicUrlQs = Qs.parse(publicUrl.split('?')[1]);
          var oldExpires = publicUrlQs.Expires*1;
          var newExpires = oldExpires + 1;
          falsePublicUrl = publicUrl.replace(oldExpires, newExpires);

          res.body.title.should.eql('funnydog.png');
          res.body.should.have.properties(uploadProperties);
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
        .expect(400, done);
    });

    it('should not allow other files than jpeg and png', function(done) {
      request(app)
        .post('/api/upload')
        .attach('file', 'test/files/fuckthis.gif')
        .set('Accept', 'application/json')
        .expect(400, done);
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
        .get('/api/upload/meh')
        .set('Accept', 'application/json')
        .expect(404, done);
    });
  });

  describe('GET /:shortlink', function() {
    it('should show the uploaded file', function(done) {
      var splitshortlink = shortlink.split('/');
      var shortid = splitshortlink[splitshortlink.length -1];
      request(app)
        .get('/'+shortid)
        .expect(200, done)
    });

    it('should throw a 404 when no file is found', function(done) {
      request(app)
        .get('/test123')
        .expect(404, done);
    });
  });

  describe('GET /files/pub/:userid/:filename', function(done) {
    it('should return the decrypted file with correct link', function(done) {
      request(app)
        .get(publicUrl)
        .expect(200, done);
    });

    it('should reject access with a false link', function(done) {
      request(app)
        .get(falsePublicUrl)
        .expect(403, done);
    });
  });
});