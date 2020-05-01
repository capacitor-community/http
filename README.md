# Capacitor HTTP Plugin

Official plugin for native HTTP requests, file download/uploads, and cookie management.

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

