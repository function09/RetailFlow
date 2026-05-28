export interface User {
  sub: string
}

export interface Counts {
  orders: number
  customers: number
  products: number
}

export interface Products {
  ID: number
  SKU: string
  Name: string
  Price: number
  Quantity: number
  Category: string
  CategoryID: number
}

export interface Categories {
  ID: number,
  Category: string
}

export interface ProductFormProps {
  categories: Categories[]
  product: Products | null
  onSuccess: () => void
}

export interface Customer {
  ID: number,
  FirstName: string
  LastName: string
  Email: string
  IsActive: boolean
}

export interface CustomersFormProps {
  customer: Customer | null
  onSuccess: () => void
}


export interface Order {
  ID: number
  CustomerID: number
  FirstName: string
  LastName: string
  Status: string
  Fulfillment: string
  StreetLine1: string
  StreetLine2: string
  City: string
  State: string
  ZipCode: string
  CreatedAt: string
  UpdatedAt: string
}

export interface OrderItem {
  ID: number
  OrderID: number
  ProductID: number
  Name: string
  Price: number
  Quantity: number
}

export interface OrderDetails {
  Order: Order
  OrderItems: OrderItem[]
}

export interface OrderAddressInput {
  street_line_1: string
  street_line_2: string
  city: string
  state: string
  zip_code: string
}

export interface CreateOrderPayload {
  customer_id: number
  fulfillment: string
  order_items: { product_id: number, quantity: number }[]
  address: OrderAddressInput | null
}

export interface Address {
  ID: number
  StreetLine1: string
  StreetLine2: string
  City: string
  State: string
  ZipCode: string
  AddressType: string
  IsDefault: boolean
  CustomerID: number
}

export interface AddressInput {
  StreetLine1: string
  StreetLine2: string
  City: string
  State: string
  ZipCode: string
  AddressType: string
  IsDefault: boolean
}



