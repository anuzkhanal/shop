import { Request, Response, NextFunction } from 'express'

import Product from '../models/Product'
import ProductService from '../services/product'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'
import Category from '../models/Category'

// GET /products
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, name, category, sort, rowsPerPage } = req.query
    res.json(
      await ProductService.findAll(
        page ? Number(page) : 1,
        rowsPerPage ? Number(rowsPerPage) : 10,
        name as string | undefined,
        category as string | undefined,
        sort as string | undefined
      )
    )
  } catch (error) {
    next(new NotFoundError('Products not found', error))
  }
}

// GET /products/:productId
export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await ProductService.findById(req.params.productId))
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}

// POST /products
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, variants, categories, images } = req.body

    const product = new Product({
      name,
      description,
      price,
      variants,
      categories,
      images,
    })

    await ProductService.createProduct(product)
    res.json(product)
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

// PUT /products/:productId
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const productId = req.params.productId
    const updatedProduct = await ProductService.updateProduct(productId, update)
    res.json(updatedProduct)
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}

// DELETE /products/:productId
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await ProductService.deleteProduct(req.params.productId)
    res.status(204).end()
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}
// DELETE /categories
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await ProductService.deleteCategory(req.params.categoryId)
    res.status(204).end()
  } catch (error) {
    next(new NotFoundError('Category not found', error))
  }
}

// GET /categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await ProductService.getCategory())
  } catch (error) {
    next(new NotFoundError('Categories not found', error))
  }
}
// POST /categories
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body

    const category = new Category({
      name,
    })

    await ProductService.createCategory(category)
    res.json(category)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const categoryId = req.params.categoryId
    const updatedCategory = await ProductService.updateCategory(
      categoryId,
      update
    )
    res.json(updatedCategory)
  } catch (error) {
    next(new NotFoundError('Category not found', error))
  }
}
