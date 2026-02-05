# Premium Partner Dashboard - Design Documentation

## Overview

The Partner Dashboard has been completely redesigned to premium marketplace-grade quality with a polished UI that matches top-tier SaaS platforms.

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Styling**: TailwindCSS 4.1.18
- **Icons**: lucide-react 0.562.0
- **Charts**: recharts 3.6.0
- **Tables**: @tanstack/react-table 8.21.3
- **Forms**: react-hook-form 7.71.1 + zod 3.25.76

## Design System

### Design Tokens

All design tokens are centralized in [src/ui/partner-tokens.ts](../src/ui/partner-tokens.ts):

**Layout**
- Max width: `1280px`
- Grid: 12-column responsive grid
- Spacing scale: 8px, 12px, 16px, 24px, 32px, 40px, 48px

**Typography**
- H1: 28px / 600 weight
- H2: 20px / 600 weight
- H3: 16px / 600 weight
- Body: 14px / 400 weight
- Small: 12px / 400 weight

**Colors**
- Primary: `#10B981` (Emerald-600)
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Text Primary: `#111827` (Gray-900)
- Text Secondary: `#6B7280` (Gray-500)
- Background: `#F9FAFB` (Gray-50)

**Borders & Shadows**
- Border radius: 8px, 12px, 16px, 20px
- Borders: `#E5E7EB` (Gray-200)
- Shadows: Subtle elevation system (sm, md, lg, xl)

**Transitions**
- Fast: 150ms ease
- Base: 200ms ease
- Slow: 300ms ease

## Architecture

### Component Structure

```
src/components/partner/
├── PartnerHeader.tsx          # Top app header with nav, search, notifications
├── KpiCard.tsx                # KPI metric card with sparkline
├── ActionCenter.tsx           # Onboarding progress checklist
├── BookingsTable.tsx          # Full-featured bookings table
├── ListingCard.tsx            # Listing preview card
├── InboxPreview.tsx           # Message inbox preview
├── PayoutCard.tsx             # Wallet/payout summary
└── SkeletonCard.tsx           # Loading skeletons

app/partner/dashboard/
└── page.tsx                   # Main dashboard page
```

### Layout Hierarchy

```
PartnerHeader (sticky)
└── Dashboard Page (max-w-1280px)
    ├── Page Header
    │   ├── Title + Subtitle
    │   └── CTAs (Create Listing, View Calendar, Invite Staff)
    │
    ├── KPI Row (4 cards)
    │   ├── Upcoming Bookings
    │   ├── Revenue (30d)
    │   ├── Occupancy (90d)
    │   └── Response Time
    │
    └── Main Grid (12-col)
        ├── Left Column (8-col)
        │   ├── Setup Progress (Action Center)
        │   ├── Recent Bookings (Table)
        │   └── Performance Chart
        │
        └── Right Sidebar (4-col)
            ├── Your Listings (Card Grid)
            ├── Messages (Inbox Preview)
            ├── Payouts (Wallet Card)
            └── Verification (KYC Status)
```

## Key Features

### 1. Premium App Header
- Brand logo + navigation tabs
- Global search bar (bookings, listings)
- Notifications bell with unread badge
- Avatar dropdown with:
  - Switch to Traveler
  - Account Settings
  - Logout

### 2. KPI Cards
- Large, readable metrics
- Trend indicators (up/down with icons)
- Mini sparkline charts (recharts)
- Hover states with shadow elevation
- Clickable for drill-down

### 3. Setup Progress (Action Center)
- Visual progress bar (0-100%)
- Task checklist with badges (Required/Recommended)
- Hover states reveal action buttons
- Check icons for completed tasks
- Smooth gradient progress bar

### 4. Bookings Table
- Status filter chips (All, Requested, Confirmed, Completed, Cancelled)
- Color-coded status badges
- Hover row highlighting
- Empty state with illustration + CTA
- Responsive table scroll

### 5. Performance Chart
- 30-day revenue line chart
- Proper axes, grid, tooltips
- Insight callouts below chart
- Emerald gradient stroke

### 6. Listings Preview
- Card grid with image placeholders
- Status badges (Draft, Published, Paused)
- Quick actions (Edit, Publish)
- Hover shadow elevation

### 7. Messages Inbox
- Avatar circles with initials
- Unread count badges
- Message preview truncation
- Empty state with CTA

### 8. Payouts Card
- Large balance display
- Next payout date with calendar icon
- Empty state for no balance
- Clear CTA buttons

