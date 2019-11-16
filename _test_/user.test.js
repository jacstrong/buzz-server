// const axios = require('axios');

const request = require('supertest');
const app = require('../app');

describe('Test root api', () => {
  test('It should have a response to the GET method.', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});

describe('Test creating a user', () => {
  test('It should create a user, check current user, and login as that user.', (done) => {
    request(app) // Create Account
      .post('/api/user')
      .send({ email: 'testemail@email.com', password: 'testPassword1' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body.user.email).toBe('testemail@email.com');
        const token = res.body.user.token
        const id = res.body.user._id
        request(app) // Test login
          .post('/api/user/login')
          .send({ email: 'testemail@email.com', password: 'testPassword1' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(res => {
            expect(res.body.user.email).toBe('testemail@email.com');
            expect(id).toBe(res.body.user._id);
          });
        
        request(app) // Test login
          .get('/api/user/current')
          .set('Authorization', 'Token ' + token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then(res => {
            expect(res.body.user._id).toBe('poop');
          });
        
        done();
      });
  });
});

describe('Test creating a duplicate user', () => {
  test('It should create a user, then try to create another user with the same email.', (done) => {
    request(app)
      .post('/api/user')
      .send({ email: 'testemail@email.com', password: 'testPassword1' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body.user.email).toBe('testemail@email.com');
      });
    request(app)
      .post('/api/user')
      .send({ email: 'testemail@email.com', password: 'testPassword1' })
      .expect('Content-Type', /json/)
      .expect(422)
      .then(res => {
        expect(res.body.error).toBe();
      });
    done();
  });
});
