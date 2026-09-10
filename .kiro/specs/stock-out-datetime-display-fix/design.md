# Design Document: Stock Out DateTime Display Fix

## Overview

This design addresses the datetime display issue in the Stock Out Request Details history modal. The problem stems from inconsistent timezone handling between the backend and frontend, resulting in incorrect timestamp displays. The solution implements proper timezone conversion in the backend and ensures the frontend displays the pre-formatted timestamps without additional conversion.

## Problem Analysis

Currently, the `HistoryController::viewStockOutDetails()` method returns raw Eloquent model data without explicit timezone conversion or formatting. The timestamps are stored in the database and returned as Carbon instances, which may not be properly formatted for the Asia/Manila timezone before being sent to the frontend. The frontend then displays these timestamps, potentially applying its own timezone conversion, leading to incorrect time displays.

## Architecture

### Component Overview

```
┌─────────────────┐
│   Database      │
│  (UTC storage)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ StockOut Model  │
│  (Eloquent)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  HistoryController      │
│  - Timezone Conversion  │
│  - Format timestamps    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│   JSON API      │
│  (formatted)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ History.jsx     │
│ (Modal Display) │
└─────────────────┘
```

### Separation of Concerns

1. **Database Layer**: Stores timestamps (Laravel typically stores in UTC)
2. **Model Layer**: Eloquent models with timestamp attributes
3. **Controller Layer**: Responsible for timezone conversion and formatting
4. **API Response**: Returns formatted string timestamps
5. **Frontend Layer**: Displays pre-formatted timestamps without modification

## Implementation Design

### Backend Changes

#### 1. HistoryController Timezone Handling

The `viewStockOutDetails()` method will be modified to:

1. Retrieve the StockOut record with relationships
2. Convert timestamp fields to Asia/Manila timezone
3. Format timestamps as strings in "Y-m-d H:i:s" format
4. Return formatted data to frontend

**Modified Method Structure:**

```php
public function viewStockOutDetails($id)
{
    $stockOut = StockOut::with([
        'items.product',
        'customer',
        'requestedBy',
        'approvedBy'
    ])->findOrFail($id);

    // Authorization check
    $user = auth()->user();
    $user->load('role');
    $isAdmin = $user->role->role_name === 'Admin';
    
    if (!$isAdmin && $stockOut->requested_by_id !== $user->id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Format timestamps for Asia/Manila timezone
    $formattedStockOut = $stockOut->toArray();
    
    // Convert and format created_at
    if ($stockOut->created_at) {
        $formattedStockOut['created_at'] = $stockOut->created_at
            ->timezone('Asia/Manila')
            ->format('Y-m-d H:i:s');
    }
    
    // Convert and format approved_at (may be null)
    if ($stockOut->approved_at) {
        $formattedStockOut['approved_at'] = $stockOut->approved_at
            ->timezone('Asia/Manila')
            ->format('Y-m-d H:i:s');
    }

    return response()->json([
        'stockOut' => $formattedStockOut,
    ]);
}
```

**Key Implementation Details:**

- **Timezone Conversion**: Use Carbon's `timezone()` method to convert from storage timezone to Asia/Manila
- **Format Specification**: Use "Y-m-d H:i:s" format (e.g., "2025-01-15 14:30:45")
- **Null Handling**: Check for null before conversion to prevent errors
- **Array Conversion**: Convert model to array first, then override timestamp fields with formatted strings

#### 2. Similar Changes for StockIn

The `viewStockInDetails()` method should receive identical treatment:

```php
public function viewStockInDetails($id)
{
    $stockIn = StockIn::with([
        'items.category',
        'items.supplier', 
        'requestedBy',
        'approvedBy'
    ])->findOrFail($id);

    // Authorization check
    $user = auth()->user();
    $user->load('role');
    $isAdmin = $user->role->role_name === 'Admin';
    
    if (!$isAdmin && $stockIn->requested_by_id !== $user->id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Format timestamps for Asia/Manila timezone
    $formattedStockIn = $stockIn->toArray();
    
    if ($stockIn->created_at) {
        $formattedStockIn['created_at'] = $stockIn->created_at
            ->timezone('Asia/Manila')
            ->format('Y-m-d H:i:s');
    }
    
    if ($stockIn->approved_at) {
        $formattedStockIn['approved_at'] = $stockIn->approved_at
            ->timezone('Asia/Manila')
            ->format('Y-m-d H:i:s');
    }

    return response()->json([
        'stockIn' => $formattedStockIn,
    ]);
}
```

### Frontend Changes

#### 1. History.jsx Modal Display

The frontend modal currently uses `formatDateTimeSingleLine()` utility function to format timestamps. Since the backend now returns pre-formatted strings in the correct timezone, we need to ensure the frontend displays them as-is without additional conversion.

**Current Code Location:**

The details modal in `History.jsx` displays timestamps in the "Request Information" section:

