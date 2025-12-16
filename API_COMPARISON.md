# API Endpoints Comparison

**Codebase vs Swagger API Documentation**

## ✅ Integrated Endpoints (20 total)

### Files
- ✅ `POST /v1/files/upload`

### Authentication (11)
- ✅ `POST /v1/auth/customer/email/register`
- ✅ `POST /v1/auth/email/confirm` *(updated)*
- ✅ `POST /v1/auth/email/confirm/new` *(NEW - resend confirmation email)*
- ✅ `POST /v1/auth/forgot/password` *(updated)*
- ✅ `POST /v1/auth/reset/password` *(updated)*
- ✅ `POST /v1/auth/customer/email/login`
- ✅ `POST /v1/auth/customer/refresh` *(NEW - automatic token refresh)*
- ✅ `GET /v1/auth/customer/me`
- ✅ `PATCH /v1/auth/customer/me`
- ✅ `DELETE /v1/auth/customer/me`
- ✅ `POST /v1/auth/customer/logout`

### Bookings (4)
- ✅ `GET /v1/bookings`
- ✅ `POST /v1/bookings`
- ✅ `GET /v1/bookings/recent`
- ✅ `POST /v1/bookings/calculate-distance`

### Test Centers & Add-ons (2)
- ✅ `GET /v1/drive-test-centers`
- ✅ `GET /v1/addons`

### Refunds (1)
- ✅ `POST /v1/refund-requests`

### Coupons (1)
- ✅ `POST /v1/coupons/verify`

### Address Search (1)
- ✅ `POST /v1/address-search` *(correctly implemented)*

## ⚠️ Path Discrepancies

*No remaining path discrepancies - All endpoints match Swagger docs!* ✅

## ❌ Missing Customer Endpoints

*Available in Swagger but not integrated:*

### Refunds
- ❌ `GET /v1/refund-requests` - Get user's refund requests
- ❌ `GET /v1/refund-requests/{id}` - Get specific refund request

### Bookings
- ❌ `GET /v1/bookings/{id}` - Get specific booking by ID *(listed in our docs but not confirmed)*

## 📝 Recommendations

### High Priority
1. ~~**Fix email confirm path**~~ ✅ **COMPLETED** - Updated to `/v1/auth/email/confirm`
2. ~~**Fix password reset paths**~~ ✅ **COMPLETED** - Updated to `/v1/auth/forgot/password` and `/v1/auth/reset/password`
3. ~~**Address search endpoint**~~ ✅ **VERIFIED** - Already using `POST /v1/address-search` correctly
4. ~~**Integrate refresh token**~~ ✅ **COMPLETED** - `POST /v1/auth/customer/refresh` with automatic token refresh interceptor

### Medium Priority
5. **Refund requests view** - `GET /v1/refund-requests` to show refund history in dashboard
6. ~~**Resend confirmation**~~ ✅ **COMPLETED** - `POST /v1/auth/email/confirm/new` with UI button on booking-details page

### Notes
- ✅ Email confirmation endpoint updated to match Swagger docs
- ✅ Password reset endpoints updated to match Swagger docs
- ✅ Address search endpoint verified - already correctly implemented
- ✅ Refresh token endpoint integrated with automatic retry logic in API interceptor
- ✅ **All high-priority customer endpoints now integrated!**
- Individual booking GET (`/v1/bookings/{id}`) may be accessible via the list endpoint
