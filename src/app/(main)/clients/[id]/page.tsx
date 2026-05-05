"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import ClientProfileCard from "@/components/clients/ClientProfileCard"
import VisitHistoryTable from "@/components/clients/VisitHistoryTable"
import PackageStatusCard from "@/components/clients/PackageStatusCard"
import { Client } from "@/types/client"

// Mock data - replace with API call
const mockClient: Client = {
  id: "1",
  fullName: "Maria Santos",
  contactNumber: "+639123456789",
  email: "maria.santos@email.com",
  address: "123 Main St, Olongapo City",
  birthdate: "1990-05-15",
  gender: "Female",
  medicalHistory: "Hypertension",
  allergies: "Penicillin",
  notes: "Prefers morning appointments. VIP client with regular facial treatments.",
  category: "VIP",
  createdAt: "2024-01-15T10:00:00Z"
}

type TabType = "overview" | "visits" | "packages"

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: "👤" },
    { id: "visits" as TabType, label: "Visit History", icon: "📅" },
    { id: "packages" as TabType, label: "Packages", icon: "🎁" }
  ]

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Client Profile Header */}
        <ClientProfileCard client={mockClient} />

        {/* Tabs Navigation */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Quick Stats */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Visits:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-medium">₱15,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Visit:</span>
                        <span className="font-medium">Jan 25, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Appointment:</span>
                        <span className="font-medium">Feb 5, 2024</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-900">Completed facial treatment</p>
                          <p className="text-gray-500">Jan 25, 2024 • ₱2,500</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-900">Purchased massage package</p>
                          <p className="text-gray-500">Jan 15, 2024 • ₱8,000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Notes Alert */}
                {(mockClient.medicalHistory || mockClient.allergies) && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        ⚠️
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">Medical Notes</h4>
                        <div className="mt-2 text-sm text-yellow-700">
                          {mockClient.medicalHistory && (
                            <p><strong>Medical History:</strong> {mockClient.medicalHistory}</p>
                          )}
                          {mockClient.allergies && (
                            <p><strong>Allergies:</strong> {mockClient.allergies}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "visits" && (
              <VisitHistoryTable clientId={clientId} />
            )}

            {activeTab === "packages" && (
              <PackageStatusCard clientId={clientId} />
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
