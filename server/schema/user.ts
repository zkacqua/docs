import { Schema, model } from 'mongoose'
import {} from 'validator'

interface IUser {
  name: string
  username: string
  password: string
  email: string
  avatarUrl?: string
  age?: number
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: String,
  age: Number,
})

const User = model<IUser>('User', userSchema)

export default User
