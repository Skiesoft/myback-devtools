import request from 'supertest'
import App from '../app'

const { app, server } = App.start()

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
