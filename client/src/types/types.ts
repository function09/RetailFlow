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
