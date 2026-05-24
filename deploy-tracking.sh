#!/bin/bash

echo "🚀 KaliStream Advanced Login Tracking System Setup"
echo "=================================================="
echo ""

echo "1. Installing dependencies..."
npm install ua-parser-js @types/ua-parser-js --save

echo ""
echo "2. Building project..."
npm run build

echo ""
echo "3. Checking compilation..."
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed, please check errors above"
  exit 1
fi

echo ""
echo "4. Creating git commit..."
git add -A
git commit -m "Added advanced login tracking system and improved admin dashboard

- Implemented real-time login tracking with IP geolocation
- Added browser/OS detection using ua-parser-js
- Created 10+ reusable UI components (badges, flags, status indicators)
- Built enterprise-grade admin dashboard with filters and analytics
- Implemented suspicious login detection and VPN detection
- Added glassmorphism design with Framer Motion animations
- Optimized Firestore queries with aggregates and caching
- Added dark/light mode toggle
- Implemented rate limiting and anti-spam protection
- Added login history with circular buffer (max 50)
- Responsive mobile UI with skeleton loading
- Error boundaries and empty states

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo ""
echo "5. Pushing to GitHub..."
git push origin main

echo ""
echo "✅ All done! Advanced tracking system deployed."
