import request from 'supertest'
import App from '../src/app'

const { app, server } = App.start()

describe('GET /v1/database/default/model', (): void => {
  it('responds with json', (done) => {
    request(app)
      .get('/v1/database/default/model')
      .expect(200)
      .then(response => {
        expect(response.body.data.length).toBe(3)
        expect(response.body.data[0].id).toBe('one')
        done()
      })
  })
})

describe('GET /v1/database/default/model/one', (): void => {
  it('responds with json', (done) => {
    request(app)
      .get('/v1/database/default/model/one')
      .expect(200)
      .then(response => {
        expect(response.body.data.length).toBe(26)
        done()
      })
  })
})

describe('POST /v1/database/default/model/one', (): void => {
  it('responds with json', (done) => {
    request(app)
      .post('/v1/database/default/model/one')
      .send({ data: { field1: 1, field2: 'somestr' } })
      .expect(200)
      .then(response => {
        expect(response.body.data.field1).toBe(1)
        expect(response.body.data.field2).toBe('somestr')
        done()
      })
  })
})

describe('PUT /v1/database/default/model/one', (): void => {
  it('responds with json', (done) => {
    request(app)
      .put('/v1/database/default/model/one')
      .query({ matcher: { field1: 1, field2: 'somestr' } })
      .send({ data: { field1: 100, field2: 'b' } })
      .expect(200)
      .then(response => {
        expect(response.body.data.field1).toBe(100)
        expect(response.body.data.field2).toBe('b')
        done()
      })
  })
})

describe('DELETE /v1/database/default/model/one', (): void => {
  it('responds with json', (done) => {
    request(app)
      .delete('/v1/database/default/model/one')
      .query({ matcher: { field1: 100, field2: 'b' } })
      .expect(200, done)
  })
})

describe('GET /v1/database/default/model/three/relation', (): void => {
  it('responds with json', (done) => {
    request(app)
      .get('/v1/database/default/model/three/relation')
      .query({ matcher: { ref1: 2, ref2: 1 } })
      .expect(200)
      .then(response => {
        expect(response.body.out.one.data[0].id).toBe(2)
        expect(response.body.out.two.data[0].id).toBe(1)
        done()
      })
  })
})

afterAll(() => {
  server.close()
})
