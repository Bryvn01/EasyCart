# Health Check Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EasyCart Health Check System                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│      Node.js Backend (Port 5000)     │  │    Django Backend (Port 8000)    │
│                                      │  │                                  │
│  ┌────────────────────────────────┐  │  │  ┌────────────────────────────┐  │
│  │   GET /api/health              │  │  │  │   GET /api/health/         │  │
│  │                                │  │  │  │                            │  │
│  │   Returns:                     │  │  │  │   Returns:                 │  │
│  │   • Overall status (UP/DOWN)   │  │  │  │   • Overall status         │  │
│  │   • Service metadata           │  │  │  │   • Service metadata       │  │
│  │   • Uptime information         │  │  │  │   • Database health        │  │
│  │   • Component health:          │  │  │  │   • Python runtime info    │  │
│  │     - Database (Mongoose)      │  │  │  │   • Response time          │  │
│  │     - Memory usage             │  │  │  │                            │  │
│  │   • Response time              │  │  │  │   HTTP: 200 (UP)           │  │
│  │                                │  │  │  │         503 (DOWN)         │  │
│  │   HTTP: 200 (UP)               │  │  │  └────────────────────────────┘  │
│  │         503 (DOWN)             │  │  │                                  │
│  └────────────────────────────────┘  │  │  ┌────────────────────────────┐  │
│                                      │  │  │   GET /api/health/live/    │  │
│  ┌────────────────────────────────┐  │  │  │                            │  │
│  │   Health Check Components      │  │  │  │   Kubernetes Liveness      │  │
│  │                                │  │  │  │   Simple alive check       │  │
│  │   1. Database Health           │  │  │  │   HTTP: 200 (alive)        │  │
│  │      • Connection state        │  │  │  └────────────────────────────┘  │
│  │      • Database name           │  │  │                                  │
│  │      • Collection count        │  │  │  ┌────────────────────────────┐  │
│  │      • Data size               │  │  │  │   GET /api/health/ready/   │  │
│  │                                │  │  │  │                            │  │
│  │   2. Memory Health             │  │  │  │   Kubernetes Readiness     │  │
│  │      • Heap used/total         │  │  │  │   Checks dependencies      │  │
│  │      • External memory         │  │  │  │   HTTP: 200 (ready)        │  │
│  │      • Usage percentage        │  │  │  │         503 (not ready)    │  │
│  │      • Status (UP/WARNING)     │  │  │  └────────────────────────────┘  │
│  │                                │  │  │                                  │
│  └────────────────────────────────┘  │  │  ┌────────────────────────────┐  │
│                                      │  │  │   Health Check Components  │  │
│              ▼                       │  │  │                            │  │
│  ┌────────────────────────────────┐  │  │  │   1. Database Health       │  │
│  │      MongoDB Connection        │  │  │  │      • Connection status   │  │
│  │        (Mongoose)              │  │  │  │      • Database name       │  │
│  │                                │  │  │  │      • MongoDB version     │  │
│  │   • Connected                  │  │  │  │      • Products count      │  │
│  │   • Disconnected               │  │  │  │                            │  │
│  │   • Connecting                 │  │  │  │   2. Python Runtime        │  │
│  │   • Disconnecting              │  │  │  │      • Version             │  │
│  └────────────────────────────────┘  │  │  │      • Implementation      │  │
│                                      │  │  │                            │  │
└──────────────────────────────────────┘  │  └────────────────────────────┘  │
                                          │                                  │
                                          │              ▼                   │
                                          │  ┌────────────────────────────┐  │
                                          │  │   MongoDB Connection       │  │
                                          │  │      (PyMongo)             │  │
                                          │  │                            │  │
                                          │  │   • Connected              │  │
                                          │  │   • Disconnected           │  │
                                          │  └────────────────────────────┘  │
                                          │                                  │
                                          └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MongoDB Atlas Database                            │
│                                                                             │
│   Collections:                                                              │
│   • products                                                                │
│   • categories                                                              │
│   • users                                                                   │
│   • orders                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             Integration Points                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│   Load Balancers     │     │    Kubernetes        │     │   Monitoring     │
│                      │     │                      │     │   Systems        │
│  • Check /api/health │     │  Liveness Probe:     │     │                  │
│  • Interval: 30s     │     │   /api/health/live/  │     │  • Prometheus    │
│  • Timeout: 5s       │     │                      │     │  • Datadog       │
│  • Success: 200      │     │  Readiness Probe:    │     │  • New Relic     │
│                      │     │   /api/health/ready/ │     │  • Custom        │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Response Time Tracking                             │
└─────────────────────────────────────────────────────────────────────────────┘

Health Check Flow:
  1. Request received → Start timer
  2. Check all components (database, memory, etc.)
  3. Aggregate component statuses
  4. Determine overall status
  5. Stop timer → Calculate response time
  6. Return JSON response with all details

Expected Response Times:
  • Node.js /api/health:        < 100ms  (< 50ms typical)
  • Django /api/health/:        < 100ms  (< 50ms typical)
  • Django /api/health/live/:   < 50ms   (< 20ms typical)
  • Django /api/health/ready/:  < 100ms  (< 50ms typical)

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Status Determination Logic                         │
└─────────────────────────────────────────────────────────────────────────────┘

Node.js Backend:
  IF database.status == "UP" AND memory.status != "DOWN"
    THEN overall.status = "UP" (HTTP 200)
  ELSE
    overall.status = "DOWN" (HTTP 503)

Django Backend:
  IF database.status == "connected"
    THEN overall.status = "UP" (HTTP 200)
  ELSE
    overall.status = "DOWN" (HTTP 503)

Memory Status (Node.js):
  IF usage < 90%
    THEN memory.status = "UP"
  ELSE
    memory.status = "WARNING"

┌─────────────────────────────────────────────────────────────────────────────┐
│                              Test Coverage                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Backend Tests:
  ✅ Smoke tests (5 tests)
     • Health endpoint returns OK
     • Products endpoint structure
     • Seeding script validation
     • Model definitions

  ✅ Health integration tests (4 tests)
     • Comprehensive health status
     • Response time validation
     • Database connection details
     • Memory status reporting

Total: 9 tests passing
```
