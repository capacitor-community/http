<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">HTTP</h3>
<p align="center"><strong><code>@capacitor-community/http</code></strong></p>
<p align="center">
  Capacitor community plugin for native HTTP requests, file download/uploads, and cookie management.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2022?style=flat-square" />
  <a href="https://github.com/capacitor-community/http/actions?query=workflow%3A%22Test+and+Build+Plugin%22"><img src="https://img.shields.io/github/workflow/status/capacitor-community/http/Test%20and%20Build%20Plugin?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/l/@capacitor-community/http?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/dw/@capacitor-community/http?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/http"><img src="https://img.shields.io/npm/v/@capacitor-community/http?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-23-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer   | GitHub                                        | Social                                          |
| ------------ | --------------------------------------------- | ----------------------------------------------- |
| Max Lynch    | [mlynch](https://github.com/mlynch)           | [@maxlynch](https://twitter.com/maxlynch)       |
| Thomas Vidas | [thomasvidas](https://github.com/thomasvidas) | [@thomasvidas](https://twitter.com/thomasvidas) |

## Installation

```bash
npm install @capacitor-community/http
npx cap sync
```

## Maintence Mode
The next iteration of this plugin will be an [official plugin bundled with Capacitor 4.x](https://github.com/ionic-team/capacitor/issues/5145). In order for a smooth transition, this repo will be in maintence mode with no new features added until the plugin moves to the main [Capacitor Plugins repo](https://github.com/ionic-team/capacitor-plugins). In the meantime, if there *are* critical security bug fixes required, they will still be made to this plugin as a patch release.

### Capacitor 2.x

For Capacitor 2.x projects, you will need to install a version less than 1.0.0. You can do that by specifying the version in your `package.json` or installing like this. The latest 2.x compatible version is `0.3.1`.

```bash
npm install @capacitor-community/http@0.x
```

## Configuration

In most cases no configuration is required for this plugin.
If the Android application connects with use the self-signed certificates or without encryption, see [Network security configuration](https://developer.android.com/training/articles/security-config) article.

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
  };

  const response: HttpResponse = await Http.get(options);

  // or...
  // const response = await Http.request({ ...options, method: 'GET' })
};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Thomas was here' },
    data: { foo: 'bar', cool: true },
  };

  const response: HttpResponse = await Http.post(options);

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
  const cookies: HttpCookie[] = await Http.getCookies({
    url: 'http://example.com',
  });
};

const downloadFile = async () => {
  const options = {
    url: 'https://example.com/path/to/download.pdf',
    filePath: 'document.pdf',
    fileDirectory: Directory.Downloads,
    // Optional
    method: 'GET',
  };

  // Writes to local filesystem
  const response: HttpDownloadFileResult = await Http.downloadFile(options);

  // Then read the file
  if (response.path) {
    const read = await Filesystem.readFile({
      path: 'download.pdf',
      directory: Directory.Downloads,
    });
  }
};

const uploadFile = async () => {
  const options = {
    url: 'https://example.com/path/to/upload.pdf',
    name: 'myFile',
    filePath: 'document.pdf',
    fileDirectory: FilesystemDirectory.Downloads,
  };

  const response: HttpUploadFileResult = await Http.uploadFile(options);
};
```

## API Reference

You can view the API Reference generated by TypeDoc here: https://capacitor-community.github.io/http/docs/classes/web.httpweb.html

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
    <td align="center"><a href="https://github.com/danielsogl"><img src="https://avatars2.githubusercontent.com/u/15234844?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Sogl</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=danielsogl" title="Documentation">📖</a></td>
    <td align="center"><a href="http://priyankpatel.io"><img src="https://avatars3.githubusercontent.com/u/5585797?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Priyank Patel</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=priyankpat" title="Code">💻</a></td>
    <td align="center"><a href="http://ionicframework.com/"><img src="https://avatars3.githubusercontent.com/u/11214?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max Lynch</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=mlynch" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/pixelbucket-dev"><img src="https://avatars3.githubusercontent.com/u/12937991?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Falk Schieber</b></sub></a><br /><a href="https://github.com/capacitor-community/http/pulls?q=is%3Apr+reviewed-by%3Apixelbucket-dev" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/andysousa"><img src="https://avatars0.githubusercontent.com/u/42151009?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andy Sousa</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=andysousa" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/thomasvidas"><img src="https://avatars.githubusercontent.com/u/8182078?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Vidas</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=thomasvidas" title="Code">💻</a> <a href="#maintenance-thomasvidas" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/emily-curry"><img src="https://avatars.githubusercontent.com/u/20479454?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Emily Curry</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=emily-curry" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/graefenhain"><img src="https://avatars.githubusercontent.com/u/88032701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>graefenhain</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=graefenhain" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/asztal"><img src="https://avatars.githubusercontent.com/u/68302?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lee Houghton</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Aasztal" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/FelixSchwarzmeier"><img src="https://avatars.githubusercontent.com/u/23665008?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Felix Schwarzmeier</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=FelixSchwarzmeier" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jkbz64"><img src="https://avatars.githubusercontent.com/u/13223538?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kamil Jakubus</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=jkbz64" title="Code">💻</a></td>
    <td align="center"><a href="http://joeflateau.net/"><img src="https://avatars.githubusercontent.com/u/643331?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joe Flateau</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Ajoeflateau" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Frank608"><img src="https://avatars.githubusercontent.com/u/56638143?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frank608</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3AFrank608" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/JoelNietoTec"><img src="https://avatars.githubusercontent.com/u/6298693?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joel Nieto</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3AJoelNietoTec" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/ultimate-tester"><img src="https://avatars.githubusercontent.com/u/580758?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ultimate-tester</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=ultimate-tester" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/sgzadrian"><img src="https://avatars.githubusercontent.com/u/12704905?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrian Sanchez</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Asgzadrian" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/milanc"><img src="https://avatars.githubusercontent.com/u/8333458?v=4?s=100" width="100px;" alt=""/><br /><sub><b>milanc</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=milanc" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/herecoulbeyourname"><img src="https://avatars.githubusercontent.com/u/57253976?v=4?s=100" width="100px;" alt=""/><br /><sub><b>herecoulbeyourname</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=herecoulbeyourname" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Landschaft"><img src="https://avatars.githubusercontent.com/u/10559398?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Landschaft</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=Landschaft" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/stonewoodman"><img src="https://avatars.githubusercontent.com/u/2945329?v=4?s=100" width="100px;" alt=""/><br /><sub><b>stonewoodman</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Astonewoodman" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/mghcs87"><img src="https://avatars.githubusercontent.com/u/17180632?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Héctor Cruz</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Amghcs87" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/patrickbussmann"><img src="https://avatars.githubusercontent.com/u/15617021?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Patrick Bußmann</b></sub></a><br /><a href="https://github.com/capacitor-community/http/commits?author=patrickbussmann" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jesperbjerke"><img src="https://avatars.githubusercontent.com/u/5323483?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jesper Bjerke</b></sub></a><br /><a href="https://github.com/capacitor-community/http/issues?q=author%3Ajesperbjerke" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
