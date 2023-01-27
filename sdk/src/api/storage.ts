import { AxiosResponse } from 'axios'
import { HTTP_METHOD, SDK } from '../sdk'
import { v4 as uuidv4 } from 'uuid'

export interface FileInformation {
  filename: string
  url: string
}

/**
 * Storage serves tatic files.
 */
export class Storage {
  private readonly id: string

  /**
   * Constructor of the controller of resource.
   *
   * @param id the identifier of the storage.
   */
  constructor (id: string = 'default') {
    this.id = id
  }

  /**
   * Upload file to storage with given filename.
   *
   * @param filename
   * @param file
   * @returns
   */
  async upload (filename: string, file: File): Promise<FileInformation> {
    const formData = new FormData()
    formData.append('file', file, filename)

    const res = await this.request(HTTP_METHOD.POST, filename, formData)
    return res.data.data
  }

  /**
   * Upload file to storage with uuid filename.
   *
   * @param file
   * @returns
   */
  async uploadWithAutoname (file: File): Promise<FileInformation> {
    return await this.upload(uuidv4(), file)
  }

  /**
   * Delete the file from the storage.
   *
   * @param filename
   */
  async destroy (filename: string): Promise<void> {
    await this.request(HTTP_METHOD.DELETE, filename)
  }

  /**
   * API request helper function.
   *
   * @param method the HTTP method for the requst.
   * @param path the API path in the entity level.
   * @param requestBody optional payload.
   * @returns
   */
  private async request (method: HTTP_METHOD, path: string, requestBody: FormData | object = {}): Promise<AxiosResponse> {
    return await SDK.request(method, `storage/${this.id}/file/${path}`, requestBody)
  }
}
