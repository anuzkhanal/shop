/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Date, Document, Schema } from 'mongoose'

export type Cart = {
  product: string
  quantity: number
  variant: string
}[]

export type OrderDocument = Document & {
  user: Schema.Types.ObjectId
  cart: Cart
  created: Date
  totalPrice: number
  status: 'in process' | 'delivering' | 'complete'
}

const orderSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  cart: [
    {
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
      },
      variant: {
        type: String,
        required: true,
      },
    },
  ],
  created: {
    type: Date,
    required: true,
    index: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['in process', 'delivering', 'complete'],
    default: 'in process',
  },
})

export default mongoose.model<OrderDocument>('Order', orderSchema)
