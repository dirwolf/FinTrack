"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import tab components
import Overview from "./components/overview"
import ClientLedger from "./components/client-ledger"
import ClientProfitability from "./components/client-profitability"

export default function Ledger() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="p-6 min-h-screen max-w-[100vw] overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl ">Ledger & Reports</h1>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
  <div className="flex justify-end mb-6">
    <TabsList className="bg-transparent border-0 shadow-none">
      <TabsTrigger 
        value="overview" 
        className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
          activeTab === "overview" 
            ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Overview
      </TabsTrigger>
      <TabsTrigger 
        value="client-ledger" 
        className={`cursor-pointer bg-transparent text-md pb-5 border-0 shadow-none px-4 relative ${
          activeTab === "client-ledger" 
            ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Client Ledger
      </TabsTrigger>
      <TabsTrigger 
        value="client-profitability" 
        className={`cursor-pointer bg-transparent text-md pb-5 border-0 shadow-none px-4 relative ${
          activeTab === "client-profitability" 
            ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Client Profitability Report
      </TabsTrigger>
    </TabsList>
  </div>

  <div className="w-full overflow-x-hidden">
    <TabsContent value="overview" className="w-full ">
      <Overview />
    </TabsContent>

    <TabsContent value="client-ledger" className="w-full">
      <ClientLedger />
    </TabsContent>

    <TabsContent value="client-profitability" className="w-full">
      <ClientProfitability />
    </TabsContent>
  </div>
</Tabs>

    </div>
  )
}
