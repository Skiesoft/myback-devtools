import { HTTP_METHOD, SDK } from '../sdk'
import { v4 as uuidv4 } from 'uuid'

export interface FileInformation {
  path: string
  url: string
}

/**
 * Storage serve static files.
 */
export default {
  /**
   * Upload file to storage with given path.
   *
   * @param id the id of stroage.
   * @param path the path to the file.
   * @param content the content of the file.
   * @returns
   */
  async upload (id: string, path: string, file: File): Promise<FileInformation> {
    const formData = new FormData()
    formData.append('file', file, path)

    const res = await SDK.request(HTTP_METHOD.POST, `storage/${id}/file/${path}`, formData)
    return res.data
  },

  /**
   * Upload file to storage with uuid path.
   *
   * @param id the id of stroage.
   * @param content the file to upload
   * @param dir the directory to upload the file.
   * @returns
   */
  async uploadWithAutoname (id: string, content: File, dir: string = ''): Promise<FileInformation> {
    return await this.upload(id, `${dir}/${uuidv4()}`, content)
  },

  /**
   * Delete the file from the storage.
   * If you want to delete a directory, set recursive to true.
   *
   * @param id the id of the storage.
   * @param path the path to delete.
   * @param [recursive=false] whether to delete recursively.
   */
  async destroy (id: string, path: string, recursive: boolean = false): Promise<void> {
    await SDK.request(HTTP_METHOD.DELETE, `storage/${id}/file/${recursive ? `${path}?recursive=1` : path}`)
  }
}
