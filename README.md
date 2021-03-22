<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">HTTP</h3>
<p align="center"><strong><code>@capacitor-community/http</code></strong></p>
<p align="center">
  Capacitor community plugin for native HTTP requests, file download/uploads, and cookie management.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2021?style=flat-square" />
  <a href="https://github.com/capacitor-community/http/actions?query=workflow%3A%22Test+and+Build+Plugin%22"><img src="https://img.shields.io/github/workflow/status/capacitor-community/http/Test%20and%20Build%20Plugin?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/l/@capacitor-community/http?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/dw/@capacitor-community/http?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/v/@capacitor-community/http?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-4-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer | GitHub                              | Social                                    |
| ---------- | ----------------------------------- | ----------------------------------------- |
| Max Lynch  | [mlynch](https://github.com/mlynch) | [@maxlynch](https://twitter.com/maxlynch) |

## Installation

```bash
npm install @capacitor-community/http
npx cap sync
```

On iOS, no further steps are needed.

On Android, register the plugin in your main activity:

```java
import com.getcapacitor.plugin.http.Http;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(Http.class);
  }
}

```

## Configuration

No configuration required for this plugin

## Usage

To use the plugin while fully supporting the web version, import and use it like this:

```typescript
import { Http } from '@capacitor-community/http';


// Example of a GET request
const doGet = () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Max was here' },
    params: { size: 'XL' },
  }

  const response: HttpResponse = await Http.get(options)
  
  // or...
  // const response = await Http.request({ ...options, method: 'GET' })
};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Thomas was here' },
    data: { foo: 'bar', cool: true, },
  }

  const response: HttpResponse = await Http.post(options)

  // or...
  // const response = await Http.request({ ...options, method: 'POST' })
};

const setCookie = async () => {
  const options = {
    url: 'http://example.com',
    key: 'language',
    value: 'en',
  };

  await Http.setCookie(options);
};

const deleteCookie = async () => {
  const options = {
    url: 'http://example.com',
    key: 'language',
  };

  await Http.deleteCookie(options);
};

const clearCookies = async () => {
  await Http.clearCookies({ url: 'http://example.com' });
};

const getCookies = async () => {
  const cookies: HttpCookie[] = await Http.getCookies({ url: 'http://example.com' });
};

const downloadFile = async () => {
  const options = {
    url: 'https://example.com/path/to/download.pdf',
    filePath: 'document.pdf',
    fileDirectory: FilesystemDirectory.Downloads,
  }

  // Writes to local filesystem
  const response: HttpDownloadFileResult = await Http.downloadFile(options);

  // Then read the file
  if (response.path) {
    const read = await Filesystem.readFile({
      path: 'download.pdf',
      directory: FilesystemDirectory.Downloads,
    });
  }
};

const uploadFile = async () => {
  const options = {
    url: 'https://example.com/path/to/upload.pdf',
    name: 'myFile',
    filePath: 'document.pdf',
    fileDirectory: FilesystemDirectory.Downloads,
  }

  const response: HttpUploadFileResult = await Http.uploadFile();
};
```

## API Reference

Coming soon

### Third Party Cookies on iOS

As of iOS 14, you cannot use 3rd party cookies by default. There is an open issue on the Capacitor Core repo on properly patching in cookies on iOS. For now, you must specify a domain of for the cookie you are saving to properly save and send them via requests. You can also add the following lines to your `Info.plist` file to get better support for cookies on iOS. You can add up to 10 domains.

```xml
<key>WKAppBoundDomains</key>
<array>
    <string>www.mydomain.com</string>
    <string>api.mydomain.com</string>
    <string>www.myothercooldomain.com</string>
</array>
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/danielsogl"><img src="https://avatars2.githubusercontent.com/u/15234844?v=4" width="100px;" alt=""/><br /><sub><b>Daniel Sogl</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=danielsogl" title="Documentation">📖</a></td>
    <td align="center"><a href="http://priyankpatel.io"><img src="https://avatars3.githubusercontent.com/u/5585797?v=4" width="100px;" alt=""/><br /><sub><b>Priyank Patel</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=priyankpat" title="Code">💻</a></td>
    <td align="center"><a href="http://ionicframework.com/"><img src="https://avatars3.githubusercontent.com/u/11214?v=4" width="100px;" alt=""/><br /><sub><b>Max Lynch</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=mlynch" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/andysousa"><img src="https://avatars0.githubusercontent.com/u/42151009?v=4" width="100px;" alt=""/><br /><sub><b>Andy Sousa</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=andysousa" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/pixelbucket-dev"><img src="https://avatars3.githubusercontent.com/u/12937991?v=4" width="100px;" alt=""/><br /><sub><b>Falk Schieber</b></sub></a><br /><a href="https://github.com/capacitor-community/http/pulls?q=is%3Apr+reviewed-by%3Apixelbucket-dev" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
