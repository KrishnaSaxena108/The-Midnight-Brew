#!/bin/bash

# Test Script for The Midnight Brew API Routes
# Run this script to test all backend routes

echo "=========================================="
echo "🧪 Testing The Midnight Brew API Routes"
echo "=========================================="
echo ""

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Start it with: npm start"
    exit 1
fi

echo ""
echo "=========================================="
echo "📄 Testing Frontend Page Routes"
echo "=========================================="

echo ""
echo "1️⃣  Testing Homepage (/)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/

echo ""
echo "2️⃣  Testing Menu Page (/menu)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/menu

echo ""
echo "3️⃣  Testing Booking Page (/booking)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/booking

echo ""
echo "4️⃣  Testing Contact Page (/contact)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/contact

echo ""
echo "5️⃣  Testing About Page (/about)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/about

echo ""
echo "=========================================="
echo "🔌 Testing API Data Routes"
echo "=========================================="

echo ""
echo "6️⃣  Testing Café Info (/api/info)..."
echo "Response:"
curl -s http://localhost:3000/api/info | head -n 10

echo ""
echo ""
echo "7️⃣  Testing Menu Data (/api/menu)..."
echo "Response (first 15 lines):"
curl -s http://localhost:3000/api/menu | head -n 15

echo ""
echo ""
echo "8️⃣  Testing Menu by Category (/api/menu/coffee)..."
echo "Response:"
curl -s http://localhost:3000/api/menu/coffee

echo ""
echo ""
echo "9️⃣  Testing Operating Hours (/api/hours)..."
echo "Response:"
curl -s http://localhost:3000/api/hours

echo ""
echo ""
echo "🔟 Testing Welcome Message (/api/welcome)..."
echo "Response:"
curl -s http://localhost:3000/api/welcome

echo ""
echo ""
echo "1️⃣1️⃣  Testing Server Status (/api/status)..."
echo "Response:"
curl -s http://localhost:3000/api/status

echo ""
echo ""
echo "1️⃣2️⃣  Testing Health Check (/api/health)..."
echo "Response:"
curl -s http://localhost:3000/api/health

echo ""
echo ""
echo "=========================================="
echo "✅ All Tests Complete!"
echo "=========================================="
