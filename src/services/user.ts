import { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

import { BadRequestError, NotFoundError } from '../helpers/apiError'
import User, { UserDocument, Ban } from '../models/User'
import { verifyPassword } from '../util/auth'
import { ParsedPayload } from '../config/passport'

async function findAllUsers(
  page: number,
  usersPerPage: number,
  firstName?: string,
  lastName?: string,
  email?: string,
  sort?: string
): Promise<{ users: UserDocument[]; total: number }> {
  const filter: Record<string, any> = {}
  let sortBy: Record<string, number> = { firstName: 1 }
  switch (sort) {
    case 'firstName-desc':
      sortBy = { name: -1 }
      break
    case 'lastName-asc':
      sortBy = { lastName: 1 }
      break

    case 'lastName-desc':
      sortBy = { lastName: -1 }
      break
    case 'email-asc':
      sortBy = { email: 1 }
      break

    case 'email-desc':
      sortBy = { email: -1 }
      break
    default:
      break
  }

  if (firstName) {
    filter.firstName = { $regex: firstName, $options: 'i' }
  }
  if (lastName) {
    filter.lastName = { $regex: lastName, $options: 'i' }
  }
  if (email) {
    filter.email = { $regex: email, $options: 'i' }
  }
  const userList = User.find(filter).sort(sortBy)
  userList.skip((page - 1) * usersPerPage).limit(usersPerPage)
  const total = await User.countDocuments(filter)
  return userList.exec().then((users) => {
    if (!users.length) {
      throw new NotFoundError('Users not found')
    }
    return { users, total }
  })
}

function findByEmail(email: string): Promise<UserDocument> {
  return User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`User ${email} not found`)
      }
      return user
    })
}

function signup(user: UserDocument): Promise<UserDocument> {
  return user.save()
}

async function findUserOrCreate(payload: ParsedPayload) {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const { email, given_name, family_name } = payload
  const user = await User.findOne({ email }).exec()
  if (user) {
    return user
  }
  const newUser = new User({
    // eslint-disable-next-line @typescript-eslint/camelcase
    firstName: given_name,
    // eslint-disable-next-line @typescript-eslint/camelcase
    lastName: family_name,
    email,
  })
  const createdUser = await signup(newUser)
  return createdUser
}

// function signout() {
//   return 'nothing for now'
// }

// function resetPassword(email: string): void {
//   User.findOne({ email })
//     .exec()
//     .then((result) => {
//       if (result) {
//         // send email to reset password
//       }
//     })
// }

async function changePassword(
  email: string,
  newPassword: string,
  oldPassword: string
): Promise<UserDocument | null> {
  const user = await findByEmail(email)
  const validate = await verifyPassword(
    oldPassword,
    (user as UserDocument).password as string
  )
  if (validate) {
    const hash = await bcrypt.hashSync(newPassword, 10)
    return User.findByIdAndUpdate(
      user._id,
      { password: hash },
      { new: true }
    ).exec()
  } else {
    throw new BadRequestError('Invalid Request')
  }
}

function updateUser(
  email: string,
  update: Partial<UserDocument>
): Promise<UserDocument> {
  return User.findOneAndUpdate({ email }, update, { new: true })
    .exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError('User not found')
      }
      return user
    })
}

function ban(
  userId: Schema.Types.ObjectId,
  ban: Ban
): Promise<UserDocument | null> {
  return User.findByIdAndUpdate(userId, { ban }, { new: true })
    .exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`)
      }
      return user
    })
}

function unBan(userId: string): Promise<UserDocument> {
  return User.findByIdAndUpdate(
    userId,
    {
      $unset: { ban: '' },
    },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`)
      }
      return user
    })
}

export default {
  signup,
  //   signout,
  changePassword,
  //   resetPassword,
  updateUser,
  ban,
  unBan,
  findUserOrCreate,
  findByEmail,
  findAllUsers,
}
