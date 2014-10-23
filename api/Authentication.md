Authentication Procedure
=======================

This authentication uses client credentials together with an HMAC-SHA1 encryption of the body sent along the request. In a development environment the authentication will be skipped.

A client needs client credentials, more precisely a public and private key, to access the API.

### Example Request

An example of a HTTP Request could look like this:

```
POST /api/upload HTTP/1.1  
Host: localhost:3000  
Date: Thu, 23 Oct 2014 23:23:11 +0200  
  
Authorization: SNP TEST123CLIENT:jEyNTEyMmE1YQ==  
x-snp-date: 2014-10-23T21:23:10Z  
```

Authentication Header
---------------------

To be authenticated the client needs to create a Signature. This Signature will be send together with the clients public key in the standard HTTP `Authorization` header.  
You need to [send the UTC Date](https://github.com/51seven/sssnap-server/blob/master/api/Authentication.md#life-time-of-the-signature) in a special HTTP header field named `x-snp-date`.

```
Authorization: SNP PublicKey:Signature
```

### Creating a Signature

First the client needs to create a string, which will be signed later. This string consists of 4 parts:
- The HTTP Verb (`GET`, `POST`, `PUT`, `DELETE`)
- The URL path without the host, including `/api` (e.g. `/api/upload`)
- A string in base64 of the data the client sends in the HTTP body of his request. If there is no data in the body this will be an empty string. **[More information on how to convert the body.](https://github.com/51seven/sssnap-server/blob/master/api/Authentication.md#converting-the-data)
- The current Date using UTC Format (e.g. `2014-10-23T21:23:10Z`)

Build your string in the following way:  
```
HTTPVerb + "\n" +
URLPath + "\n" +
HashedData + "\n" + 
UTCDate
```

The strings will look like this:  
```
POST\n
/api/upload\n
Mzg3MjdmNTM0OTdiZjg1ZTBiYTYwZGU0MDNjNjFiODM=\n
2014-10-23T21:23:10Z
```

```
GET\n
/api/upload/1-10\n
\n
2014-10-23T21:23:10Z
```

Now encrypt this string using `HMAC-SHA1` (with an HEX representation as hash). Encode this HEX hash to base64. You will get something like this:  
`NGVlNTRmYWQ5OTJlNzZmOWM0MmQ0ZmIxMjJiMTJlMTFmYTlmYTgyOQ==`

This is the Signature you need for your request.

### Life Time of the Signature

To prevent Reply Attacks this Signature will only be valid 5 minutes long, starting with the UTC Date you provided in your string. Save the UTC Time Code you added in your string and send it in your request in a HTTP header field with the name `x-snp-date`. It's important that the UTC hashed in your Signature and the UTC in the `x-snp-date` field are *exactly* the same.

### Converting the data

1. The data in the HTTP body has to be in a raw format, ignoring any files.  
`key1=value1&key2=value2&key3=value3`

2. This string will be encrypted using `md5`.  
`38727f53497bf85e0ba60de403c61b83`

3. Encode this hash into a base64 representation.  
`Mzg3MjdmNTM0OTdiZjg1ZTBiYTYwZGU0MDNjNjFiODM=`

