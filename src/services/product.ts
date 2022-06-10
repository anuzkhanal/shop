import { NotFoundError } from '../helpers/apiError'
import Category, { CategoryDocument } from '../models/Category'
import Product, { ProductDocument } from '../models/Product'

type Image = {
  dataURL: string;
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

function createProduct(product: ProductDocument): Promise<ProductDocument> {
  return product.save()
}

async function findAll(
  page: number,
  productsPerPage: number,
  name?: string,
  category?: string,
  sort?: string
): Promise<{ products: ProductDocument[]; total: number }> {
  const filter: Record<string, Record<string, string>> = {}
  const populate: Record<string, string> = { path: 'categories' }
  let sortBy: Record<string, number> = { name: 1 }
  switch (sort) {
    case 'name-desc':
      sortBy = { name: -1 }
      break

    case 'price-asc':
      sortBy = { price: 1 }
      break

    case 'price-desc':
      sortBy = { price: -1 }
      break
    default:
      break
  }

  if (name) {
    filter.name = { $regex: name, $options: 'i' }
  }
  if (category) {
    return Category.find({
      name: { $regex: category, $options: 'i' },
    })
      .exec()
      .then(async (result) => {
        if (!result[0]) {
          throw new Error('Category not found')
        }
        filter.categories = result[0]._id
        const productList = Product.find(filter).populate(populate).sort(sortBy)
        productList.skip((page - 1) * productsPerPage).limit(productsPerPage)
        const total = await Product.countDocuments(filter)
        return productList.exec().then((products) => {
          if (!products.length) {
            throw new Error('Products not found')
          }
          return { products, total }
        })
      })
  }
  const productList = Product.find(filter).populate(populate).sort(sortBy)
  productList.skip((page - 1) * productsPerPage).limit(productsPerPage)
  const total = await Product.countDocuments(filter)
  return productList.exec().then((products) => {
    if (!products.length) {
      throw new NotFoundError('Products not found')
    }
    return { products, total }
  })
}

function findById(productId: string): Promise<ProductDocument> {
  return Product.findById(productId)
    .populate('categories')
    .exec()
    .then((product) => {
      if (!product) {
        throw new NotFoundError(`Product ${productId} not found`)
      }
      return product
    })
}

function updateProduct(
  productId: string,
  update: Partial<ProductDocument>
): Promise<ProductDocument | null> {
  return Product.findByIdAndUpdate(productId, update, { new: true })
    .exec()
    .then((product) => {
      if (!product) {
        throw new NotFoundError(`Product ${productId} not found`)
      }
      return product
    })
}

function deleteProduct(productId: string): Promise<ProductDocument | null> {
  return Product.findByIdAndDelete(productId)
    .exec()
    .then((product) => {
      if (!product) {
        throw new NotFoundError(`Product ${productId} not found`)
      }
      return product
    })
}

function getCategory(): Promise<CategoryDocument[]> {
  return Category.find()
    .exec()
    .then((categories) => {
      if (!categories.length) {
        throw new Error('Categories not found')
      }
      return categories
    })
}

function createCategory(category: CategoryDocument): Promise<CategoryDocument> {
  return category.save()
}

function deleteCategory(categoryId: string): Promise<CategoryDocument | null> {
  return Category.findByIdAndDelete(categoryId)
    .exec()
    .then((category) => {
      if (!category) {
        throw new NotFoundError(`Category ${categoryId} not found`)
      }
      return category
    })
}
function updateCategory(
  categoryId: string,
  update: Partial<CategoryDocument>
): Promise<CategoryDocument | null> {
  return Category.findByIdAndUpdate(categoryId, update, { new: true })
    .exec()
    .then((category) => {
      if (!category) {
        throw new NotFoundError(`Category ${categoryId} not found`)
      }
      return category
    })
}

export default {
  createProduct,
  findById,
  findAll,
  updateProduct,
  deleteProduct,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
}
