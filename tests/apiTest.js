require('dotenv').config();

const request = require('supertest');
const app = require('../app')
const mongoose = require('mongoose');

const userTest = {
    user:"Roque",
    password:"123456",
}

let userCreated;

console.log("Testing API with user ", userTest)


before(()=>{
    return mongoose.connect(process.env.DB_URL, {
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        autoCreate: true,
        autoIndex: true
    }) 
})   

describe('POST /users/', () => {
    it('Create user', (done) => {
        request(app)
        .post('/users/')
        .send(userTest)
        .expect(201, (err, ret) => {
            userCreated = ret.body
            done(err)
        })
    });
  });

describe('GET /users', () => {
    it('Get all users', (done) => {
        request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
});

describe('GET /users/<id>', () => {
    it('Get single user', (done) => {
        request(app)
        .get('/users/' + userCreated._id)
        .auth('username', 'password')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
});

describe('POST /users/<id>/login', () => {
    it('Login user', (done) => {
        request(app)
        .post('/users/'+ userCreated._id+'/login')
        .send(userTest)
        .expect('authorization', /./)
        .expect(204, done)
    });
});

describe('DELETE /users/<id>', () => {
    it('Delete user', (done) => {
        request(app)
        .delete('/users/'+ userCreated._id)
        .expect(204, done)
    });
});


after(() => {
    return mongoose.connection.close()
})