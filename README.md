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
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-6-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

# This branch is for Capacitor 2.x. For Capacitor 3.x, see `https://github.com/capacitor-community/http/tree/master`

## Maintainers

| Maintainer | GitHub | Social |
| -----------| -------| -------|
| Max Lynch | [mlynch](https://github.com/mlynch) | [@maxlynch](https://twitter.com/maxlynch) |
| Thomas Vidas | [thomasvidas](https://github.com/thomasvidas) | [@thomasvidas](https://twitter.com/thomasvidas) |

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

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(Http.class);
    }});
  }
}
```

## Configuration

No configuration required for this plugin

## Usage

To use the plugin while fully supporting the web version, import and use it like this:

```typescript
// Must import the package once to make sure the web support initializes
import '@capacitor-community/http';

import { Plugins } from '@capacitor/core';

// Example of a GET request
const doGet = () => {
  // Destructure as close to usage as possible for web plugin to work correctly
  // when running in the browser
  const { Http } = Plugins;

  const ret = await Http.request({
    method: 'GET',
    url: 'https://example.com/my/api',
    headers: {
      'X-Fake-Header': 'Max was here'
    },
    params: {
      'size': 'XL'
    }
  });
};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = () => {
  const { Http } = Plugins;

  const ret = await Http.request({
    method: 'POST',
    url: 'https://example.com/my/api',
    headers: {
      'X-Fake-Header': 'Max was here',
      'Content-Type': 'application/json'
    },
    data: {
      foo: 'bar',
      cool: true
    }
  });
}

const setCookie = async () => {
  const { Http } = Plugins;

  const ret = await Http.setCookie({
    url: this.apiUrl('/cookie'),
    key: 'language',
    value: 'en'
  });
}

const deleteCookie = async () => {
  const { Http } = Plugins;

  const ret = await Http.deleteCookie({
    url: this.apiUrl('/cookie'),
    key: 'language',
  });
}

const clearCookies = async () => {
  const { Http } = Plugins;

  const ret = await Http.clearCookies({
    url: this.apiUrl('/cookie'),
  });
}

const getCookies = async () => {
  const { Http } = Plugins;

  const ret = await Http.getCookies({
    url: this.apiUrl('/cookie')
  });
  console.log('Got cookies', ret);
  this.output = JSON.stringify(ret.value);
};

const downloadFile = async () => {
  const { Http } = Plugins;
  const ret = await Http.downloadFile({
    url: 'https://example.com/path/to/download.pdf',
    filePath: 'document.pdf',
    fileDirectory: FilesystemDirectory.Downloads
  });
  if (ret.path) {
    const read = await Filesystem.readFile({
      path: 'download.pdf',
      directory: FilesystemDirectory.Downloads
    });
    // Data is here
  }
}

const uploadFile = async () => {
  const { Http } = Plugins;
  const ret = await Http.uploadFile({
    url: 'https://example.com/path/to/upload.pdf',
    name: 'myFile',
    filePath: 'document.pdf',
    fileDirectory: FilesystemDirectory.Downloads
  });
}
```

## API Reference

Coming soon

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/danielsogl"><img src="https://avatars2.githubusercontent.com/u/15234844?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Sogl</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=danielsogl" title="Documentation">📖</a></td>
    <td align="center"><a href="http://priyankpatel.io"><img src="https://avatars3.githubusercontent.com/u/5585797?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Priyank Patel</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=priyankpat" title="Code">💻</a></td>
    <td align="center"><a href="http://ionicframework.com/"><img src="https://avatars3.githubusercontent.com/u/11214?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max Lynch</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=mlynch" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/pixelbucket-dev"><img src="https://avatars3.githubusercontent.com/u/12937991?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Falk Schieber</b></sub></a><br /><a href="https://github.com/capacitor-community/http/pulls?q=is%3Apr+reviewed-by%3Apixelbucket-dev" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/andysousa"><img src="https://avatars0.githubusercontent.com/u/42151009?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andy Sousa</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=andysousa" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/thomasvidas"><img src="https://avatars.githubusercontent.com/u/8182078?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Vidas</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=thomasvidas" title="Code">💻</a> <a href="#maintenance-thomasvidas" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
