import url from 'url';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import axiosRequest, { AxiosRequestConfig, AxiosResponse } from 'axios';

import tunnel = require('tunnel');

const httpsProxyAgents = getProxyAgents();

const no_proxy: string[] = (process.env.no_proxy || '').split(/[\s,;:]+/).filter((host) => (host !== ''));


/**
 * Function is mostly similar with `Axios()` from `axios` library.
 *
 * Added features:
 *  - Using tunnelled proxy (command CONNECT) based on configuration
 *    in system envs `http_proxy`, `https_proxy`, `no_proxy`.
 */
async function axiosBehindProxy<T>(opts: AxiosProxyOptions): Promise<AxiosResponse<T>> {
    const newOpts: AxiosRequestConfig = {
        ...opts,
        proxy: false,
    };

    const parsedUrl = url.parse(newOpts.baseURL || newOpts.url!);
    if (useProxy(parsedUrl)) {
        newOpts.httpAgent = httpsProxyAgents.httpAgent;
        newOpts.httpsAgent = httpsProxyAgents.httpsAgent;
    }

    return axiosRequest(newOpts);
}


function useProxy(parsedUrl: url.UrlWithStringQuery): boolean {
    if (!process.env.https_proxy) {
        return false;
    }

    const isInNoProxy = no_proxy.some((noProxyHost) => (
        parsedUrl.hostname?.toLowerCase().endsWith(noProxyHost.toLowerCase())
    ));

    return !isInNoProxy;
}


function getProxyAgents() {
    return {
        httpsAgent: getProxyAgent(process.env.http_proxy || process.env.HTTP_PROXY, 'https'),
        httpAgent: getProxyAgent(process.env.httpS_proxy || process.env.HTTPS_PROXY, 'http'),
    };
}


function getProxyAgent(proxyURL: string|undefined, requestProtocol: 'http'|'https'): HttpAgent | HttpsAgent | undefined {
    if (!proxyURL) {
        return undefined;
    }

    const parsedProxyUrl = url.parse(proxyURL);
    const defaultProxyPort = (parsedProxyUrl.protocol === 'https') ? 443 : 80;
    const opts: tunnel.HttpOptions = {
        proxy: {
            host: parsedProxyUrl.hostname!,
            port: parsedProxyUrl.port
                ? Number.parseInt(parsedProxyUrl.port, 10)
                // Or default based on protocol
                : defaultProxyPort,
        }
    };
    if (requestProtocol === 'http') {
        switch (parsedProxyUrl.protocol) {
            case 'https': return tunnel.httpOverHttps(opts);
            default: return tunnel.httpOverHttp(opts);
        }
    } else { // HTTPS is default request protocol
        switch (parsedProxyUrl.protocol) {
            case 'https': return tunnel.httpsOverHttps(opts);
            default: return tunnel.httpsOverHttp(opts);
        }
    }
}


export interface AxiosProxyOptions extends Omit<
Omit<
Omit<
AxiosRequestConfig,
'httpAgent'
>, 'httpsAgent'
>, 'proxy'
> {}


export default axiosProxy;
