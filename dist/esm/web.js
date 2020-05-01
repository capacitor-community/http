var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebPlugin } from '@capacitor/core';
export class HttpPluginWeb extends WebPlugin {
    constructor() {
        super({
            name: 'Http',
            platforms: ['web', 'electron']
        });
    }
    getRequestHeader(headers, key) {
        const originalKeys = Object.keys(headers);
        const keys = Object.keys(headers).map(k => k.toLocaleLowerCase());
        const lowered = keys.reduce((newHeaders, key, index) => {
            newHeaders[key] = headers[originalKeys[index]];
            return newHeaders;
        }, {});
        return lowered[key.toLocaleLowerCase()];
    }
    nativeHeadersToObject(headers) {
        const h = {};
        headers.forEach((value, key) => {
            h[key] = value;
        });
        return h;
    }
    makeFetchOptions(options, fetchExtra) {
        const req = Object.assign({ method: options.method || 'GET', headers: options.headers }, (fetchExtra || {}));
        const contentType = this.getRequestHeader(options.headers || {}, 'content-type') || '';
        if (contentType.indexOf('application/json') === 0) {
            req['body'] = JSON.stringify(options.data);
        }
        else if (contentType.indexOf('application/x-www-form-urlencoded') === 0) {
        }
        else if (contentType.indexOf('multipart/form-data') === 0) {
        }
        return req;
    }
    request(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
            const ret = yield fetch(options.url, fetchOptions);
            const contentType = ret.headers.get('content-type');
            let data;
            if (contentType && contentType.indexOf('application/json') === 0) {
                data = yield ret.json();
            }
            else {
                data = yield ret.text();
            }
            return {
                status: ret.status,
                data,
                headers: this.nativeHeadersToObject(ret.headers)
            };
        });
    }
    setCookie(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var expires = "";
            if (options.ageDays) {
                const date = new Date();
                date.setTime(date.getTime() + (options.ageDays * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = options.key + "=" + (options.value || "") + expires + "; path=/";
        });
    }
    getCookies(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!document.cookie) {
                return { value: [] };
            }
            var cookies = document.cookie.split(';');
            return {
                value: cookies.map(c => {
                    const cParts = c.split(';').map(cv => cv.trim());
                    const cNameValue = cParts[0];
                    const cValueParts = cNameValue.split('=');
                    const key = cValueParts[0];
                    const value = cValueParts[1];
                    return {
                        key,
                        value
                    };
                })
            };
        });
    }
    deleteCookie(options) {
        return __awaiter(this, void 0, void 0, function* () {
            document.cookie = options.key + '=; Max-Age=0';
        });
    }
    clearCookies(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            document.cookie
                .split(";")
                .forEach(c => document.cookie = c.replace(/^ +/, '')
                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`));
        });
    }
    uploadFile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
            const formData = new FormData();
            formData.append(options.name, options.blob);
            yield fetch(options.url, Object.assign(Object.assign({}, fetchOptions), { body: formData, method: 'POST' }));
            return {};
        });
    }
    downloadFile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
            const ret = yield fetch(options.url, fetchOptions);
            const blob = yield ret.blob();
            return {
                blob
            };
        });
    }
}
const Http = new HttpPluginWeb();
export { Http };
//# sourceMappingURL=web.js.map