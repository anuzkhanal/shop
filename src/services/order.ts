import { NotFoundError } from '../helpers/apiError'
import Order, { OrderDocument } from '../models/Order'

function createOrder(order: OrderDocument): Promise<OrderDocument> {
  return order.save()
}

async function findAll(
  page: number,
  ordersPerPage: number,
  sort?: string
): Promise<{ orders: OrderDocument[]; total: number }> {
  const filter: Record<string, Record<string, string>> = {}
  let sortBy: Record<string, number> = { created: 1 }
  switch (sort) {
    case 'created-desc':
      sortBy = { created: -1 }
      break
    default:
      break
  }

  const orderList = Order.find(filter)
    .populate({ path: 'user', select: 'firstName lastName email address' })
    .populate({
      path: 'cart',
      populate: 'product',
    })
    .sort(sortBy)
  orderList.skip((page - 1) * ordersPerPage).limit(ordersPerPage)
  const total = await Order.countDocuments(filter)
  return orderList.exec().then((orders) => {
    if (!orders.length) {
      throw new NotFoundError('Orders not found')
    }
    return { orders, total }
  })
}

function findById(orderId: string): Promise<OrderDocument> {
  return Order.findById(orderId)
    .populate('user', 'firstName lastName email address')
    .populate({
      path: 'cart',
      populate: 'product',
      select: 'name',
    })
    .exec()
    .then((order) => {
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`)
      }
      return order
    })
}

function updateOrder(
  orderId: string,
  update: Partial<OrderDocument>
): Promise<OrderDocument | null> {
  return Order.findByIdAndUpdate(orderId, update, { new: true })
    .exec()
    .then((order) => {
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`)
      }
      return order
    })
}

export default {
  createOrder,
  findById,
  findAll,
  updateOrder,
}
