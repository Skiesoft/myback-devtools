import { expect, test } from '@jest/globals'
import { SDK, Storage } from '../src'
import { FileInformation } from 'src/api/storage'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

SDK.init({
  API_TOKEN: process.env.API_TOKEN!,
  DATABASE: process.env.DATABASE_ID,
  STORAGE: process.env.STORAGE_ID
})

let fileInfo: FileInformation = { path: '', url: '' }

test('Test upload file', async () => {
  const storage = new Storage()
  const f = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
  fileInfo = await storage.uploadWithAutoname(f, 'images')
  expect(fileInfo.path.length).toBe(43) // images/{uuidv4s}
})

test('Test retrieve file', async () => {
  const res = await axios.get(fileInfo.url)
  expect(res.data).toBe('(⌐□_□)')
})

test('Test delete file', async () => {
  const storage = new Storage()
  await storage.destroy(fileInfo.path)
})
