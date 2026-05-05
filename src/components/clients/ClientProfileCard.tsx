import { Client } from "@/types/client"
import { formatDate } from "@/lib/utils"
import CategoryBadge from "./CategoryBadge"

interface ClientProfileCardProps {
  client: Client
}

export default function ClientProfileCard({ client }: ClientProfileCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xl font-semibold text-gray-600">
              {client.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
            <div className="mt-1 flex items-center space-x-4">
              <CategoryBadge category={client.category} />
              <span className="text-sm text-gray-500">{client.gender}</span>
              <span className="text-sm text-gray-500">
                Born {formatDate(client.birthdate)}
              </span>
            </div>
          </div>
        </div>
        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Edit Profile
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Contact Information
          </h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Phone:</span> {client.contactNumber}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> {client.email}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Address:</span> {client.address || "Not provided"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Medical Information
          </h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Medical History:</span>{" "}
              {client.medicalHistory || "None recorded"}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Allergies:</span>{" "}
              {client.allergies || "None recorded"}
            </p>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Notes
          </h3>
          <p className="mt-2 text-sm text-gray-900">{client.notes}</p>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          Client since {formatDate(client.createdAt)}
        </p>
      </div>
    </div>
  )
}
