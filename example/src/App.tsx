import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonLabel, IonRow, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react';

import { Http } from '@capacitor-community/http';

const defaultJsonBody = {
  foo: 'bar',
  fizz: 'buzz',
  boohoolean: true,
  num: 500,
};

const App = () => {
  const [url, setUrl] = useState<string>('http://localhost:3000/');
  const [body, setBody] = useState<string | null>(null);

  // Do this better...I'm sorry coding gods :'(
  const [key1, setKey1] = useState<string>('');
  const [key2, setKey2] = useState<string>('');
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');

  return (
    <React.Fragment>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Http Plugin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Url Entry */}
        <IonItem lines="none">
          <h4>API Url</h4>
        </IonItem>
        <IonItem>
          <IonInput value={url} onIonChange={e => setUrl(e.detail.value!)} />
        </IonItem>

        {/* Header Entry */}
        <IonItem lines="none">
          <h4>Headers</h4>
        </IonItem>
        <IonItem>
          <IonInput placeholder="Key" value={key1} onIonChange={e => setKey1(e.detail.value!)} />
          <IonInput placeholder="Value" value={value1} onIonChange={e => setValue1(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonInput placeholder="Key" value={key2} onIonChange={e => setKey2(e.detail.value!)} />
          <IonInput placeholder="Value" value={value2} onIonChange={e => setValue2(e.detail.value!)} />
        </IonItem>

        {/* Body Entry */}
        <IonItem>
          <IonLabel position="stacked">Body</IonLabel>
          <IonTextarea value={body} rows={6} onIonChange={e => setBody(e.detail.value!)} />
        </IonItem>
        <IonRow>
          <IonCol>
            <IonButton expand="full" color="primary" onClick={() => setBody(JSON.stringify(defaultJsonBody, null, 2))}>
              Set Default Body
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton expand="full" color="danger" onClick={() => setBody(null)}>
              Empty Body
            </IonButton>
          </IonCol>
        </IonRow>

        {/* Http Buttons */}
        <IonItem lines="none">
          <h4>Http Requests</h4>
        </IonItem>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                expand="full"
                color="primary"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'GET', map, body);
                }}
              >
                GET
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="success"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'POST', map, body);
                }}
              >
                POST
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="tertiary"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'PUT', map, body);
                }}
              >
                PUT
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                expand="full"
                color="dark"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'PATCH', map, body);
                }}
              >
                PATCH
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="danger"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'DELETE', map, body);
                }}
              >
                DELETE
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="secondary"
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  doRequest(url, 'LINK', map, body);
                }}
              >
                LINK
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                expand="full"
                color="warning"
                onClick={() => {
                  console.log('does nothing for now...');
                }}
              >
                Upload File
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="light"
                onClick={() => {
                  console.log('does nothing for now...');
                }}
              >
                Download File
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Cookie Buttons */}
        <IonItem lines="none">
          <h4>Cookies</h4>
        </IonItem>
        <IonRow>
          <IonCol>
            <IonButton expand="full" color="primary" onClick={() => Http.setCookie({ key: 'cookieKey', value: 'cookieValue', url })}>
              Set Test Cookie
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton
              expand="full"
              color="danger"
              onClick={() => {
                Http.deleteCookie({ key: 'cookieKey', url });
              }}
            >
              Delete Test Cookie
            </IonButton>
          </IonCol>
        </IonRow>
        <br />
      </IonContent>
    </React.Fragment>
  );
};

const makeHeaderMap = (key1: string, key2: string, value1: string, value2: string): Map<string, string> => {
  const output = new Map<string, string>();

  if (!!key1 && !!value1) output.set(key1, value1);
  if (!!key2 && !!value2) output.set(key2, value2);

  return output;
};

const doRequest = (url: string, method: string, headers: Map<string, string>, body?: any) => {
  if (body) {
    Http.request({
      url,
      method,
      headers: Object.fromEntries(headers),
      data: body,
    });
  } else {
    Http.request({
      url,
      method,
      headers: Object.fromEntries(headers),
    });
  }
};

export default App;
