# ADR-007: Multi-Instance Load Balancing Selection

## Context
Flash sale traffic requires distributing high-frequency HTTP requests across multiple running service instances.

## Decision
Deploy **Nginx** as a reverse proxy load balancer distributing incoming traffic round-robin across 2 running instances of `inventory-service` (`inventory-1:8081` and `inventory-2:8082`).

## Alternatives
- Spring Cloud Gateway LoadBalancer: Suitable for inner-cluster mesh routing.
- DNS Round-Robin: Rejected due to DNS caching delay.

## Consequences
Demonstrates horizontal scalability and sessionless concurrency safety across independent container nodes.
