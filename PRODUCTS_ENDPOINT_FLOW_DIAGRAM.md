# Products Endpoint Error Handling - Visual Flow

## Request Flow with Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                     User/Frontend Request                       │
│                  GET /api/products/                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Django Middleware                            │
│  • ErrorHandlingMiddleware (catches unhandled exceptions)       │
│  • Logs: Request path, method, user, full traceback           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductListView.list()                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TRY Block                                                  │ │
│  │  1. Log: "Products list endpoint accessed by {user}"      │ │
│  │  2. Call get_queryset() → Returns queryset or empty       │ │
│  │  3. Apply filters (category, search, price range)         │ │
│  │  4. Paginate results                                       │ │
│  │  5. Serialize data                                         │ │
│  │     └─ TRY: Serialize products                             │ │
│  │        └─ EXCEPT: Serialization error                      │ │
│  │           → Log error + Return empty paginated response    │ │
│  │  6. Return Response(data, status=200)                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ EXCEPT DatabaseError                                       │ │
│  │  • Log: "Database error" + full traceback                 │ │
│  │  • Return: HTTP 503 with error JSON                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ EXCEPT Exception                                           │ │
│  │  • Log: "Unexpected error" + full traceback               │ │
│  │  • Return: HTTP 500 with error JSON                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductListView.get_queryset()                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TRY Block                                                  │ │
│  │  1. Determine base queryset (all or active only)          │ │
│  │  2. Apply price_min filter (with validation)              │ │
│  │     └─ TRY: Parse and apply                                │ │
│  │        └─ EXCEPT: Log warning, skip invalid filter        │ │
│  │  3. Apply price_max filter (with validation)              │ │
│  │  4. Return queryset                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ EXCEPT DatabaseError                                       │ │
│  │  • Log: "Database error in get_queryset" + traceback      │ │
│  │  • Return: Product.objects.none() (empty queryset)        │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ EXCEPT Exception                                           │ │
│  │  • Log: "Unexpected error" + traceback                    │ │
│  │  • Return: Product.objects.none() (empty queryset)        │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Logging System                            │
│  • Console Handler (for Render dashboard)                      │
│  • Error Console Handler (ERROR level only)                    │
│  • Verbose formatter (timestamp, module, process/thread)       │
│  • Specific loggers: django, apps.products, ecommerce         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Response to User                         │
│                                                                 │
│  Success Cases:                                                 │
│  • HTTP 200 + Product list (paginated or not)                  │
│  • HTTP 200 + Empty list [] (when no products)                 │
│                                                                 │
│  Error Cases:                                                   │
│  • HTTP 503 + {"error": "...", "message": "..."} (DB error)    │
│  • HTTP 500 + {"error": "...", "message": "..."} (Other error) │
│  • HTTP 404 + {"error": "...", "message": "..."} (Not found)   │
│                                                                 │
│  ✓ ALWAYS returns valid JSON (never HTML error page)           │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Comparison

### BEFORE (Original Implementation)

```
Request → View → Database Error → ⚠️ CRASH ⚠️
                                     │
                                     ▼
                            Generic Render Error Page
                        "Something went wrong..."
                        (No logs, no context)
```

### AFTER (With Improvements)

```
Request → View → Database Error → CAUGHT → Log Details → Return JSON Error
                                    │
                                    ├─ Log: Full traceback
                                    ├─ Log: Request context
                                    ├─ Log: User info
                                    └─ Return: HTTP 503 + Error JSON
                                    
Request → View → Empty Database → Return HTTP 200 + []
                                   (Not an error!)

Request → View → Serialization Error → CAUGHT → Log + Return Empty List
```

## Logging Flow

```
┌─────────────────────┐
│   Any Exception     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Logger (apps.products / ecommerce / django)                │
│  • Level: INFO for normal ops, ERROR for exceptions         │
│  • Format: {levelname} {asctime} {module} {message}         │
└─────────┬───────────────────────────────────────────────────┘
          │
          ├─────────────────────┬─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Console Handler │  │ Error Handler   │  │  File Handler   │
│  (ALL levels)   │  │  (ERROR only)   │  │  (logs/...)     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                     │
         └────────────────────┴─────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │    Render Dashboard Logs Tab           │
         │    • All logs visible here             │
         │    • Search/filter available           │
         │    • Real-time streaming               │
         └────────────────────────────────────────┘
```

## Scenario Examples

### Scenario 1: Normal Operation (50 products in DB)

```
Request: GET /api/products/
   ↓
Log: INFO Products list endpoint accessed by anonymous
   ↓
Query: SELECT * FROM products WHERE is_active=True LIMIT 20
   ↓
Log: INFO Successfully serialized 20 products (paginated)
   ↓
Response: HTTP 200
{
  "count": 50,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

### Scenario 2: Empty Database

```
Request: GET /api/products/
   ↓
Log: INFO Products list endpoint accessed by anonymous
   ↓
Query: SELECT * FROM products WHERE is_active=True
Result: 0 rows
   ↓
Log: INFO No products found, returning empty list
   ↓
Log: INFO Successfully serialized 0 products
   ↓
Response: HTTP 200
{
  "count": 0,
  "results": []
}

✓ Not an error! Just an empty result.
```

### Scenario 3: Database Connection Error

```
Request: GET /api/products/
   ↓
Log: INFO Products list endpoint accessed by anonymous
   ↓
Query: SELECT * FROM products...
   ↓
Database: ⚠️ Connection refused
   ↓
Log: ERROR Database error in get_queryset: ...
Log: ERROR Traceback: [full stack trace]
   ↓
Return empty queryset → list() method receives empty data
   ↓
Log: ERROR Database error in list method: ...
Log: ERROR Request path: /api/products/
   ↓
Response: HTTP 503
{
  "error": "Database connection error",
  "message": "Unable to connect to the database. Please try again later."
}

✓ Proper error response, all details logged
```

### Scenario 4: Serialization Error

```
Request: GET /api/products/
   ↓
Log: INFO Products list endpoint accessed by anonymous
   ↓
Query: SELECT * FROM products... (Success)
   ↓
Serialization: ⚠️ Field type mismatch or missing field
   ↓
Log: ERROR Serialization error (paginated): ...
Log: ERROR Traceback: [full stack trace]
   ↓
Response: HTTP 200 (with empty paginated response)
{
  "count": 0,
  "results": []
}

✓ Error logged, but service continues
```

## Benefits Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    For Developers                           │
├─────────────────────────────────────────────────────────────┤
│ ✓ Full stack traces in logs                                 │
│ ✓ Request context (path, user, params)                      │
│ ✓ Easy to identify exact failure point                      │
│ ✓ Graceful error handling = easier debugging                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     For Users/Frontend                       │
├─────────────────────────────────────────────────────────────┤
│ ✓ Always receives valid JSON (never HTML error page)        │
│ ✓ Proper HTTP status codes                                  │
│ ✓ Informative error messages                                │
│ ✓ Empty results handled gracefully                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    For Operations                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ Service continues even with partial failures              │
│ ✓ All errors visible in Render dashboard                    │
│ ✓ Clear distinction between error types                     │
│ ✓ Monitoring and alerting is now possible                   │
└─────────────────────────────────────────────────────────────┘
```
