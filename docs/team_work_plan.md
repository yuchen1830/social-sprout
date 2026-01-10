# SocialSprout Team Work Plan (2-Person Split)

This plan divides the implementation effort between two developers: **Frontend Lead** and **Backend Lead**.
**Context**: We are building the MVP based on `Unified Create & Generate` flow.
**Exclusions**: Wallet connection and real automated payments (Freepik/x402) are out of scope for now. We will use mocks/stubs for these.

---

## Developer A: Frontend Lead (UI & Client State)
**Focus**: Building a responsive, interactive UI that matches the Contracts.

### 1. Setup & Foundations
- [ ] Initialize CSS variables/theme (Shadcn UI / Tailwind).
- [ ] Set up React Query client for data fetching.
- [ ] Create shared types alias pointing to `lib/contracts.ts`.

### 2. Feature: Unified Campaign Wizard (The Priority)
- **Component**: `UnifiedCampaignForm`
- **Responsibilities**:
    - Build the multi-section form (Brand, Campaign, Style, Budget).
    - **Asset Upload UI**: Build a `FileUploader` that calls `POST /api/assets/upload` (expecting a mocked URL return for now) and stores the returned ID.
    - **Validation**: Hook up `zodResolver` with `CreateCampaignInputSchema`.
    - **Submission**: Call `POST /api/campaigns`. Handle "Loading" state (generation takes time).
- **Deliverable**: A working form that consoles log the success response.

### 3. Feature: Campaign Dashboard & Review
- **Component**: `CampaignView` (Dynamic Route: `/campaigns/[id]`)
- **Responsibilities**:
    - Fetch campaign data (`useQuery`).
    - **Draft Grid**: Render the list of generated posts.
    - **Post Card**:
        - Display Image (mocked URL).
        - Editable Textarea for Caption.
        - "Approve" button (Optimistic UI update).
        - "Schedule" DatePicker.
- **Deliverable**: A dashboard where users can see and click "Approve" on drafts.

---

## Developer B: Backend Lead (API & Data)
**Focus**: API Route handlers, Database integration (MongoDB), and Provider coordination.

### 1. Infrastructure & DB
- [ ] Set up MongoDB connection (Mongoose or native Mongo driver).
    - *Note: `package.json` suggests MongoDB Hackathon.*
- [ ] Create DB Models matched to `CampaignSchema`, `AssetSchema`, `PostSchema`.
- [ ] Implement `AssetService`:
    - `POST /api/assets/upload`: Return a presigned URL (or a dummy URL for local dev). Store `Asset` entry in DB.

### 2. Feature: Campaign API & Generation Orchestration
- **Endpoint**: `POST /api/campaigns`
- **Responsibilities**:
    - Validate Body with `CreateCampaignInputSchema`.
    - **Transaction**:
        1. Create `Campaign` document.
        2. Update `Assets` with new `campaignId` (if applicable).
        3. **Trigger Generation**:
            - Call the `StubImageProvider` (in `lib/providers/stub.ts`).
            - Create `Post` documents (Status: DRAFT) from the results.
    - Return the extended JSON response including `firstRun`.

### 3. Feature: Post Management APIs
- **Endpoints**:
    - `POST /api/posts/:id/approve`: Update status in DB.
    - `POST /api/posts/:id/schedule`: Update `scheduledTime` in DB.
    - `GET /api/calendar`: Aggregate scheduled posts.
- **Responsibilities**:
    - Ensure simple CRUD operations working against MongoDB.

### 4. Clean Stubs
- Ensure `lib/providers/stub.ts` returns realistic-looking data (e.g., Unsplash placeholder URLs) so the Frontend Lead has something nice to display.

---

## Integration Point (The "Handshake")
**When**: Once `POST /api/campaigns` is deployed/merged.
**Action**: Developer A points the `UnifiedCampaignForm` to the real endpoint.
**Success Criteria**:
- Submitting the form writes to MongoDB.
- Redirects to Dashboard.
- Dashboard fetches and displays the stubbed images served by Developer B's API.
