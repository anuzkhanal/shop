/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document, Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

export type ProductDocument = Document & {
  name: string
  description: string
  price: number
  variants: string[]
  categories: string[]
  images: [
    {
      dataURL: string
      file: {
        name: string
        size: number
        type: string
        lastModified: number
      }
    }
  ]
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  variants: [
    {
      type: String,
      required: false,
    },
  ],
  categories: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'Category',
    },
  ],
  images: [
    {
      dataURL: {
        type: String,
      },
      file: {
        name: {
          type: String,
        },
        type: { type: String },
        size: { type: Number },
        lastModified: { type: Number },
      },
      required: false,
    },
  ],
})

export default mongoose.model<ProductDocument>(
  'Product',
  productSchema.plugin(uniqueValidator)
)
