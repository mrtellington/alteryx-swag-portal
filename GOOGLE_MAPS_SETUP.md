# Google Maps API Setup for Address Autocomplete

This guide will help you set up Google Maps API for address autocomplete in the Alteryx Swag Portal.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Cloud project
3. Billing enabled on your Google Cloud project

## Step 1: Enable Required APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Enable the following APIs:
   - **Places API** (for autocomplete)
   - **Geocoding API** (for place details)

## Step 2: Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. Click **Restrict Key** to secure it:
   - **Application restrictions**: Choose "HTTP referrers" and add your domain
   - **API restrictions**: Select "Places API" and "Geocoding API"

## Step 3: Configure Environment Variables

1. Add the API key to your `.env.local` file:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

2. Update your production environment variables with the same keys.

## Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the cart page
3. Start typing in the "Address Line 1" field
4. You should see address suggestions appear
5. Select an address to auto-populate all fields

## Features

The address autocomplete system provides:

- ✅ **Real-time suggestions**: As you type in the address field
- ✅ **Auto-population**: All address fields (city, state, zip, country) are filled automatically
- ✅ **Validation**: Address is validated when selected
- ✅ **US addresses only**: Restricted to US addresses for shipping
- ✅ **Disabled checkout**: Checkout button is disabled until valid address is selected

## User Experience

1. **Type Address**: User starts typing in the address field
2. **See Suggestions**: Google Places API shows address suggestions
3. **Select Address**: User clicks on a suggestion
4. **Auto-populate**: All fields are automatically filled with validated data
5. **Enable Checkout**: Checkout button becomes enabled
6. **Complete Order**: User can proceed with checkout

## Cost Considerations

- Google Places API has usage-based pricing
- Typical cost: ~$0.017 per autocomplete request
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Troubleshooting

### Common Issues:

1. **"Google Maps API key not configured"**
   - Ensure both `GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` are set

2. **"No address suggestions appear"**
   - Check if Places API is enabled
   - Verify API key restrictions allow the request
   - Check billing status

3. **"Fields not auto-populating"**
   - Ensure Geocoding API is enabled
   - Check browser console for JavaScript errors

### Support:

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps Platform Support](https://developers.google.com/maps/support)
