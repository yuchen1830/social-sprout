# API Contracts

## Shared Enums

### Category
- `LIFESTYLE_PRODUCT`
- `CONSUMER_PRODUCT`
- `CAFE_OR_RESTAURANT`
- `SERVICE`

### StylePreset
- `UGC`
- `CLEAN_STUDIO`
- `WARM_LIFESTYLE`
- `EDITORIAL`
- `MINIMAL`
- `DOCUMENTARY`

### Platform
- `INSTAGRAM`
- `FACEBOOK`
- `PINTEREST` (Future)

### PostStatus
- `DRAFT`
- `APPROVED`
- `SCHEDULED`
- `POSTED`
- `FAILED`

---

## API Endpoints

### 1. Create Brand
`POST /api/brands`

**Request**
```json
{
  "name": "Acme Coffee",
  "category": "CAFE_OR_RESTAURANT",
  "style": "WARM_LIFESTYLE",
  "description": "Artisanal coffee roaster in downtown."
}
```

**Response (201 Created)**
```json
{
  "id": "brand_123",
  "name": "Acme Coffee",
  "category": "CAFE_OR_RESTAURANT",
  "style": "WARM_LIFESTYLE",
  "description": "Artisanal coffee roaster in downtown.",
  "createdAt": "2023-10-27T10:00:00Z"
}
```

### 2. Create Campaign
`POST /api/campaigns`

**Request**
```json
{
  "brandId": "brand_123",
  "name": "Autumn Launch",
  "goal": "Drive traffic to new menu",
  "platforms": ["INSTAGRAM", "FACEBOOK"]
}
```

**Response (201 Created)**
```json
{
  "id": "camp_456",
  "brandId": "brand_123",
  "name": "Autumn Launch",
  "platforms": ["INSTAGRAM", "FACEBOOK"],
  "createdAt": "2023-10-27T10:05:00Z"
}
```

### 3. Upload Asset
`POST /api/assets/upload`

**Request**
```json
{
  "brandId": "brand_123",
  "filename": "product-shot.jpg",
  "contentType": "image/jpeg"
}
```

**Response (200 OK)**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/key?signature=...",
  "assetId": "asset_999",
  "key": "brand_123/asset_999.jpg"
}
```

### 4. Background Payment Check
`POST /api/payment/checkout`
*(Internal Use: Triggered automatically during generation if needed, or for top-ups)*

**Request**
```json
{
  "campaignId": "camp_456"
}
```

**Response (200 OK)**
```json
{
  "checkoutUrl": "https://x402.com/checkout?token=...",
  "transactionId": "tx_888"
}
```

### 5. Generate Posts
`POST /api/campaigns/:id/generate`
*(Automatically handles payment deduction)*

**Request**
```json
{
  "style": "WARM_LIFESTYLE",
  "referenceAssetIds": ["asset_999"], 
  "additionalContext": "Focus on the pumpkin spice latte."
}
```

**Response (200 OK)**
```json
{
  "runId": "run_789",
  "posts": [
    {
      "id": "post_101",
      "status": "DRAFT",
      "content": {
        "imageUrl": "https://stub-provider.com/img1.jpg",
        "caption": "Cozy autumn vibes with our PSL! 🍂☕ #AcmeCoffee"
      },
      "platform": "INSTAGRAM"
    },
    {
      "id": "post_102",
      "status": "DRAFT",
      "content": {
        "imageUrl": "https://stub-provider.com/img2.jpg",
        "caption": "Get your pumpkin fix today! Open till 8pm."
      },
      "platform": "FACEBOOK"
    }
    // ... total 3 drafts typically, can be mixed platforms or multi-platform
  ]
}
```

### 6. Approve Post
`POST /api/posts/:id/approve`

**Request**
```json
{
  "editedCaption": "Optional updated caption text if user edited it."
}
```

**Response (200 OK)**
```json
{
  "id": "post_101",
  "status": "APPROVED",
  "content": {
    "imageUrl": "https://stub-provider.com/img1.jpg",
    "caption": "Optional updated caption text if user edited it."
  },
  "updatedAt": "2023-10-27T10:10:00Z"
}
```

### 7. Schedule Post
`POST /api/posts/:id/schedule`

**Request**
```json
{
  "scheduledTime": "2023-11-01T09:00:00Z"
}
```

**Response (200 OK)**
```json
{
  "id": "post_101",
  "status": "SCHEDULED",
  "scheduledTime": "2023-11-01T09:00:00Z"
}
```

### 8. Get Calendar
`GET /api/calendar?from=2023-11-01&to=2023-11-30`

**Response (200 OK)**
```json
{
  "events": [
    {
      "id": "post_101",
      "title": "Autumn Launch - Post 1",
      "start": "2023-11-01T09:00:00Z",
      "status": "SCHEDULED",
      "thumbnail": "https://stub-provider.com/img1.jpg",
      "platform": "INSTAGRAM"
    }
  ]
}
```
