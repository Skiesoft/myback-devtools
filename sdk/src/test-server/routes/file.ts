import appRootPath from 'app-root-path'
import express from 'express'
import multer from 'multer'
import fs from 'fs'

const router = express.Router()
const basePath = `${appRootPath as unknown as string}/data/storage/default`

router.get('/:filename', (req, res) => {
  const { filename } = req.params
  const absPath = `${basePath}/${filename}`
  if (fs.existsSync(absPath)) {
    res.status(200).download(`${basePath}/${filename}`)
  } else {
    res.status(404).send({ error: 'File no found' })
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, basePath)
  },
  filename: function (req, file, cb) {
    cb(null, req.params.filename)
  }
})

const upload = multer({ storage })
router.post('/:filename', upload.single('file'), (req, res) => {
  res.send({
    data: {
      filename: req.file?.filename,
      url: req.url
    }
  })
})

router.delete('/:filename', (req, res) => {
  const { filename } = req.params
  const absPath = `${basePath}/${filename}`
  if (fs.existsSync(absPath)) {
    fs.unlinkSync(absPath)
    res.status(200).send('Deleted')
  } else {
    res.status(404).send({ error: 'File no found' })
  }
})

export default router
