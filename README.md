# Capacitor HTTP Plugin

Official plugin for native HTTP requests, file download/uploads, and cookie management.

## Maintainers

| Maintainer | GitHub | Social | Sponsoring Company |
------------------------------------------------------
| Max Lynch | [mlynch](https://github.com/mlynch) | [@maxlynch](https://twitter.com/maxlynch) | Ionic |

## Installation

```bash
npm install @capacitor/http
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

## Usage

To use the plugin while fully supporting the web version, import and use it like this:

```typescript
// Must import the package once to make sure the web support initializes
import '@capacitor/http';

import { Plugins } from '@capacitor/core';

// Example of a GET request
const doGet = () => {
  // Destructure as close to usage as possible for web plugin to work correctly
  // when running in the browser
  const { Http } = Plugins;

  const ret = await Http.request({
    method: 'GET',
    url: 'https://example.com/my/api,
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
    url: 'https://example.com/my/api,
    headers: {
      'X-Fake-Header': 'Max was here'
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
    url: 'https://example.com/path/to/download.pdf'),
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
