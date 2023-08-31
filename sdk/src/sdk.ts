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
   * By default it would initialize with configuration in the environment.
   * If the config parameter is given, it would overwrite the environment configuration.
   *
   * @param config configuration for SDK.
   */
  public static init (config?: SDKConfig): void {
    const c = {
      API_TOKEN: window.API_TOKEN,
      DATABASE: window.DATABASE,
      STORAGE: window.STORAGE
    }
    if (config !== null) Object.assign(c, config)
    if (c.API_TOKEN === undefined) {
      throw new Error('API Token not found.')
    }
    this.config = c as SDKConfig
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
    try {
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
    } catch (err: any) {
      if (err.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx

        // Print message if server have send message.
        if (err.response.data.message !== undefined) {
          throw new Error(err.response.data.message)
        } else {
          throw new Error(JSON.stringify(err.response.data))
        }
      } else {
        throw err
      }
    }
  }
}
