"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { updateClientAction } from "@/lib/actions/clients"
import ClientForm from "@/components/clients/ClientForm"
import type { Client } from "@/types/client"

interface EditClientFormClientProps {
  clientId: string
  initialClient: Client
}

export default function EditClientFormClient({
  clientId,
  initialClient,
}: EditClientFormClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <ClientForm
      initialData={{
        ...initialClient,
        email: initialClient.email === "—" ? "" : initialClient.email,
      }}
      cancelHref={`/clients/${clientId}`}
      submitLabel="Update client"
      isLoading={loading}
      onSubmit={async (data) => {
        setLoading(true)
        try {
          const r = await updateClientAction(clientId, data)
          if (!r.ok) throw new Error(r.error)
          router.push(`/clients/${clientId}`)
        } finally {
          setLoading(false)
        }
      }}
    />
  )
}
