# 🚨 DIRECT DATABASE FIX NEEDED

## Current Problem:
**Fux After Party** event has:
- `"min_age": null` ❌ (causes "undefined+ years")
- `"dress_code": "No specific dress code"` ❌ (causes "undefined")

## ✅ IMMEDIATE FIX:

### Option 1: Admin Dashboard (FASTEST)
1. Go to: https://afterstateevents.vercel.app/admin
2. Login: admin@studentevents.com / admin123
3. Go to **Events** tab
4. Click **"Edit"** on **"Fux After Party"**
5. Set:
   - **Minimum Age**: "18"
   - **Dress Code**: "Studio 54"
6. Click **"Save Changes"**

### Option 2: Direct SQL (If you have Supabase access)
```sql
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';
```

## 🎯 Expected Result After Fix:
```json
{
  "min_age": 18,
  "dress_code": "Studio 54"
}
```

## ✅ Verification:
After fixing, the main page will show:
- "18+ years" instead of "undefined+ years"
- "Studio 54" instead of "undefined"

**This is the ONLY remaining issue - the database needs to be updated!**
