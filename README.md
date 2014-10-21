sssnap Server
=============

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
- [ ] The API answers with a good and meaningful response
- [ ] The API is only accessible with a private key
- [ ] The server registers a new user
- [ ] The server creates a session for a user