/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from 'mongoose'

export type CategoryDocument = Document & {
  name: string
}

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
})

export default mongoose.model<CategoryDocument>('Category', categorySchema)
