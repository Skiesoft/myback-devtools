import { AxiosResponse } from 'axios'
import { HTTP_METHOD, SDK } from '../sdk'
import { v4 as uuidv4 } from 'uuid'

export interface FileInformation {
  path: string
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
   */
  constructor () {
    this.id = SDK.config.STORAGE!
  }

  /**
   * Upload file to storage with given path.
   *
   * @param path
   * @param file
   * @returns
   */
  async upload (path: string, file: File): Promise<FileInformation> {
    const formData = new FormData()
    formData.append('file', file, path)

    const res = await this.request(HTTP_METHOD.POST, path, formData)
    return res.data
  }

  /**
   * Upload file to storage with uuid path.
   *
   * @param file the file to upload
   * @param dir the directory to upload the file.
   * @returns
   */
  async uploadWithAutoname (file: File, dir: string = ''): Promise<FileInformation> {
    return await this.upload(`${dir}/${uuidv4()}`, file)
  }

  /**
   * Delete the file from the storage.
   * If you want to delete a directory, set recursive to true.
   *
   * @param path
   */
  async destroy (path: string, recursive: boolean = false): Promise<void> {
    await this.request(HTTP_METHOD.DELETE, recursive ? `${path}?recursive=1` : path)
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
