import { Request, Response, NextFunction } from 'express'

import { UserDocument } from './../models/User'
import { findById } from './product'
import Product, { ProductDocument } from './../models/Product'
import Order, { Cart } from '../models/Order'
import OrderService from '../services/order'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'

// GET /orders/all
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sort, rowsPerPage, page } = req.query
    res.json(
      await OrderService.findAll(
        page ? Number(page) : 1,
        rowsPerPage ? Number(rowsPerPage) : 10,
        sort as string | undefined
      )
    )
  } catch (error) {
    next(new NotFoundError('Orders not found', error))
  }
}

// GET /orders/:orderId
export const findOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await OrderService.findById(req.params.orderId))
  } catch (error) {
    next(new NotFoundError('Order not found', error))
  }
}

// POST /orders
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as UserDocument)._id
    const { cart } = req.body
    const newCart = await Promise.all(
      (cart as Cart).map(async ({ product, quantity, variant }) => {
        const item = await Product.findById(product, 'price').exec()
        const price = (item as Record<string, any>).price
        return {
          product,
          quantity,
          variant,
          price,
        }
      })
    )
    const order = new Order({
      user: userId,
      cart,
      totalPrice: newCart.reduce((accumulator, { quantity, price }) => {
        return accumulator + price * quantity
      }, 0),
      created: new Date(),
    })

    await OrderService.createOrder(order)
    res.json(order)
  } catch (error) {
    //   check error
    // next(new NotFoundError('Product not found', error))
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// PUT /orders/:orderId
export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const orderId = req.params.orderId
    const updatedOrder = await OrderService.updateOrder(orderId, update)
    res.json(updatedOrder)
  } catch (error) {
    next(new NotFoundError('Order not found', error))
  }
}
