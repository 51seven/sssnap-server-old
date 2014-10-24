# sssnap Server [![Build Status][travis-image]][travis-url] [![Test Coverage][coveralls-image]][coveralls-url] [![Dependency Status][dependency-image]][dependency-url]

Written in node.js with use of express.js.  
This server offers a RESTful API for the [sssnap OSX Client](https://github.com/51seven/sssnap-osx-v2/blob/master/README.md).

### Functionality

The user can Login with Google+ and the sssnap client. Once authorized the server will either create a session for the user or register the user beforehand.  
The API will be secured using HMAC. Only clients who know the private key can communicate with the server.

### Production

For more information about the development procedure consider visiting the [sssnap OSX Client](https://github.com/51seven/sssnap-osx-v2/blob/master/README.md#production).

Milestones
----------

**1st Milestone (started 21/17/2014)**  
(_also see [https://github.com/51seven/sssnap-server/milestones?state=open](https://github.com/51seven/sssnap-server/milestones?state=open)_)

- [ ] The client can upload a file
- [x] The API answers with a good and meaningful response
- [x] The API is only accessible with a private key
- [ ] The server registers a new user
- [ ] The server creates a session for a user

[travis-image]: http://img.shields.io/travis/51seven/sssnap-server.svg?style=flat
[travis-url]: https://travis-ci.org/51seven/sssnap-server
[coveralls-image]: http://img.shields.io/coveralls/51seven/sssnap-server.svg?style=flat
[coveralls-url]: https://coveralls.io/r/51seven/sssnap-server
[dependency-image]: http://img.shields.io/david/51seven/sssnap-server.svg?style=flat
[dependency-url]: https://david-dm.org/51seven/sssnap-server