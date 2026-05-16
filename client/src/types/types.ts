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

export interface Customers {
  ID: number,
  FirstName: string
  LastName: string
  Email: string
  IsActive: boolean
}

export interface ProductFormProps {
  categories: Categories[]
  product: Products | null
  onSuccess: () => void
}
