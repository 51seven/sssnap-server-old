# sssnap Server [![Build Status][travis-image]][travis-url] [![Test Coverage][coveralls-image]][coveralls-url] [![Dependency Status][dependency-image]][dependency-url]

Written in node.js with use of express.js.  
This server offers a RESTful API for the [sssnap OSX Client](https://github.com/51seven/sssnap-osx-v2/blob/master/README.md).

### Functionality

In the sssnap client the user will log in with Google (or an other OAuth2.0 provider). After logging in the client calls an API route to get more informations about the user. This route is used to register new users.  
The API will only be accessible with an `access_token` from an OAuth2.0 provider. The `access_token` is added together with a `from` parameter to the called URL. The `from` parameter tells the server from which OAuth2.0 provider the `access_token` is generated. For example:
`http://localhost:3000/api/upload?access_token=ab.cd123efg45678hij&from=google`

At the moment the `from` parameter is not required, because only Google is supported.

### Running the API

`npm start` Start in development environment  
`npm run production` Start in production environment

### Production

For more information about the development procedure consider visiting the [sssnap OSX Client](https://github.com/51seven/sssnap-osx-v2/blob/master/README.md#production).

Milestones
----------

**1st Milestone (started 21/17/2014)**  
(_also see [https://github.com/51seven/sssnap-server/milestones?state=open](https://github.com/51seven/sssnap-server/milestones?state=open)_)

- [x] The client can upload a file
- [x] The API answers with a good and meaningful response
- [x] The API is only accessible with a private key
- [x] The server registers a new user

[travis-image]: http://img.shields.io/travis/51seven/sssnap-server.svg?style=flat
[travis-url]: https://travis-ci.org/51seven/sssnap-server
[coveralls-image]: http://img.shields.io/coveralls/51seven/sssnap-server.svg?style=flat
[coveralls-url]: https://coveralls.io/r/51seven/sssnap-server
[dependency-image]: http://img.shields.io/david/51seven/sssnap-server.svg?style=flat
[dependency-url]: https://david-dm.org/51seven/sssnap-server