```jsx
<div>
  <span className="text-gray-600">Request Date:</span>
  <div className="font-medium">
    {formatDateTimeSingleLine(selectedDetails.type === 'stock-in' ? 
      selectedDetails.stockIn?.created_at : 
      selectedDetails.stockOut?.created_at)}
  </div>
</div>
```

**Design Decision:**

We have two options:

**Option A**: Modify `formatDateTimeSingleLine()` to detect and pass through already-formatted strings
**Option B**: Display pre-formatted strings directly without utility function

**Recommended Approach**: Option B is cleaner and more explicit. Since the backend now returns properly formatted strings, we should display them directly:

```jsx
<div>
  <span className="text-gray-600">Request Date:</span>
  <div className="font-medium">
    {selectedDetails.type === 'stock-in' ? 
      selectedDetails.stockIn?.created_at : 
      selectedDetails.stockOut?.created_at}
  </div>
</div>

{/* For approved/rejected requests */}
<div>
  <span className="text-gray-600">
    {selectedDetails.status === 'approved' ? 'Approved' : 'Rejected'} Date:
  </span>
  <div className="font-medium">
    {selectedDetails.type === 'stock-in' ? 
      (selectedDetails.stockIn?.approved_at || 'Not yet approved') : 
      (selectedDetails.stockOut?.approved_at || 'Not yet approved')}
  </div>
</div>
```

**Null Handling:**

For `approved_at` fields that may be null (pending requests), display a fallback message:

```jsx
{selectedDetails.stockOut?.approved_at || 'Not yet approved'}
```

## Data Flow

### Before Fix

```
Database (UTC/Manila?) 
  → Eloquent Model (Carbon instance)
  → JSON Response (ISO 8601 string)
  → Frontend (formatDateTimeSingleLine converts with browser timezone)
  → Display (WRONG TIMEZONE)
```

### After Fix

```
Database (UTC/Manila?)
  → Eloquent Model (Carbon instance)
  → Controller (Convert to Asia/Manila, format as string)
  → JSON Response (Pre-formatted string: "2025-01-15 14:30:45")
  → Frontend (Display as-is)
  → Display (CORRECT TIMEZONE)
```

## Error Handling

### Backend Error Cases

1. **Null Timestamps**: Check for null before conversion
   ```php
   if ($stockOut->approved_at) {
       $formattedStockOut['approved_at'] = $stockOut->approved_at
           ->timezone('Asia/Manila')
           ->format('Y-m-d H:i:s');
   }
   // Otherwise, approved_at remains null in the array
   ```

2. **Invalid Timezone**: Laravel's timezone configuration ensures valid timezone
   - Configured in `config/app.php`: `'timezone' => 'Asia/Manila'`
   - No additional error handling needed as Carbon handles timezone conversion

3. **Model Not Found**: Already handled by `findOrFail()` (throws 404)

### Frontend Error Cases

1. **Null approved_at**: Display fallback message
   ```jsx
   {selectedDetails.stockOut?.approved_at || 'Not yet approved'}
   ```

2. **Missing Data**: Use optional chaining and nullish coalescing
   ```jsx
   {selectedDetails.stockOut?.created_at ?? 'N/A'}
   ```

3. **API Errors**: Already handled by existing error handling in `handleViewDetails()`

## Configuration

### Application Timezone

The application timezone is already configured in `config/app.php`:

```php
'timezone' => 'Asia/Manila',
```

This configuration is used by:
- Laravel's Carbon instances
- Database timestamp casting
- All date/time operations in the application

### Database Considerations

Laravel typically stores timestamps in UTC and converts them based on the application timezone. With `'timezone' => 'Asia/Manila'` configured, Carbon instances created from database timestamps will use this timezone when explicitly converted via `timezone()` method.

## Testing Strategy

### Backend Unit Tests

Tests for `HistoryController`:

1. **Test timezone conversion works correctly**
   - Create test data with known timestamps
   - Call `viewStockOutDetails()`
   - Verify returned timestamps are in Asia/Manila timezone
   - Verify format is "Y-m-d H:i:s"

2. **Test null handling**
   - Create StockOut with null `approved_at`
   - Verify no errors occur
   - Verify `approved_at` is null in response

3. **Test format consistency**
   - Verify both `created_at` and `approved_at` use same format
   - Verify format matches regex: `/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/`

### Frontend Component Tests

Tests for `History.jsx` modal:

1. **Test display of formatted timestamps**
   - Pass mock data with formatted timestamp strings
   - Verify timestamps display exactly as provided
   - Verify no additional formatting/conversion applied

2. **Test null handling**
   - Pass mock data with null `approved_at`
   - Verify fallback message displays ("Not yet approved")

### Integration Tests

1. **End-to-end flow test**
   - Create StockOut request in test database
   - Approve it with known timestamp
   - Call API endpoint
   - Verify response contains correctly formatted timestamps in Asia/Manila

