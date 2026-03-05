
'use client'

import { createClient } from '../utils/supabase/client'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSchema() {
      const supabase = createClient()
      
      // Try to select from staff to see columns
      // Note: This relies on RLS policies allowing access
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .limit(1)

      if (error) {
        setError(error.message)
      } else {
        setSchemaInfo(data)
      }
    }

    checkSchema()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Schema Debug</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4 text-red-700">
          Error: {error}
        </div>
      )}

      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(schemaInfo, null, 2)}
      </pre>
      
      <p className="mt-4 text-sm text-gray-600">
        If you see an empty array [], it means the table exists but is empty or RLS is blocking rows.
        If you see an error about columns, the schema might be mismatched.
      </p>
    </div>
  )
}
