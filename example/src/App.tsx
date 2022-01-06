import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonLabel, IonRow, IonTextarea, IonTitle, IonToolbar, IonSpinner, IonText } from '@ionic/react';
import React, { useCallback, useState } from 'react';

import { Http, HttpResponse } from '@capacitor-community/http';

const defaultJsonBody = {
  foo: 'bar',
  fizz: 'buzz',
  boohoolean: true,
  num: 500,
};

const App = () => {
  const [url, setUrl] = useState<string>('http://localhost:3000/');
  const [body, setBody] = useState<string | null>(null);
  const [response, setResponse] = useState<HttpResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  // Do this better...I'm sorry coding gods :'(
  const [key1, setKey1] = useState<string>('');
  const [key2, setKey2] = useState<string>('');
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');

  const handleRequest = useCallback((url: string, method: string, headers: Map<string, string>, body?: any) => {
    setError(undefined);
    setLoading(true);

    doRequest(url, method, headers, body)
      .then(value => setResponse(value))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

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
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonSpinner />
            <IonText>Loading...</IonText>
          </div>
        )}
        {error && <IonText style={{ color: 'red' }}>Error: {error.message ?? error.toString()}</IonText>}
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
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'GET', map, body);
                }}
              >
                GET
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="success"
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'POST', map, body);
                }}
              >
                POST
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="tertiary"
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'PUT', map, body);
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
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'PATCH', map, body);
                }}
              >
                PATCH
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="danger"
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'DELETE', map, body);
                }}
              >
                DELETE
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="full"
                color="secondary"
                disabled={loading}
                onClick={() => {
                  const map = makeHeaderMap(key1, key2, value1, value2);
                  handleRequest(url, 'LINK', map, body);
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
                disabled={loading}
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
                disabled={loading}
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
        {response && (
          <div>
            <p>Status: {response.status}</p>
            <p>Headers:</p>
            <ul>
              {Object.entries(response.headers).map(([key, value], i) => (
                <li key={i}>
                  {key}: {value}
                </li>
              ))}
            </ul>
            <p>Data:</p>
            <code style={{ whiteSpace: 'break-spaces' }}>{typeof response.data === typeof {} ? JSON.stringify(response.data, undefined, '\t') : response.data}</code>
          </div>
        )}
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

const doRequest = (url: string, method: string, headers: Map<string, string>, body?: any): Promise<HttpResponse> => {
  if (body) {
    return Http.request({
      url,
      method,
      headers: Object.fromEntries(headers),
      data: body,
    });
  } else {
    return Http.request({
      url,
      method,
      headers: Object.fromEntries(headers),
    });
  }
};

export default App;
