import { NextRequest, NextResponse } from 'next/server'

interface PlaceDetailsRequest {
  placeId: string
}

interface GooglePlaceComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GooglePlaceDetails {
  result: {
    formatted_address: string
    address_components: GooglePlaceComponent[]
  }
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PlaceDetailsRequest = await request.json()
    const { placeId } = body

    // Get Google API key from environment
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!googleApiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    // Call Google Places API to get place details
    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry&key=${googleApiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (!googleResponse.ok) {
      const errorData = await googleResponse.text()
      console.error('Google API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get place details from Google' },
        { status: 500 }
      )
    }

    const googleData: GooglePlaceDetails = await googleResponse.json()

    if (googleData.status !== 'OK') {
      return NextResponse.json(
        { error: `Google Places API error: ${googleData.status}` },
        { status: 400 }
      )
    }

    // Extract address components
    const addressComponents = googleData.result.address_components
    const formattedAddress = googleData.result.formatted_address

    // Extract validated city, state, zip, country
    const validatedComponents = {
      address1: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }

    addressComponents.forEach(component => {
      const types = component.types
      const text = component.long_name

      if (types.includes('street_number') || types.includes('route')) {
        if (types.includes('street_number')) {
          validatedComponents.address1 = text
        } else {
          validatedComponents.address1 += (validatedComponents.address1 ? ' ' : '') + text
        }
      } else if (types.includes('locality') || types.includes('sublocality')) {
        validatedComponents.city = text
      } else if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
        validatedComponents.state = text
      } else if (types.includes('postal_code')) {
        validatedComponents.zipCode = text
      } else if (types.includes('country')) {
        validatedComponents.country = text
      }
    })

    // Check if all required components are present
    // For international addresses, some components might be named differently
    const missingComponents = []
    if (!validatedComponents.address1) missingComponents.push('street address')
    if (!validatedComponents.city) missingComponents.push('city')
    if (!validatedComponents.state) missingComponents.push('state/province')
    if (!validatedComponents.zipCode) missingComponents.push('postal code')
    if (!validatedComponents.country) missingComponents.push('country')

    const isValid = missingComponents.length === 0

    return NextResponse.json({
      isValid,
      missingComponents,
      validatedAddress: {
        formattedAddress,
        address1: validatedComponents.address1,
        city: validatedComponents.city,
        state: validatedComponents.state,
        zipCode: validatedComponents.zipCode,
        country: validatedComponents.country
      }
    })

  } catch (error) {
    console.error('Place details error:', error)
    return NextResponse.json(
      { error: 'Internal server error during place details lookup' },
      { status: 500 }
    )
  }
}
