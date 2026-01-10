# SocialSprout Frontend Development Plan

This guide outlines the steps to build the SocialSprout MVP frontend using the specifications and contracts we've defined.

## 1. Setup & Dependencies

**Goal**: Initialize the Next.js project and link shared types.

- [ ] **Check Types**: Ensure you can import types from `@/lib/contracts` (e.g., `CreateCampaignInput`, `Post`, `StylePreset`).
- [ ] **Install UI Library**: Use a component library (e.g., Shadcn UI, Mantine, or Headless UI) for rapid development.
    - *Needs*: Buttons, Inputs, Selects, Copy-to-clipboard, Toasts (for "Generation Failed" etc.), Dialog/Modal.
- [ ] **State Management**: Install `tanstack/react-query` for API data fetching and caching.

## 2. Component Breakdown

Structure your `components` directory to match the User Flows:

### A. Core / Layout
- **`AppShell`**: Main layout with a simple navigation bar (Logo + "New Campaign" button).
- **`ToastProvider`**: For success/error notifications.

### B. Campaign Wizard (Unified Flow)
*This is the main entry point (Flow 1).*
- **`CampaignForm`**: A comprehensive form handling the "Create & Generate" input.
    - **Sections**:
        1. **Brand Context**: `brandName` (Text), `brandCategory` (Select), `brandDescription` (Textarea).
        2. **Campaign Goals**: `goal` (Text/Textarea), `platforms` (Multi-select/Checkbox).
        3. **Creative Direction**: `style` (Select from `StylePresetEnum`), `budget` (Number Input, e.g., "Max Spend").
        4. **Asset Upload**: `AssetUploader` component.
            - Uses `POST /api/assets/upload` (no `campaignId` needed initially).
            - Returns `assetIds`.
    - **Action**: "Generate Drafts" button.
        - Submits data to `POST /api/campaigns`.
        - Redirects to `/campaigns/[id]` upon success.

### C. Campaign Workspace (Flow 2)
*The view after generation.*
- **`DraftGrid`**: Displays the 3 generated posts.
- **`DraftCard`**:
    - **Visual**: Shows `imageUrl`.
    - **Content**: Shows `caption` (editable textarea).
    - **Actions**:
        - "Approve": Calls `POST /api/posts/:id/approve`.
        - "Reject": Local state update (gray out) or API call if we track rejections.
        - "Schedule": (If approved) DatePicker -> `POST /api/posts/:id/schedule`.
- **`PostStatusBadge`**: Visual indicator (DRAFT, SCHEDULED, POSTED).

## 3. Implementation Steps

1.  **Skeleton**: Build the static `CampaignForm` UI without API calls. Use the Zod schema (`CreateCampaignInputSchema`) for form validation (e.g., with `react-hook-form` + `zodResolver`).
2.  **Asset Handling**: Implement the `AssetUploader`. Mock the upload if the backend isn't ready (return a fake ID), but ensure it matches the `UploadAssetResponse` shape.
3.  **API Integration**: Wire up the "Generate" button.
    - **Tip**: Use `useMutation` from React Query.
    - **Mocking**: If backend API endpoints aren't live, create Next.js Route Handlers (`app/api/campaigns/route.ts`) that import `StubImageProvider` and return the "Success" JSON defined in `docs/contracts.md`.
4.  **Review Logic**: Build the `DraftCard` interactions. Allow editing the caption before clicking "Approve".

## 4. Key Contracts to Reference

- **Inputs**: `lib/contracts.ts` -> `CreateCampaignInput`, `UploadAssetInput`.
- **Entities**: `lib/contracts.ts` -> `Campaign`, `Post` (mock the response shape until backend is ready).
- **Enums**: `lib/contracts.ts` -> `StylePresetEnum` (populate the specific style dropdown options from this).

## 5. Definition of Done
- User can fill out the unified form.
- User clicks "Generate" and sees a loading state.
- User lands on a dashboard showing "Generated" stub images.
- User can Approve/Schedule a post.
