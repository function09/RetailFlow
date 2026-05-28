import type { Address, AddressInput, Customer, Order } from "@/types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getCustomers(limit = 500, offset = 0, search = "", sort = "", order = "asc"): Promise<Customer[]> {
  const res = await fetch(`${BASE_URL}/customers?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&order=${order}`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getCustomer(customerID: string): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function createCustomer(data: { firstName: string, lastName: string, email: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function updateCustomer(id: number, data: { firstName: string, lastName: string, email: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function deactivateCustomer(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PATCH",
    credentials: "include",
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function getCustomerOrders(customerID: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/orders`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getCustomerAddresses(customerID: string): Promise<Address[]> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/addresses`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function addCustomerAddress(customerID: string, data: AddressInput): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/addresses`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function deleteAddress(addressID: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/addresses/${addressID}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function setDefaultAddress(customerID: string, addressID: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/addresses/${addressID}/default`, {
    method: "PATCH",
    credentials: "include",
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}
