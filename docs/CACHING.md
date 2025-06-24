# Google Sheets Caching Solution

## Overview

This document describes the caching solution implemented to address Google Sheets API quota limits. The cache stores sheet data locally to reduce API calls and improve performance.

## Problem

The application was hitting Google Sheets API quota limits:
```
Failed with range "A:K": Quota exceeded for quota metric 'Read requests' and limit 'Read requests per minute per user' of service 'sheets.googleapis.com'
```

## Solution

A local in-memory cache has been implemented with the following features:

### Cache Features

1. **Time-based caching**: Data is cached for a configurable TTL (Time To Live)
2. **Intelligent range caching**: Remembers which range format works and reuses it
3. **Automatic invalidation**: Cache is automatically invalidated after write operations
4. **Periodic invalidation**: Cache is cleared periodically to ensure data freshness
5. **Configurable settings**: Cache behavior can be tuned via environment variables
6. **Cache status monitoring**: Endpoints to check cache status and manually invalidate

### Intelligent Range Caching

The system tries multiple range formats (e.g., `'Vinyl Collection'!A:K`, `A:K`, etc.) and remembers which one works. Once a successful range is found, it's cached and reused for subsequent requests, dramatically reducing API calls.

**Benefits:**
- Only one API call needed to find the working range format
- Subsequent requests use the cached successful range
- Automatic fallback if the cached range stops working
- Eliminates repeated failed attempts with different range formats

### Cache Configuration

The following environment variables control cache behavior:

```bash
# Enable/disable cache (default: true)
ENABLE_CACHE=true

# Cache TTL in milliseconds (default: 5 minutes)
CACHE_TTL=300000

# Cache invalidation interval in milliseconds (default: 30 minutes)
CACHE_INVALIDATION_INTERVAL=1800000
```

### Cache Behavior

#### Read Operations
- First request: Fetches data from Google Sheets API and caches it
- Subsequent requests: Returns cached data if within TTL
- Cache miss: Fetches fresh data from API and updates cache

#### Write Operations
- Create, Update, Delete operations invalidate the entire cache
- Ensures data consistency after modifications

#### Automatic Invalidation
- Cache is automatically cleared every 30 minutes (configurable)
- Prevents stale data from persisting too long

## Implementation Details

### Cache Structure

```typescript
interface CacheEntry {
    data: any[][];        // Raw sheet data
    timestamp: number;    // Cache timestamp
    range: string;        // Sheet range
}
```

### Cache Key Format

```
${spreadsheetId}:${range}
```

Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms:A:K`

### Intelligent Range Caching

The system maintains a `successfulRange` property that remembers which range format works:

```typescript
private successfulRange: string | null = null;
```

**How it works:**
1. First request: Tries all range formats until one succeeds
2. Caches the successful range format
3. Subsequent requests: Uses the cached successful range first
4. If cached range fails: Falls back to trying all formats again
5. Cache invalidation: Resets the successful range

### Methods

#### Private Methods
- `getCachedOrFetchData(range)`: Basic caching logic for single range
- `getDataWithIntelligentRange(ranges)`: Intelligent range caching with multiple formats
- `invalidateCache()`: Clear all cache entries and reset successful range
- `invalidateCacheForRange(range)`: Clear specific range cache

#### Public Methods
- `invalidateAllCache()`: Public cache invalidation
- `getCacheStatus()`: Get cache statistics including successful range

## API Endpoints

### Cache Management

#### Get Cache Status
```http
GET /api/metadata/cache/status
Authorization: Bearer <token>
```

Response:
```json
{
    "enabled": true,
    "cacheSize": 2,
    "cacheTTL": 300000,
    "cacheInvalidationInterval": 1800000,
    "lastInvalidation": 1703123456789,
    "successfulRange": "A:K"
}
```

#### Invalidate Cache
```http
POST /api/metadata/cache/invalidate
Authorization: Bearer <token>
```

Response:
```json
{
    "message": "Cache invalidated successfully"
}
```

## Testing

A test script is provided to verify cache functionality:

```bash
# Make script executable
chmod +x scripts/test-cache.sh

# Run test (optional: set AUTH_TOKEN for authenticated endpoints)
./scripts/test-cache.sh
```

The test script:
1. Makes initial API calls (should hit Google Sheets API)
2. Makes subsequent calls (should use cache)
3. Tests different endpoints using same cached data
4. Invalidates cache and verifies fresh API calls

## Monitoring

### Log Messages

The cache implementation provides detailed logging:

- `📋 Using cached data for range: <range>` - Cache hit
- `🌐 Fetching fresh data from Google Sheets for range: <range>` - Cache miss
- `💾 Cached data for range: <range> Rows: <count>` - Data cached
- `🗑️ Invalidating all cached data` - Cache cleared
- `🔄 Invalidating cache due to time interval` - Periodic invalidation

### Cache Performance

Monitor these metrics:
- Cache hit rate (should be high for read-heavy workloads)
- API call reduction (should see fewer Google Sheets API calls)
- Response times (cached responses should be faster)

## Best Practices

### Configuration
- Set appropriate TTL based on data update frequency
- Use shorter TTL for frequently updated data
- Monitor cache hit rates and adjust settings accordingly

### Monitoring
- Regularly check cache status endpoint
- Monitor Google Sheets API usage
- Watch for cache-related errors in logs

### Troubleshooting
- If data appears stale, manually invalidate cache
- If API quota issues persist, reduce TTL or increase invalidation interval
- Disable cache temporarily if needed: `ENABLE_CACHE=false`

## Migration Notes

### Before Caching
- Every API call hit Google Sheets API
- High latency for all operations
- Risk of hitting quota limits

### After Caching
- Most read operations use cached data
- Significantly reduced API calls
- Improved response times
- Automatic quota management

## Future Enhancements

Potential improvements:
1. **Persistent cache**: Store cache on disk for application restarts
2. **Distributed cache**: Use Redis for multi-instance deployments
3. **Selective invalidation**: Invalidate only affected ranges
4. **Cache warming**: Pre-populate cache on startup
5. **Metrics collection**: Track cache performance over time
