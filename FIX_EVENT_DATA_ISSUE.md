# 🔧 CRITICAL FIX: Event Data Issue

## 🚨 Problem Identified

The events in the database have:
- `"min_age": null` 
- `"dress_code": "No specific dress code"`

This causes the frontend to display "undefined+" for age and "undefined" for dress code.

## 🎯 Root Cause

The events were created without proper `min_age` and `dress_code` values in the database.

## ✅ Solution

### Option 1: Update Database Directly (RECOMMENDED)

Run this SQL script in your Supabase database:

```sql
-- Update Fux After Party event
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';

-- Update AFTERSTATE x OPIUM event  
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Smart Casual'
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9';
```

### Option 2: Use Admin Dashboard

1. Go to https://afterstateevents.vercel.app/admin
2. Login with admin@studentevents.com / admin123
3. Go to Events tab
4. Edit each event:
   - Set Minimum Age to "18"
   - Set Dress Code to "Studio 54" (for Fux After Party) and "Smart Casual" (for AFTERSTATE x OPIUM)
5. Save changes

### Option 3: API Update (If you have admin token)

```javascript
// Update via API
const response = await fetch('https://studentevents-production.up.railway.app/api/events/778b1766-4842-48c4-a423-74b9faa27891', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
    },
    body: JSON.stringify({
        minAge: 18,
        dressCode: 'Studio 54'
    })
});
```

## 🧪 Verification

After updating, check the API response:

```bash
curl -s "https://studentevents-production.up.railway.app/api/events"
```

Should show:
```json
{
    "min_age": 18,
    "dress_code": "Studio 54"
}
```

Instead of:
```json
{
    "min_age": null,
    "dress_code": "No specific dress code"
}
```

## 🎯 Expected Result

After fixing the database:
- Main page will show "18+ years" instead of "undefined+ years"
- Main page will show "Studio 54" instead of "undefined"
- Event details page will show proper information
- No more "undefined" values anywhere

## 🚀 Status

**This is the final fix needed to resolve the "undefined" display issues!**

The frontend code is already fixed to handle both snake_case and camelCase fields, but the database needs to be updated with proper values.
