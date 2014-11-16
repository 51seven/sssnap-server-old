var request = require('supertest');
var should = require('should');

var app = require('../../app');
describe('API Upload Routes', function() {
  var uploadId;
  var shortlink;

  describe('POST /api/upload', function() {
    it('should return a new upload object', function(done) {
      request(app)
        .post('/api/upload')
        .attach('file', 'test/files/funnydog.png')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          uploadId = res.body.id;
          shortlink = res.body.shortlink;
          res.body.should.have.property('title', 'funnydog.png');
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
          res.body.should.be.an.Array.and.have.lengthOf(1);
          res.body[0].should.have.property('id', uploadId);
          done();
        });
    })
  })

  describe('GET /api/upload/:upload_id', function() {
    it('should return the uploaded file', function(done) {
      request(app)
        .get('/app/upload/'+uploadId)
        .set('Accept', 'application/json')
        .expect(200);
      done();
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