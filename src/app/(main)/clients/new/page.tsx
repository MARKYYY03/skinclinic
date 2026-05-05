"use client"

import { useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import ClientForm from "@/components/clients/ClientForm"
import { Client } from "@/types/client"

export default function NewClientPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Omit<Client, "id" | "createdAt">) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log("Creating client:", data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For now, just log the data
      alert("Client created successfully! (This is a demo - data not actually saved)")
    } catch (error) {
      console.error("Error creating client:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Add New Client</h2>
          <p className="mt-1 text-gray-600">Create a new client profile</p>
        </div>

        <ClientForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </PageWrapper>
  )
}
