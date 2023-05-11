import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import FormData from 'form-data'

export enum HTTP_METHOD {
  GET,
  POST,
  PUT,
  DELETE,
}

interface SDKConfig {
  API_TOKEN: string
  DATABASE?: string
  STORAGE?: string
}

declare global {
  interface Window {
    API_TOKEN?: string
    DATABASE?: string
    STORAGE?: string
  }
}

export class SDK {
  private static readonly ENDPOINT: string = 'https://api.myback.app'
  private static readonly VERSION: string = 'v1'
  public static config: SDKConfig

  /**
   * Initialize the SDK.
   *
   * @param config configuration for SDK.
   */
  public static init (config: SDKConfig): void {
    this.config = {
      API_TOKEN: config.API_TOKEN,
      DATABASE: config.DATABASE,
      STORAGE: config.STORAGE
    }

    if( typeof window !== 'undefined' ) {
      this.config = {
        API_TOKEN: window.API_TOKEN ?? config.API_TOKEN,
        DATABASE: window.DATABASE ?? config.DATABASE,
        STORAGE: window.STORAGE ?? config.STORAGE
      }
    }
  }

  /**
   * API request helper function.
   *
   * @param method must be an integer, please use 'HTTP_XXX' static variable in this class.
   * @param path API Path.
   * @param requestBody Request body payload.
   */
  public static async request (method: HTTP_METHOD, path: string, requestBody: FormData | object = {}): Promise<AxiosResponse> {
    if (this.config == null) {
      throw new Error('SDK not initailized yet')
    }
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${this.config.API_TOKEN}`
    }
    if (requestBody instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data'
    }
    const { ENDPOINT, VERSION } = this
    switch (method) {
      case HTTP_METHOD.GET:
        return await axios.get(`${ENDPOINT}/${VERSION}/${path}`, { headers })
      case HTTP_METHOD.POST:
        return await axios.post(`${ENDPOINT}/${VERSION}/${path}`, requestBody, { headers })
      case HTTP_METHOD.PUT:
        return await axios.put(`${ENDPOINT}/${VERSION}/${path}`, requestBody, { headers })
      case HTTP_METHOD.DELETE:
        return await axios.delete(`${ENDPOINT}/${VERSION}/${path}`, { headers })
    }
  }
}
