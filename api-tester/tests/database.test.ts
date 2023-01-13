import request from 'supertest'
import { app, server } from '../app'

describe('GET /v1/database', (): void => {
  it('responds with json', (done) => {
    request(app)
      .get('/v1/database')
      .expect(200)
      .then(response => {
        expect(JSON.stringify(response.body.data))
          .toBe(JSON.stringify([{ id: 'default' }]))
        done()
      })
  })
})

afterAll(() => {
  server.close()
})
