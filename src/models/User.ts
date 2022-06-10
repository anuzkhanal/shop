/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import isEmail from 'validator/lib/isEmail'
import ROLES from '../util/role'

export type UserDocument = Document & {
  password?: string
  firstName: string
  lastName: string
  email: string
  address?: string
  role: typeof ROLES[keyof typeof ROLES]
  ban: Ban
}

export type Ban = {
  created?: Date
  expired?: Date
  reason?: string
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: { unique: true },
    validate: {
      validator: (value: string) => isEmail(value),
      message: 'This is not an email',
    },
  },
  password: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
    index: true,
  },
  lastName: {
    type: String,
    required: true,
    index: true,
  },
  address: {
    type: String,
    index: true,
  },

  role: {
    type: String,
    required: true,
    enum: ROLES,
    default: ROLES.User,
  },
  ban: {
    created: {
      type: Date,
      index: true,
    },
    expired: {
      type: Date,
      index: true,
    },
    reason: {
      type: String,
    },
  },
})

export default mongoose.model<UserDocument>(
  'User',
  userSchema.plugin(uniqueValidator)
)
