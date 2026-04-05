# Meowji Developer API v1

Connect your application to the Meowji top-up service. This documentation covers the v1 release of our API.

## Authentication
Add your private API key to the request headers. You can find your key in the [Wallet Dashboard](/dashboard/wallet).

**Required Header:**
`X-API-KEY: <your_private_key>`

**Optional Header:**
`X-Idempotency-Key: <unique_key_for_request>`
> Use this to avoid double orders if you need to retry.

## Base URL
`https://meowjiofficial.com/api/v1`

---

## 1. Create Order
Automate top-up orders. Currently supports BGMI.

### Endpoint
`POST /order/create`

### Request Body (JSON)
| Field | Type | Description |
| :--- | :--- | :--- |
| `gameSlug` | String | **Required.** Set to `bgmi-manual`. |
| `itemSlug` | String | **Required.** e.g., `bgmi-60`, `bgmi-325`. |
| `itemName` | String | **Optional.** Name of the item. |
| `playerId` | String | **Required.** Game ID. |
| `phone` | String | **Optional.** Mobile number. |

### Example Request
```bash
curl -X POST https://meowjiofficial.com/api/v1/order/create \
  -H "X-API-KEY: mw_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "gameSlug": "bgmi-manual",
    "itemSlug": "bgmi-60",
    "playerId": "5123456789"
  }'
```

---

## 2. Verify Order
Check order status.

### Endpoint
`POST /order/verify`

### Request Body (JSON)
| Field | Type | Description |
| :--- | :--- | :--- |
| `orderId` | String | **Required.** The Order ID (e.g., API_...). |

### Example Response
```json
{
  "success": true,
  "order": {
    "status": "success",
    "price": 70,
    "date": "2026-03-09T..."
  }
}
```

---

## 3. Check Balance
Check your wallet.

### Endpoint
`GET /user/balance`

---

## Supported Items
### BGMI
- `bgmi-60`: 60 UC
- `bgmi-325`: 325 UC
- `bgmi-660`: 660 UC
- `bgmi-1800`: 1800 UC
- `bgmi-3850`: 3850 UC
- `bgmi-8100`: 8100 UC

---

## Response Codes
| Code | Meaning |
| :--- | :--- |
| `401` | Invalid API Key |
| `403` | Not Authorized |
| `400` | Bad Request |
| `500` | Server Error |
