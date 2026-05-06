"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { createClientAction } from "@/lib/actions/clients"
import ClientForm from "@/components/clients/ClientForm"

export default function NewClientFormClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <ClientForm
      submitLabel="Save client"
      cancelHref="/clients"
      isLoading={loading}
      onSubmit={async (data) => {
        setLoading(true)
        try {
          const r = await createClientAction(data)
          if (!r.ok) throw new Error(r.error)
          router.push(`/clients/${r.clientId}`)
        } finally {
          setLoading(false)
        }
      }}
    />
  )
}
