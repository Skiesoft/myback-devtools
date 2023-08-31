import { SDK } from '../sdk'
import StorageAPI from '../api/storage'

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
    if (SDK.config.STORAGE === undefined) {
      throw new Error('Undefined storage in SDK configuration.')
    }
    this.id = SDK.config.STORAGE
  }

  /**
   * Upload file to storage with given path.
   *
   * @param path
   * @param file
   * @returns
   */
  async upload (path: string, file: File): Promise<FileInformation> {
    return await StorageAPI.upload(this.id, path, file)
  }

  /**
   * Upload file to storage with uuid path.
   *
   * @param file the file to upload
   * @param dir the directory to upload the file.
   * @returns
   */
  async uploadWithAutoname (file: File, dir: string = ''): Promise<FileInformation> {
    return await StorageAPI.uploadWithAutoname(this.id, file, dir)
  }

  /**
   * Delete the file from the storage.
   * If you want to delete a directory, set recursive to true.
   *
   * @param path
   */
  async destroy (path: string, recursive: boolean = false): Promise<void> {
    await StorageAPI.destroy(this.id, path, recursive)
  }
}
