#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(CAPHttpPlugin, "Http",
  CAP_PLUGIN_METHOD(request, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(setCookie, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getCookies, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(deleteCookie, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(clearCookies, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(downloadFile, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(uploadFile, CAPPluginReturnPromise);
)