import { Component, h, State } from '@stencil/core';
import { loadingController } from '@ionic/core';
import { Http } from '@capacitor-mobi/http';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
})
export class AppHome {
  @State() serverUrl = 'http://localhost:3455';

  @State() output: string = '';

  loading: HTMLIonLoadingElement;

  async get(path = '/get', method = 'GET') {
    this.output = '';

    this.loading = await loadingController.create({
      message: 'Requesting...',
    });
    this.loading.present();

    try {
      const ret = await Http.request({
        method: method,
        url: this.apiUrl(path),
        headers: {
          'X-Fake-Header': 'Max was here',
        },
        params: {
          size: ['XL', 'L', 'M', 'S', 'XS'],
          music: 'cool',
        },
      });
      console.log('Got ret', ret);
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  getDefault = () => this.get();

  getGzip = () => this.get('/get-gzip');
  getJson = () => this.get('/get-json');
  getHtml = () => this.get('/get-html');

  head = () => this.get('/head', 'HEAD');
  delete = () => this.mutate('/delete', 'DELETE', { title: 'foo', body: 'bar', userId: 1 });
  patch = () => this.mutate('/patch', 'PATCH', { title: 'foo', body: 'bar', userId: 1 });
  post = () => this.mutate('/post', 'POST', { title: 'foo', body: 'bar', userId: 1 });
  put = () => this.mutate('/put', 'PUT', { title: 'foo', body: 'bar', userId: 1 });

  async mutate(path, method, data = {}) {
    this.output = '';
    this.loading = await loadingController.create({
      message: 'Requesting...',
    });
    this.loading.present();
    try {
      const ret = await Http[method.toLowerCase()]({
        url: this.apiUrl(path),
        method: method,
        headers: {
          'content-type': 'application/json',
        },
        data,
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  apiUrl = (path: string) => `${this.serverUrl}${path}`;

  testSetCookies = () => this.get('/set-cookies');

  formPost = async () => {
    this.output = '';
    this.loading = await loadingController.create({
      message: 'Requesting...',
    });
    this.loading.present();
    try {
      const ret = await Http.request({
        url: this.apiUrl('/form-data'),
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          name: 'Max',
          age: 5,
        },
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  };

  formPostMultipart = async () => {
    this.output = '';
    this.loading = await loadingController.create({
      message: 'Requesting...',
    });
    this.loading.present();
    try {
      const ret = await Http.request({
        url: this.apiUrl('/form-data-multi'),
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        data: {
          name: 'Max',
          age: 5,
        },
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  };

  setCookie = async () => {
    const ret = await Http.setCookie({
      url: this.apiUrl('/cookie'),
      key: 'language',
      value: 'en',
    });
    console.log(ret);
  };

  deleteCookie = async () => {
    const options = {
      url: this.apiUrl('/cookie'),
      key: 'language',
    };
    const ret = await Http.deleteCookie(options);
    console.log(ret);
  };

  clearCookies = async () => {
    const ret = await Http.clearCookies({ url: this.apiUrl('/') });
    console.log(ret);
  };

  getCookies = async () => {
    const ret = await Http.getCookies({
      url: this.apiUrl('/cookie'),
    });
    console.log('Got cookies', ret);
    this.output = JSON.stringify(ret.cookies);
  };

  testCookies = async () => {
    this.loading = await loadingController.create({
      message: 'Requesting...',
    });
    this.loading.present();
    try {
      const ret = await Http.request({
        method: 'GET',
        url: this.apiUrl('/cookie'),
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
    } catch (e) {
      this.output = `Error: ${e.message}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  };

  downloadFile = async () => {
    const ret = await Http.downloadFile({
      url: this.apiUrl('/download-pdf'),
      filePath: 'document.pdf',
    });

    console.log('Got download ret', ret);

    /*
    const renameRet = await Filesystem.rename({
      from: ret.path,
      to: 'document.pdf',
      toDirectory: FilesystemDirectory.Downloads
    });

    console.log('Did rename', renameRet);
    */

    if (ret.path) {
      // @ts-ignore
      const read = await Filesystem.readFile({
        path: 'document.pdf',
      });

      console.log('Read', read);
    }
  };

  uploadFile = async () => {
    const ret = await Http.uploadFile({
      url: this.apiUrl('/upload-pdf'),
      name: 'myFile',
      filePath: 'document.pdf',
    });

    console.log('Got upload ret', ret);
  };

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Home</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <ion-button onClick={this.getDefault}>GET</ion-button>
        <ion-button onClick={this.getGzip}>GET GZIP</ion-button>
        <ion-button onClick={this.getJson}>GET JSON</ion-button>
        <ion-button onClick={this.getHtml}>GET HTML</ion-button>
        <ion-button onClick={this.head}>HEAD</ion-button>
        <ion-button onClick={this.delete}>DELETE</ion-button>
        <ion-button onClick={this.patch}>PATCH</ion-button>
        <ion-button onClick={this.post}>POST</ion-button>
        <ion-button onClick={this.put}>PUT</ion-button>

        <ion-button onClick={this.testSetCookies}>Test Cookies Set</ion-button>

        <ion-button onClick={this.formPost}>Form Post</ion-button>
        <ion-button onClick={this.formPostMultipart}>Form Post Multipart</ion-button>

        <ion-button onClick={this.setCookie}>Set Cookie</ion-button>
        <ion-button onClick={this.getCookies}>Get Cookies</ion-button>
        <ion-button onClick={this.deleteCookie}>Delete Cookie</ion-button>
        <ion-button onClick={this.clearCookies}>Clear Cookies</ion-button>
        <ion-button onClick={this.testCookies}>Test Cookies</ion-button>

        <ion-button onClick={this.uploadFile}>Upload File</ion-button>
        <ion-button onClick={this.downloadFile}>Download File</ion-button>

        <h4>Output</h4>
        <pre id="output">{this.output}</pre>
      </ion-content>,
    ];
  }
}
