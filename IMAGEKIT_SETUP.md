# ImageKit Setup Guide

This guide will help you set up ImageKit for image uploads in your t-shirt e-commerce application.

## Step 1: Create an ImageKit Account

1. Go to [ImageKit.io](https://imagekit.io/) and sign up for an account
2. They offer a free tier with 20GB storage and bandwidth

## Step 2: Get Your Credentials

After signing up and logging in:

1. Go to the Dashboard
2. Navigate to **Developer Options > API Keys**
3. You'll need three key pieces of information:
   - Public API Key
   - Private API Key
   - URL Endpoint (looks like `https://ik.imagekit.io/your_account_id`)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key_here"
IMAGEKIT_PRIVATE_KEY="your_private_key_here"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

## Step 4: Restart Your Development Server

After adding the environment variables, restart your Next.js development server for the changes to take effect.

```
npm run dev
```

## Step 5: Test the Integration

Try adding a product with image uploads to verify the ImageKit integration is working correctly.

## Troubleshooting

If you encounter issues:

1. Verify your API keys are correct
2. Make sure your URL endpoint is formatted correctly
3. Check that you've prefixed client-side environment variables with `NEXT_PUBLIC_`
4. Clear your browser cache and restart your development server

For more information, refer to the [ImageKit documentation](https://docs.imagekit.io/).
