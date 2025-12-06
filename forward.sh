#!/bin/bash

kubectl port-forward -n flight-search service/flight-app-service 4000:80 &
kubectl port-forward -n flight-search service/postgres-service 5432:5432 &

echo "Ports forwarded:"
echo "App: http://localhost:4000"
echo "PostgreSQL: localhost:5432"
echo ""
echo "Press Ctrl+C to stop port-forwarding"

wait