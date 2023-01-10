import axios, { AxiosResponse } from 'axios'

export enum HTTP_METHOD {
  GET,
  POST,
  PUT,
  DELETE,
}

interface SDKConfig {
  API_KEY: string
  ENDPOINT: string
  VERSION: string
  DATABASE: string
}

export class SDK {
  public static config: SDKConfig | null = null

  /**
   * Initialize the SDK.
   *
   * @param config configuration for SDK.
   */
  public static init (config: SDKConfig): void {
    this.config = config
  }

  /**
   * API request helper function.
   *
   * @param method must be an integer, please use 'HTTP_XXX' static variable in this class.
   * @param path API Path.
   * @param requestBody Request body payload.
   */
  public static async request (method: HTTP_METHOD, path: string, requestBody: object = {}): Promise<AxiosResponse> {
    if (this.config == null) {
      throw new Error('SDK not initailized yet')
    }
    const { ENDPOINT, VERSION } = this.config
    switch (method) {
      case HTTP_METHOD.GET:
        return await axios.get(`${ENDPOINT}/${VERSION}/${path}`)
      case HTTP_METHOD.POST:
        return await axios.post(`${ENDPOINT}/${VERSION}/${path}`, requestBody)
      case HTTP_METHOD.PUT:
        return await axios.put(`${ENDPOINT}/${VERSION}/${path}`, requestBody)
      case HTTP_METHOD.DELETE:
        return await axios.delete(`${ENDPOINT}/${VERSION}/${path}`)
    }
  }
}