## Migration Notes

### Backward Compatibility

This change modifies the API response format:
- **Before**: Timestamps as ISO 8601 strings or Carbon JSON representation
- **After**: Timestamps as "Y-m-d H:i:s" formatted strings

**Impact**: The frontend currently uses `formatDateTimeSingleLine()` which can handle various input formats. By switching to direct display, we ensure consistency.

**Risk**: Low - The change is isolated to the details modal display

### Deployment Steps

1. Deploy backend changes (HistoryController)
2. Deploy frontend changes (History.jsx)
3. Clear application cache: `php artisan cache:clear`
4. Test with real data in staging environment
5. Deploy to production

### Rollback Plan

If issues arise:
1. Revert frontend changes first (restore `formatDateTimeSingleLine()` usage)
2. If needed, revert backend changes
3. Both components can be reverted independently

## Alternative Approaches Considered

### Alternative 1: Frontend-Only Fix

**Approach**: Keep backend as-is, fix timezone handling in frontend

**Pros**: 
- Minimal backend changes
- Frontend has full control over display format

**Cons**:
- Frontend needs to know the server timezone
- More complex timezone conversion logic in JavaScript
- Potential for future inconsistencies

**Verdict**: ❌ Rejected - Backend should own data formatting

### Alternative 2: Global Eloquent Accessor

**Approach**: Add a global accessor to all models to format timestamps

**Pros**:
- Centralized formatting logic
- Automatic for all API responses

**Cons**:
- May affect other parts of the application unexpectedly
- Harder to customize per-endpoint
- Could break existing functionality

**Verdict**: ❌ Rejected - Too broad, risk of unintended consequences

### Alternative 3: API Resource Classes

**Approach**: Create API Resource classes for StockIn/StockOut with formatted timestamps

**Pros**:
- Clean separation of API presentation logic
- Reusable across multiple endpoints
- Laravel best practice

**Cons**:
- More boilerplate code
- May be over-engineering for this specific fix

**Verdict**: ⚠️ Future consideration - Good for broader refactoring but overkill for this fix

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timezone Conversion Correctness

*For any* timestamp retrieved from the database, when converted to Asia/Manila timezone by the History_Controller, the resulting timestamp SHALL be 8 hours ahead of UTC (or match the expected Asia/Manila offset).

**Validates: Requirements 1.1, 2.1**

### Property 2: Approved Timestamp Format Consistency

*For any* non-null approved_at timestamp processed by the History_Controller, the formatted output SHALL match the pattern `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$` and be parseable back to a valid datetime.

**Validates: Requirements 1.2**

### Property 3: Created Timestamp Format Consistency

*For any* created_at timestamp processed by the History_Controller, the formatted output SHALL match the pattern `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$` and be parseable back to a valid datetime.

**Validates: Requirements 1.3**

### Property 4: All Timestamp Fields Converted

*For any* Stock_Out_Request or Stock_In_Request processed by the History_System, all timestamp fields (created_at, approved_at) SHALL be converted to Asia/Manila timezone.

**Validates: Requirements 2.2**

### Property 5: Null Timestamp Handling

*For any* Stock_Out_Request or Stock_In_Request with null approved_at timestamp, the History_Controller SHALL process the record without throwing exceptions and return null or appropriate value for the approved_at field.

**Validates: Requirements 2.3**

### Property 6: Response Type Consistency

*For any* StockOut or StockIn record returned by the History_Controller, all timestamp fields SHALL be strings (not objects) matching the format "Y-m-d H:i:s".

**Validates: Requirements 2.4**

### Property 7: Frontend Display Preservation

*For any* pre-formatted timestamp string received by the Frontend_Display, the displayed value SHALL exactly match the input string without additional timezone conversion or formatting.

**Validates: Requirements 1.4, 1.5, 3.1**

## Implementation Checklist

- [ ] Modify `HistoryController::viewStockOutDetails()` to format timestamps
- [ ] Modify `HistoryController::viewStockInDetails()` to format timestamps
- [ ] Update History.jsx modal to display pre-formatted timestamps directly
- [ ] Add null handling for approved_at in frontend display
- [ ] Write unit tests for timezone conversion
- [ ] Write unit tests for format consistency
- [ ] Write unit tests for null handling
- [ ] Write integration test for end-to-end flow
- [ ] Test in staging environment
- [ ] Update documentation if needed
- [ ] Deploy to production

## Success Criteria

1. ✅ Timestamps in Stock Out Request Details modal display correct Asia/Manila time
2. ✅ Timestamps in Stock In Request Details modal display correct Asia/Manila time
3. ✅ Format is consistent: "YYYY-MM-DD HH:MM:SS"
4. ✅ Null approved_at values display "Not yet approved" message
5. ✅ No errors occur during timestamp conversion
6. ✅ All tests pass
7. ✅ No regression in other datetime displays in the application

