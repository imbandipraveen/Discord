#!/bin/bash
echo "Stopping any existing Node.js server processes..."
pkill -f "node server.js" || echo "No server processes found to kill"

# Wait for processes to fully terminate
sleep 2

echo "Starting the server..."
node server.js 