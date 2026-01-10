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

### 1. Unified Create & Generate
`POST /api/campaigns`

**Request**
```json
{
  "brandName": "Acme Coffee",
  "category": "CAFE_OR_RESTAURANT",
  "brandDescription": "Artisanal coffee roaster.",
  "goal": "Drive traffic to new menu",
  "platforms": ["INSTAGRAM", "FACEBOOK"],
  "generationParams": { 
    "style": "WARM_LIFESTYLE",
    "budget": 500,
    "referenceAssetIds": ["asset_999"],
    "additionalContext": "Focus on the pumpkin spice latte."
  }
}
```

**Response (201 Created)**
```json
{
  "id": "camp_456",
  "brandName": "Acme Coffee",
  "platforms": ["INSTAGRAM", "FACEBOOK"],
  "createdAt": "2023-10-27T10:05:00Z",
  "firstRun": { 
    "runId": "run_789",
    "posts": [
      {
        "id": "post_101",
        "status": "DRAFT",
        "content": { "imageUrl": "...", "caption": "..." },
        "platform": "INSTAGRAM"
      }
      // ...
    ]
  }
}
```

### 2. Upload Asset
`POST /api/assets/upload`

**Request**
```json
{
  "campaignId": "camp_456", 
  "filename": "product-shot.jpg",
  "contentType": "image/jpeg"
}
```
*Note: `campaignId` is optional. If omitted, the asset is orphaned until linked via `referenceAssetIds` in a Campaign Create/Generate call.*

**Response (200 OK)**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/key?signature=...",
  "assetId": "asset_999",
  "key": "camp_456/asset_999.jpg"
}
```

### 3. Background Payment Check
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

### 4. Generate Posts
`POST /api/campaigns/:id/generate`
*(Automatically handles payment deduction)*

**Request**
```json
{
  "style": "WARM_LIFESTYLE",
  "budget": 500,
  "referenceAssetIds": ["asset_999"], 
  "additionalContext": "Focus on the pumpkin spice latte.",
  "providerConfig": {
    "freepik": { "styleId": "digital-art", "imageType": "vector" }
  },
  "payment": {
    "proof": { "transactionHash": "0x123...", "quantity": 500 }
  }
}
```

**Response (200 OK - Generated)**
```json
{
  "runId": "run_789",
  "posts": [ ... ]
}
```

**Response (402 Payment Required)**
```json
{
  "error": "PAYMENT_REQUIRED",
  "details": {
    "amount": 0.5,
    "currency": "USDC",
    "receiverAddress": "0xMerchant...",
    "chainId": 8453
  },
  "quoteId": "quote_abc123"
}
```


### 5. Approve Post
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

### 6. Schedule Post
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

### 7. Get Calendar
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
