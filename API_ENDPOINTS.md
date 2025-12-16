# API Endpoints

**Base URL:** `https://api-dev.elanroadtestrental.ca/v1`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/customer/email/register` | Register new user |
| POST | `/auth/customer/email/confirm` | Confirm email with hash |
| POST | `/auth/customer/email/login` | Login with credentials |
| GET | `/auth/customer/me` | Get current user |
| PATCH | `/auth/customer/me` | Update user profile |
| POST | `/auth/customer/logout` | Logout user |
| DELETE | `/auth/customer/me` | Delete account |
| POST | `/auth/customer/forgot/password` | Request password reset |
| POST | `/auth/customer/reset/password` | Reset password with hash |

## Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drive-test-centers` | Get all test centers |
| GET | `/drive-test-centers/:id` | Get test center by ID |
| GET | `/addons` | Get all add-ons |
| GET | `/addons/:id` | Get add-on by ID |
| POST | `/coupons/verify` | Verify coupon code |
| GET | `/addresses/search?query=...` | Search addresses |
| POST | `/calculate-distance` | Calculate pickup distance/price |
| GET | `/bookings` | Get user's bookings |
| GET | `/bookings/recent` | Get recent bookings |
| GET | `/bookings/:id` | Get booking by ID |
| POST | `/bookings` | Create new booking |
| POST | `/refund-requests` | Create refund request |

## File Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files/upload` | Upload file to S3 |
