# Example Server

This example server can be used when testing the example Android and iOS applications in the `/example` folder of the `@capacitor-community/http` repo

## Routes

There are 7 Http methods included for each route

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS
- LINK

`LINK` is a common, but non-standard, Http method. It is used in the example server as a way of checking support for any custom Http verb. If it works with `LINK` it should work with any Http method.

### Route List

- `http://localhost:3000/`
  - Returns a 204 no content with no content-type header
- `http://localhost:3000/content-type/image`
  - Returns a 200 with a test image and a content-type of `image/jpeg`
- `http://localhost:3000/content-type/json`
  - Returns a 200 with a json body and a content-type of `application/json`
- `http://localhost:3000/content-type/multipart-form`
  - Returns a 200 with a mutlipart form body and a content-type of `multipart/form-data`
- `http://localhost:3000/content-type/octet-stream`
  - Returns a 200 with a binary body of `Hello World` and a content-type of `application/octet-stream`
- `http://localhost:3000/content-type/pdf`
  - Returns a 200 with a test .pdf file and a content-type of `application/pdf`
- `http://localhost:3000/content-type/plaintext`
  - Returns a 200 with an unparsed, but valid json body and a content-type of `text/plain; charset=utf-8`
- `http://localhost:3000/content-type/video`
  - Returns a 200 with 10MB video and a content-type of `video/mp4`
- `http://localhost:3000/content-type/xml`
  - Returns a 200 with a test .xml file and a content-type of `application/xml`
- `http://localhost:3000/content-type/zip`
  - Returns a 200 with a test .zip file and a content-type of `application/zip`

## Insomnia

[Insomnia](https://insomnia.rest/) is a tool for testing requests to and from a server. The `insomnia.json` file contains all of the routes for the server. It can be loaded in Insomnia so you can test the server manually.

## Testing

Testing only works locally for now. To test, run the webserver with `npm start` and then in another terminal/process run `npm test`