### 9. Verification Status
- Color-coded warning box
- Shield icon
- Clear verification CTA
- Status: Pending/Verified/Rejected

## Responsive Design

### Desktop (≥1024px)
- 12-column grid (8+4 split)
- Full navigation in header
- All components visible

### Tablet (768px - 1023px)
- Stacked sections
- Simplified navigation
- Card grid adjusts to 2 columns

### Mobile (<768px)
- Single column layout
- KPI cards in carousel
- Hamburger menu
- Stacked cards

## Empty States

All components include proper empty states:

**Bookings Table**
- Calendar icon
- "No bookings yet" message
- "Create Listing" CTA button

**Inbox**
- Message icon
- "No messages yet" subtitle
- "Send a message" CTA

**Payouts**
- Wallet icon
- "No balance yet" message
- "Set payout method" CTA

## Loading States

Skeleton components for all major sections:
- `SkeletonKpi`: KPI card placeholder
- `SkeletonCard`: Generic card placeholder
- `SkeletonTable`: Table rows placeholder

Loading duration: 600ms for perceived performance

## Micro-interactions

- **Hover states**: All cards, buttons, rows have hover effects
- **Transitions**: 200ms ease for smooth interactions
- **Shadows**: Elevation changes on hover
- **Button loading**: Disabled state during actions
- **Keyboard navigation**: Full ARIA support

## Color-Coded Status System

### Booking Status
- **Requested**: Blue (`bg-blue-50 text-blue-700`)
- **Confirmed**: Emerald (`bg-emerald-50 text-emerald-700`)
- **Completed**: Gray (`bg-gray-100 text-gray-700`)
- **Cancelled**: Red (`bg-red-50 text-red-700`)

### Listing Status
- **Draft**: Gray (`bg-gray-100 text-gray-700`)
- **Published**: Emerald (`bg-emerald-50 text-emerald-700`)
- **Paused**: Amber (`bg-amber-50 text-amber-700`)

### Task Priority
- **Required**: Amber (`bg-amber-50 text-amber-700`)
- **Recommended**: Gray (`bg-gray-100 text-gray-600`)

### KYC Status
- **Pending**: Amber (warning box)
- **Verified**: Emerald (success box)
- **Rejected**: Red (error box)

## Component Props API

### KpiCard
```typescript
{
  label: string;           // KPI title
  value: string;           // Main metric value
  hint?: string;           // Subtitle text
  trend?: {                // Trend indicator
    delta: string;         // e.g., "+12%"
    up?: boolean;          // true = up, false = down
  };
  series?: number[];       // Sparkline data points
  onClick?: () => void;    // Click handler
}
```

### ActionCenter
```typescript
{
  tasks?: Array<{
    id: string;
    title: string;
    desc?: string;
    required?: boolean;
    done?: boolean;
  }>;
  progress?: number;       // 0-100
  loading?: boolean;
}
```

### BookingsTable
```typescript
{
  bookings?: Array<{
    id: string;
    guest: string;
    listing: string;
    dates: string;
    status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
    total: string;
  }>;
}
```

## Performance Optimizations

1. **Lazy loading**: Charts load after 600ms
2. **Skeleton screens**: Prevent layout shift
3. **Optimized re-renders**: useMemo for tables and charts
4. **Image optimization**: Placeholder gradients
5. **CSS transitions**: Hardware-accelerated transforms

## Accessibility

- ✅ Semantic HTML5 elements
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus indicators
- ✅ Color contrast WCAG AA compliant
- ✅ Screen reader support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

1. **Sidebar Navigation**: Full vertical nav with icons
2. **Calendar View**: Booking calendar with date picker
3. **Listing Wizard**: Multi-step listing creation flow
4. **Advanced Filters**: Date range, price range, location
5. **Export Functions**: CSV/PDF export for reports
6. **Real-time Updates**: WebSocket for live bookings
7. **Mobile App**: React Native companion app
8. **Dark Mode**: System-preference aware theme

## Testing Checklist

- [x] Desktop layout (1280px+)
- [x] Tablet layout (768-1023px)
- [x] Mobile layout (<768px)
- [x] Empty states render correctly
- [x] Loading skeletons display
- [x] Hover states work
- [x] Button states (default, hover, disabled)
- [x] Status badges color-coded
- [x] Charts render with data
- [x] Navigation works
- [x] No console errors

## Screenshots

Visit `http://localhost:3000/partner/dashboard` to see the live premium dashboard.

## Support

For design questions or component requests, contact the frontend team.

---

**Last Updated**: January 19, 2026  
**Version**: 2.0.0 (Premium Redesign)
