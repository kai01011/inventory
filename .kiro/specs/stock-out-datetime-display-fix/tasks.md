# Implementation Plan: Stock Out DateTime Display Fix

## Overview

This implementation plan addresses the datetime display issue in the Stock Out Request Details and Stock In Request Details history modals. The solution involves modifying the backend controller to properly convert timestamps to Asia/Manila timezone and format them as strings, then updating the frontend to display these pre-formatted timestamps without additional conversion.

## Tasks

- [ ] 1. Modify HistoryController backend timezone handling
  - [ ] 1.1 Update viewStockOutDetails() method to format timestamps
    - Convert `created_at` to Asia/Manila timezone using Carbon's `timezone()` method
    - Format `created_at` as "Y-m-d H:i:s" string
    - Convert `approved_at` to Asia/Manila timezone (handle null case)
    - Format `approved_at` as "Y-m-d H:i:s" string
    - Return formatted timestamps in JSON response
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 1.2 Write property test for timezone conversion correctness
    - **Property 1: Timezone Conversion Correctness**
    - **Validates: Requirements 1.1, 2.1**
    - Create test data with known UTC timestamps
    - Verify converted timestamps are exactly 8 hours ahead of UTC
    - Test with various times across different dates

  - [ ]* 1.3 Write unit tests for timestamp formatting
    - Test that `created_at` matches format pattern `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$`
    - Test that `approved_at` matches format pattern when not null
    - Test that null `approved_at` is handled without errors
    - Test that formatted strings are parseable back to valid datetime
    - _Requirements: 1.2, 2.3_

- [ ] 2. Update viewStockInDetails() method with identical timezone handling
  - [ ] 2.1 Implement timezone conversion for StockIn timestamps
    - Convert `created_at` to Asia/Manila timezone
    - Format `created_at` as "Y-m-d H:i:s" string
    - Convert `approved_at` to Asia/Manila timezone (handle null case)
    - Format `approved_at` as "Y-m-d H:i:s" string
    - Return formatted timestamps in JSON response
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test for StockIn timezone conversion
    - **Property 1: Timezone Conversion Correctness**
    - **Validates: Requirements 1.1, 2.1**
    - Verify StockIn timestamps are properly converted to Asia/Manila
    - Ensure consistency with StockOut conversion logic

  - [ ]* 2.3 Write unit tests for null handling
    - **Property 5: Null Timestamp Handling**
    - **Validates: Requirements 2.3**
    - Create StockIn with null `approved_at`
    - Verify no exceptions are thrown
    - Verify response contains null or empty value for `approved_at`

- [ ] 3. Checkpoint - Verify backend changes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Update frontend History.jsx to display pre-formatted timestamps
  - [ ] 4.1 Remove formatDateTimeSingleLine() from Request Date display
    - Replace formatted display with direct string rendering
    - Update Request Date display to use: `{selectedDetails.stockOut?.created_at}`
    - Update for both stock-in and stock-out branches
    - Ensure optional chaining handles undefined values
    - _Requirements: 1.3, 1.4, 1.5, 3.1_

  - [ ] 4.2 Update Approved/Rejected Date display with null handling
    - Replace formatted display with direct string rendering
    - Display `{selectedDetails.stockOut?.approved_at || 'Not yet approved'}`
    - Update for both stock-in and stock-out branches
    - Add fallback message "Not yet approved" for null values
    - Ensure consistent styling with other fields
    - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.3 Write component tests for timestamp display
    - **Property 7: Frontend Display Preservation**
    - **Validates: Requirements 1.4, 1.5, 3.1**
    - Mock API response with formatted timestamp strings
    - Verify timestamps display exactly as received (no conversion)
    - Test with various datetime values
    - Verify null `approved_at` shows "Not yet approved" message

- [ ] 5. Integration testing and verification
  - [ ] 5.1 Create integration test for end-to-end flow
    - Create test StockOut request with known timestamp
    - Approve request with known timestamp
    - Call viewStockOutDetails() API
    - Verify response contains correctly formatted Asia/Manila timestamps
    - Verify timestamps match expected "Y-m-d H:i:s" format
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4_

  - [ ]* 5.2 Write property test for response type consistency
    - **Property 6: Response Type Consistency**
    - **Validates: Requirements 2.4**
    - Verify all timestamp fields in response are strings, not objects
    - Test with multiple records
    - Ensure consistency across StockIn and StockOut responses

- [ ] 6. Final checkpoint and documentation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The implementation uses PHP/Laravel for backend (HistoryController) and React/JSX for frontend (History.jsx)
- All timestamp conversions use Carbon's `timezone('Asia/Manila')` method
- Format specification is "Y-m-d H:i:s" (e.g., "2025-01-15 14:30:45")
- Null handling is critical for `approved_at` field which may be null for pending requests
- Frontend displays pre-formatted strings directly without additional conversion
- The fix applies to both StockOut and StockIn request details modals

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1", "4.2"] },
    { "id": 3, "tasks": ["4.3", "5.1", "5.2"] }
  ]
}
```
