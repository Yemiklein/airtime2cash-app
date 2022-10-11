import 'dotenv/config';
import app from '../app';
import supertest from 'supertest';
import db from '../config/database.config';

const request = supertest(app);
beforeAll(async () => {
  await db
    .sync({ force: true })
    .then(() => {
      console.log('database connected successfully');
    })
    .catch((err) => {
      console.log(err);
    });
});
jest.setTimeout(30000);
describe('user test', () => {
  it('create user successfully', async () => {
    const response = await request.post('/user/register').send({
      firstName: 'POD',
      lastName: 'F',
      userName: 'podf',
      email: 'podf@example.com',
      phoneNumber: '08123456789',
      password: 'abcd',
      confirmPassword: 'abcd',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully created a user');
    expect(response.body).toHaveProperty('record');
  });
  it('successfully verifies a user', async () => {
    const response = await request.post('/user/register').send({
      firstName: 'POD',
      lastName: 'F',
      userName: 'podf-test',
      email: 'podf@test.com',
      phoneNumber: '08123456743',
      password: 'abcd',
      confirmPassword: 'abcd',
    });
    const token = response.body.record.token;
    const verified = await request.get(`/user/verify/${token}`);
    // expect(verified.body.message).toBe('Email verified successfully')
    // expect(verified.body.record.email).toBe(response.body.record.email)
    // expect(verified.body.record.isVerified).toBe(true)
    expect(verified.status).toBe(302);
  });
  it('login user successfully', async () => {
    const response = await request.post('/user/login').send({
      emailOrUsername: 'podf@test.com',
      password: 'abcd',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully logged in');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user_info');
  });
  it('update user profile', async () => {
    const user = await request.post('/user/login').send({
      emailOrUsername: 'podf@test.com',
      password: 'abcd',
    });
    const response = await request
      .patch(`/user/update/${user.body.id}`)
      .set('authorization', `Bearer ${user.body.token}`)
      .send({
        firstName: 'POD',
        lastName: 'F',
        phoneNumber: '0812349876',
        avatar:
          'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg',
      });
    expect(response.status).toBe(202);
    expect(response.body.message).toBe('successfully updated user details');
    expect(response.body).toHaveProperty('updatedRecord');
  });
  it('forgot password', async () => {
    const response = await request.post('/user/forgetPassword').send({
      email: 'podf@test.com',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Reset password token sent to your email');
  });
});

describe('account test', () => {
  it('create account successfully', async () => {
    const user = await request.post('/user/login').send({
      emailOrUsername: 'podf@test.com',
      password: 'abcd',
    });

    const response = await request
      .post('/account/createaccount')
      .set('authorization', `Bearer ${user.body.token}`)
      .send({
        bankName: 'Access',
        accountNumber: '0036123445',
        accountName: 'podf',
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Account created successfully');
    expect(response.body).toHaveProperty('data');
  });
  it(' Successfully retrieve bank accounts ', async () => {
    const user = await request.post('/user/login').send({
      emailOrUsername: 'podf@test.com',
      password: 'abcd',
    });

    const response = await request.get(`/user/userAccount/${user.body.id}`).set('authorization', `Bearer ${user.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Account retrieved successfully');
    expect(response.body).toHaveProperty('data');
  });
    it('Successfully deletes bank account', async () => {
      const user = await request.post('/user/login').send({
      emailOrUsername: 'podf@test.com',
      password: 'abcd',
    });

      const bank = await request
      .post('/account/createaccount')
      .set('authorization', `Bearer ${user.body.token}`)
      .send({
        bankName: 'Access',
        accountNumber: '0036123444',
        accountName: 'podf',
      });

      const id = bank.body.data.id

      const response = await request.delete(`/account/deleteaccount/${id}`).set('authorization', `Bearer ${user.body.token}`);
      expect(response.status).toBe(200);
       expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Account deleted successfully');

    });
});
