import { expect, test } from '@jest/globals'
import { SDK, Storage } from '../src'
import { FileInformation } from 'src/api/storage'
import axios from 'axios'

SDK.init({
  API_TOKEN: 'NOT_REQUIRE_FOR_TESTER',
  ENDPOINT: 'http://localhost:3000',
  VERSION: 'v1',
  DATABASE: 'default'
})

let fileInfo: FileInformation = { filename: '', url: '' }

test('Test upload file', async () => {
  const storage = new Storage()
  const f = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
  fileInfo = await storage.uploadWithAutoname(f)
  expect(fileInfo.filename.length).toBe(36)
})

test('Test retrieve file', async () => {
  const res = await axios.get(`http://localhost:3000/v1/storage/default/file/${fileInfo.filename}`)
  expect(res.data).toBe('(⌐□_□)')
})

test('Test delete file', async () => {
  const storage = new Storage()
  await storage.destroy(fileInfo.filename)
})
