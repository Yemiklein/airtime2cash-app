import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  signUpSchema,
  updateUserSchema,
  options,
  generateToken,
  loginSchema,
  resetPasswordSchema,
} from '../utils/utils';
import { userInstance } from '../model/userModel';
import bcrypt from 'bcryptjs';
import { emailTemplate } from './emailController';
import cloudinary from 'cloudinary';

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = uuidv4();
    const validationResult = signUpSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        Error: validationResult.error.details[0].message,
      });
    }
    const duplicateEmail = await userInstance.findOne({ where: { email: req.body.email } });
    if (duplicateEmail) {
      return res.status(409).json({
        message: 'Email is used, please change email',
      });
    }

    const duplicateUsername = await userInstance.findOne({ where: { userName: req.body.userName } });
    if (duplicateUsername) {
      return res.status(409).json({
        message: 'Username is used, please change username',
      });
    }

    const duplicatePhone = await userInstance.findOne({ where: { phoneNumber: req.body.phoneNumber } });
    if (duplicatePhone) {
      return res.status(409).json({
        message: 'Phone number is used, please change phone number',
      });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const token = uuidv4();
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
      token,
    });

    const link = `${process.env.FRONTEND_URL}/user/verify/${token}`;
    const emailData = {
      to: req.body.email,
      subject: 'Verify Email',
      html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Welcome To Airtime to Cash</h2>
            <p>Please Follow the link by clicking on the button to verify your email
             </p>
             <div style='text-align:center ;'>
               <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
             </div>
          </div>`,
    };
    emailTemplate(emailData);

    return res.status(201).json({
      message: 'Successfully created a user',
      record: {
        id: record.id,
        userName: record.userName,
        phoneNumber: record.phoneNumber,
        email: record.email,
        avatar: record.avatar,
        isVerified: record.isVerified,
        token: record.token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'failed to register',
      route: '/register',
    });
  }
}

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const user = await userInstance.findOne({ where: { token } });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    const verifiedUser = await userInstance.update({ isVerified: true, token: 'null' }, { where: { token } });

    const updatedDetails = await userInstance.findOne({ where: { id: user.id } });

    return res.status(200).json({
      message: 'Email verified successfully',
      record: {
        email: user.email,
        isVerified: updatedDetails?.isVerified,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: 'failed to verify user',
      route: '/verify/:id',
    });
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    cloudinary.v2.config({
      cloudName: process.env.CLOUDINARY_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    });


    const { id } = req.params;
    const record = await userInstance.findOne({ where: { id } });

    const { firstName, lastName, phoneNumber } = req.body;
    const validationResult = updateUserSchema.validate(req.body, options);

    if (validationResult.error) {
      return res.status(400).json({
        Error: validationResult.error.details[0].message,
      });
    }

    if (!record) {
      return res.status(404).json({
        message: 'cannot find user',
      });
    }
    let result: Record<string, string> = {};
    if(req.body.avatar){
      result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        //formats allowed for download
        allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
        //generates a new id for each uploaded image
        public_id: '',
        //fold where the images are stored
        folder: 'live-project-podf',
      });
      if (!result) {
        throw new Error('Image is not a valid format. Only jpg, png, svg and jpeg allowed');
      }
    }

    const updatedRecord = await record?.update({
      firstName,
      lastName,
      phoneNumber,
      avatar: result?.url,
    });

    return res.status(202).json({
      message: 'successfully updated user details',
      updatedRecord,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: 'failed to update user details, check image format', err });
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
      return res.status(401).json({ message: 'User is not registered' });
    }
    const { id } = validUser;
    const token = generateToken({ id });
    const validatedUser = await bcrypt.compare(req.body.password, validUser.password);
    if (!validatedUser) {
      return res.status(401).json({ message: 'failed to login, wrong user name/password inputed' });
    }

    if (validUser.isVerified && validatedUser) {
      return res
        .cookie('jwt', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
        .status(200)
        .json({
          message: 'Successfully logged in',
          id,
          token,
          user_info: {
            name: `${validUser.firstName} ${validUser.lastName}`,
            userName: `${validUser.userName}`,
            email: `${validUser.email}`,
          },
        });
    }
    return res.status(401).json({ message: 'Please verify your email' });
  } catch (error) {
    return res.status(500).json({ message: 'failed to login', route: '/login' });
  }
}

export async function forgetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await userInstance.findOne({ where: { email } });
    if (!user) {
      return res.status(409).json({
        message: 'User not found',
      });
    }
    const token = uuidv4();
    const resetPasswordToken = await userInstance.update({ token }, { where: { email } });
    const link = `${process.env.FRONTEND_URL}/reset/${token}`;
    const emailData = {
      to: email,
      subject: 'Password Reset',
      html: ` <div style="max-width: 700px;text-align: center; text-transform: uppercase;
            margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="color: teal;">Welcome To Airtime to Cash</h2>
            <p>Please Follow the link by clicking on the button to change your password
             </p>
             <div style='text-align:center ;'>
               <a href=${link}
              style="background: #277BC0; text-decoration: none; color: white;
               padding: 10px 20px; margin: 10px 0;
              display: inline-block;">Click here</a>
             </div>
          </div>`,
    };
    emailTemplate(emailData)
      .then(() => {
        return res.status(200).json({
          message: 'Reset password token sent to your email',
          token,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Server error',
          err,
        });
      });
  } catch (err) {
    res.status(500).json({
      message: 'failed to send reset password token',
      route: '/forgetPassword',
    });
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    const validate = resetPasswordSchema.validate(req.body, options);

    if (validate.error) {
      return res.status(400).json({ Error: validate.error.details[0].message });
    }
    const user = await userInstance.findOne({ where: { token } });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const resetPassword = await userInstance.update({ password: passwordHash }, { where: { token } });
    return res.status(200).json({
      message: 'Password reset successfully',
      resetPassword,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'failed to reset password',
      route: '/resetPassword',
    });
  }
}
