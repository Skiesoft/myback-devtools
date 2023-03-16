import appRootPath from 'app-root-path'
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

const router = express.Router()
const basePath = `${appRootPath as unknown as string}/data/storage/default`

router.get('/*', (req, res) => {
  const filename = (req.params as any)[0]
  const absPath = path.join(basePath, filename)
  if (fs.existsSync(absPath)) {
    res.status(200).download(absPath)
  } else {
    res.status(404).send({ error: 'File no found' })
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, basePath)
  },
  filename: function (req, file, cb) {
    const filename = (req.params as any)[0]
    fs.mkdirSync(path.dirname(path.join(basePath, filename)), {
      recursive: true
    })
    cb(null, filename)
  }
})

const upload = multer({ storage })
router.post('/*', upload.single('file'), (req, res) => {
  res.send({
    data: {
      filename: req.file?.filename,
      url: req.url
    }
  })
})

router.delete('/*', (req, res) => {
  const filename = (req.params as any)[0]
  const absPath = path.join(basePath, filename)
  if (fs.existsSync(absPath)) {
    fs.unlinkSync(absPath)
    res.status(200).send('Deleted')
  } else {
    res.status(404).send({ error: 'File no found' })
  }
})

export default router
