# sssnap Server [![Build Status][travis-image]][travis-url] [![Test Coverage][coveralls-image]][coveralls-url] [![Dependency Status][dependency-image]][dependency-url]

Written in node.js with use of express.js (and some kind of own swagger interpretation).

### Functionality

The server provides an API which authorizes an user with OAuth2.0. The API has to be **fast** and **secure**.  
Also the server provides a frontend for the user.

Visit the [Wiki](https://github.com/51seven/sssnap-server/wiki) to learn how use the API.

### Requirements

- node.js
- mongodb

### Running the server

`npm start` Start in development environment  
`npm run production` Start in production environment

Milestones
----------

_also see [https://github.com/51seven/sssnap-server/milestones?state=open](https://github.com/51seven/sssnap-server/milestones?state=open)_

**v0.1.0 (started 2014-11-07)**  
- [ ] The API lists uploaded files with skip and limits
- [ ] The API lists more informations about the user
- [ ] The user can view an upload in the browser
- [ ] Every view of an upload increases a counter

**1st Milestone (started 2014-10-21) (closed 2014-11-05)**  
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