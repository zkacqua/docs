import { Schema, model } from 'mongoose'
import {} from 'validator'

interface IUser {
  uid?: string
  name: string
  username: string
  password: string
  email: string
  avatarUrl?: string
  age?: number
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: false, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  age: Number,
})

const User = model<IUser>('User', userSchema)

export default User
