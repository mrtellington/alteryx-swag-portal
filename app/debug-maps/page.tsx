'use client'

import { useState, useEffect, useRef } from 'react'

// Google Maps types for debug
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              types?: string[]
              componentRestrictions?: { country?: string }
              fields?: string[]
            }
          ) => {
            addListener: (event: string, callback: () => void) => void
            getPlace: () => { place_id?: string; formatted_address?: string }
          }
        }
      }
    }
    initGoogleMapsDebug: () => void
  }
}

export default function DebugMapsPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [apiKey, setApiKey] = useState<string>('')
  const [testResults, setTestResults] = useState<string[]>([])
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA_hkb41owh55NAXg-PEqeiEC1aTRGfKPg'
    setApiKey(key)
    
    const testGoogleMaps = async () => {
      const results: string[] = []
      
      try {
        // Test 1: Check if Google Maps script is loaded
        if (typeof window !== 'undefined' && window.google) {
          results.push('✅ Google Maps script loaded')
          
          // Test 2: Check if Places API is available
          if (window.google.maps && window.google.maps.places) {
            results.push('✅ Places API available')
            
            // Test 3: Check if Autocomplete is available
            if (window.google.maps.places.Autocomplete) {
              results.push('✅ Autocomplete API available')
              
              // Test 4: Try to create autocomplete instance
              if (addressInputRef.current) {
                try {
                  const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                    types: ['address'],
                    fields: ['place_id', 'formatted_address', 'address_components']
                  })
                  
                  autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace()
                    results.push(`✅ Place selected: ${place.formatted_address}`)
                    setTestResults([...results])
                  })

                  // Test if autocomplete suggestions appear
                  setTimeout(() => {
                    if (addressInputRef.current) {
                      addressInputRef.current.value = '123 Main St, London'
                      addressInputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
                      results.push('🔍 Testing autocomplete with "123 Main St, London"')
                      setTestResults([...results])
                    }
                  }, 2000)
                  
                  autocompleteRef.current = autocomplete
                  results.push('✅ Autocomplete instance created successfully')
                } catch (error) {
                  results.push(`❌ Failed to create autocomplete: ${error}`)
                }
              } else {
                results.push('❌ Address input not found')
              }
            } else {
              results.push('❌ Autocomplete API not available')
            }
          } else {
            results.push('❌ Places API not available')
          }
        } else {
          results.push('❌ Google Maps script not loaded')
          
          // Try to load it
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMapsDebug`
          script.async = true
          script.defer = true
          
          window.initGoogleMapsDebug = () => {
            results.push('✅ Google Maps script loaded via callback')
            setTestResults([...results])
            testGoogleMaps()
          }
          
          document.head.appendChild(script)
        }
        
        setStatus('Ready')
        setTestResults(results)
      } catch (error) {
        results.push(`❌ Error: ${error}`)
        setStatus('Error')
        setTestResults(results)
      }
    }
    
    testGoogleMaps()
  }, [])

  const testInternationalAddresses = () => {
    const testAddresses = [
      '123 Main St, London, UK',
      '456 Rue de la Paix, Paris, France',
      '789 Avenida Paulista, São Paulo, Brazil',
      '321 Champs-Élysées, Paris, France',
      '654 Oxford Street, London, UK'
    ]
    
    setTestResults(prev => [...prev, '🌍 Testing international addresses...'])
    setTestResults(prev => [...prev, 'Note: Direct API calls may fail due to CORS restrictions'])
    setTestResults(prev => [...prev, 'The autocomplete should still work in the UI'])
    
    testAddresses.forEach((address, index) => {
      setTimeout(() => {
        setTestResults(prev => [...prev, `📍 Test ${index + 1}: ${address}`])
        setTestResults(prev => [...prev, `   Try typing this in the input field above`])
      }, index * 1000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Google Maps API Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Status:</p>
                <p className={`text-lg ${status === 'Ready' ? 'text-green-600' : status === 'Error' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {status}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">API Key:</p>
                <p className="text-sm text-gray-600 font-mono">
                  {apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'Not found'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Environment:</p>
                <p className="text-sm text-gray-600">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Autocomplete</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="testAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Address Input
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  id="testAddress"
                  placeholder="Try typing an international address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to see if autocomplete suggestions appear
                </p>
              </div>
              
              <button
                onClick={testInternationalAddresses}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test International Addresses
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">Troubleshooting Guide</h2>
          <div className="space-y-3 text-sm text-yellow-800">
            <p><strong>If autocomplete is not working:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check if Places API is enabled in Google Cloud Console</li>
              <li>Verify the API key has the correct permissions</li>
              <li>Ensure billing is enabled for the Google Cloud project</li>
              <li>Check if there are any domain or IP restrictions on the API key</li>
              <li>Verify the API key is valid and not expired</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
