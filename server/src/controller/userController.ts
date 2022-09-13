import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { signUpSchema, options, agenerateToken, loginSchema } from '../utils/utils';
import { userInstance } from '../model/userModel';
import bcrypt from 'bcryptjs';

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  const id = uuidv4();
  try {
    const validationResult = signUpSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        Error: validationResult.error.details[0].message,
      });
    }

    const duplicateEmail = await userInstance.findOne({ where: { email: req.body.email } });
    if (duplicateEmail) {
      return res.status(409).json({
        msg: 'Email is used, please change email',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const record = await userInstance.create({
      id: id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: passwordHash,
      avatar: req.body.avatar,
      isVerified: req.body.isVerified,
    });
    console.log('here');
    res.status(201).json({
      message: 'Successfully created a user',
      record,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: 'failed to register',
      route: '/register',
    });
  }
}

export async function userLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const validate = loginSchema.validate(req.body, options);
    if (validate.error) {
      return res.status(401).json({ Error: validate.error.details[0].message });
    }
    let validUser;
    if (req.body.userName) {
      validUser = (await userInstance.findOne({
        where: { userName: req.body.userName },
      })) as unknown as { [key: string]: string };
    } else if (req.body.email) {
      validUser = (await userInstance.findOne({
        where: { email: req.body.email },
      })) as unknown as { [key: string]: string };
    } else {
      return res.json({ message: 'Username or email is required' });
    }
    if (!validUser) {
      return res.status(401).json({ msg: 'User is not registered' });
    }

    const { id } = validUser;
    const token = agenerateToken({ id });

    const validatedUser = await bcrypt.compare(req.body.password, validUser.password);

    if (!validatedUser) {
      res.status(401).json({ msg: 'failed to login, wrong user name/password inputed' });
    }

    if (validatedUser) {
      res
        .cookie('jwt', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
        .status(200)
        .json({
          msg: 'Successfully logged in',
          token,
          user_info: {
            name: `${validUser.firstName} ${validUser.lastName}`,
            userName: `${validUser.userName}`,
            email: `${validUser.email}`,
          },
        });
    }
  } catch (error) {
    res.status(500).json({ msg: 'failed to login', route: '/login' });
  }
}