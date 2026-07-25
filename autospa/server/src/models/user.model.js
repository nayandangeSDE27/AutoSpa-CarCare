import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema, model } = mongoose

export const USER_ROLES = ['customer', 'garage_owner', 'admin']
export const USER_STATUS = ['active', 'blocked']

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // Never returned by default — must be explicitly .select('+password').
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: USER_STATUS,
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Defensive: never serialize the hash even if it was selected.
        delete ret.password
        delete ret.__v
        return ret
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

// Hash the password before saving whenever it changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

// Compare a plaintext candidate against the stored hash.
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

const User = model('User', userSchema)

export default User
