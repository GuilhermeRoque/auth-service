require('dotenv').config();
require('../src/auth/createKeys')

const request = require('supertest');
const app = require('../src/app')
const mongoose = require('mongoose');

const userTest = {
    name:"Roque",
    password:"1234567",
    email:"roque@gmail.com"
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

describe('User API resources Test', () => {
    it('Create user', (done) => {
        request(app)
        .post('/users/')
        .send(userTest)
        .expect(201, (err, ret) => {
            userCreated = ret.body
            done(err)
        })
    });
    
    it('Get all users', (done) => {
        request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    
    it('Get single user', (done) => {
        request(app)
        .get('/users/' + userCreated._id)
        .auth('username', 'password')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('Login user', (done) => {
        request(app)
        .post('/users/login/')
        .send({
            email: userTest.email,
            password: userTest.password
        })
        .expect('authorization', /./)
        .expect(204, done)
    });
    it('Delete user', (done) => {
        request(app)
        .delete('/users/'+ userCreated._id)
        .expect(204, done)
    });
});


after(() => {
    return mongoose.connection.close()
})