# Partner Dashboard - Quick Start Guide

## 🚀 Getting Started

1. **Navigate to Partner Dashboard**
   ```
   http://localhost:3000/partner/dashboard
   ```

2. **Login with HQ Account**
   - Email: `info@zenivatravel.com`
   - This account has full partner access

## 📦 What's New

### Premium UI Components (All English)
- ✅ **PartnerHeader**: Top navigation with search, notifications, avatar dropdown
- ✅ **KpiCard**: Metric cards with trend indicators and sparklines
- ✅ **ActionCenter**: Onboarding progress with checklist
- ✅ **BookingsTable**: Full-featured table with filters and empty states
- ✅ **ListingCard**: Property preview cards with status badges
- ✅ **InboxPreview**: Message preview with unread badges
- ✅ **PayoutCard**: Wallet summary with next payout info
- ✅ **SkeletonCard**: Loading placeholders

### Design System
- ✅ **Design Tokens**: `src/ui/partner-tokens.ts`
- ✅ **Consistent Spacing**: 8px base scale
- ✅ **Color System**: Emerald primary, proper status colors
- ✅ **Typography Scale**: H1 (28px) → Body (14px) → Small (12px)
- ✅ **Border Radius**: 8px, 12px, 16px, 20px
- ✅ **Shadows**: Subtle elevation on hover

## 🎨 Design Principles

1. **No Plain Boxes**: All cards have borders, shadows, hover states
2. **Proper Hierarchy**: Clear visual weight through size, color, spacing
3. **Empty States**: Every empty section has icon + message + CTA
4. **Loading States**: Skeleton screens for smooth transitions
5. **Status Colors**: Color-coded badges (blue, emerald, amber, red, gray)
6. **Micro-interactions**: Hover effects, transitions (200ms)

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+ (12-col grid, 8+4 split)
- **Tablet**: 768px - 1023px (stacked sections)
- **Mobile**: <768px (single column)

## 🎯 Key Features

### Top Header
- Brand logo + nav tabs (Dashboard, Listings, Calendar, Bookings, Inbox)
- Search bar: "Search bookings, listings..."
- Notifications bell (with red dot indicator)
- Avatar dropdown:
  - Switch to Traveler
  - Account Settings
  - Logout

### Dashboard Sections

**Page Header**
- Title: "Dashboard"
- Subtitle: "Manage listings, bookings, payouts, and guest messages"
- CTAs: Create Listing (primary), View Calendar, Invite Staff

**KPI Row** (4 cards)
1. Upcoming bookings (0)
2. Revenue (30d) ($0)
3. Occupancy (90d) (0%)
4. Response time (—)

**Main Content** (Left 8-col)
1. **Setup Progress**
   - Progress bar: 35%
   - 4 tasks with Required/Recommended badges
   - Hover reveals action buttons

2. **Recent Bookings**
   - Filter chips: All, Requested, Confirmed, Completed, Cancelled
   - Empty state: "No bookings yet" + Create Listing CTA

3. **Performance Chart**
   - 30-day revenue line chart (recharts)
   - Insight callout below chart

**Sidebar** (Right 4-col)
1. **Your Listings**
   - 3 listing cards: Cozy Beach House (Draft), Luxury Yacht (Published), Mountain Villa (Paused)
   - Quick actions: Edit, Publish

2. **Messages**
   - Empty state: "No messages yet" + Send CTA

3. **Payouts**
   - Balance: $0
   - Empty state: "Set payout method" CTA

4. **Verification**
   - Status: Pending (amber warning box)
   - CTA: "Complete Verification"

## 🛠️ Files Modified

### New Files
```
src/ui/partner-tokens.ts                    # Design system tokens
src/components/partner/PartnerHeader.tsx    # Top app header
src/components/partner/SkeletonCard.tsx     # Loading skeletons
docs/partner-dashboard-premium.md           # Full documentation
docs/partner-dashboard-quickstart.md        # This file
```

### Updated Files
```
app/partner/dashboard/page.tsx              # Main dashboard (complete redesign)
src/components/partner/KpiCard.tsx          # Premium metric card
src/components/partner/ActionCenter.tsx     # Progress checklist
src/components/partner/BookingsTable.tsx    # Full-featured table
src/components/partner/ListingCard.tsx      # Property card
src/components/partner/InboxPreview.tsx     # Message preview
src/components/partner/PayoutCard.tsx       # Wallet card
```

## 🎨 Using Design Tokens

```typescript
import { PARTNER_TOKENS, PARTNER_CLASSES } from '@/src/ui/partner-tokens';

// Spacing
<div className="p-6"> // 24px padding

// Card style
<div className={PARTNER_CLASSES.card}>

// Button styles
<button className={PARTNER_CLASSES.button.primary}>

// Status badges
<span className={PARTNER_CLASSES.badge.success}>
```

## 🐛 Known Issues

1. **Recharts Warning**: "width(-1) and height(-1) of chart..." - Non-blocking, chart renders correctly
2. **Middleware Deprecation**: "middleware file convention is deprecated" - Next.js warning, non-blocking

## ✅ Checklist

Before deploying:
- [x] All text is in English
- [x] Design tokens defined
- [x] Components are reusable
- [x] Empty states implemented
- [x] Loading skeletons added
- [x] Hover states work
- [x] Responsive layout tested
- [x] No console errors
- [x] Server runs on port 3000
- [x] Partner access works for info@zenivatravel.com

## 🚀 Next Steps

Want to add more premium features? Consider:

1. **Full Sidebar Navigation**
   - Vertical nav with icons
   - Active state indicators
   - Collapsible sections

2. **Calendar View**
   - Monthly/weekly booking calendar
   - Drag-and-drop availability
   - Color-coded bookings

3. **Listing Creation Wizard**
   - Multi-step form (5-7 steps)
   - Photo uploader with drag-and-drop
   - Preview before publish

4. **Advanced Analytics**
   - More charts (bar, pie, area)
   - Date range filters
   - Export to CSV/PDF

5. **Real-time Features**
   - WebSocket for live booking updates
   - Instant message notifications
   - Online status indicators

## 📚 Documentation

- **Full Docs**: [partner-dashboard-premium.md](./partner-dashboard-premium.md)
- **Design Tokens**: [src/ui/partner-tokens.ts](../src/ui/partner-tokens.ts)
- **Components**: [src/components/partner/](../src/components/partner/)

## 💡 Tips

1. **Consistent Spacing**: Always use tokens (lg = 24px, xl = 32px)
2. **Hover Effects**: Add `hover:shadow-md transition-shadow duration-200`
3. **Status Colors**: Use predefined badge classes from tokens
4. **Empty States**: Always include icon + message + CTA
5. **Loading**: Show skeletons for 600ms minimum

---

**Dashboard URL**: http://localhost:3000/partner/dashboard  
**Server Port**: 3000  
**Framework**: Next.js 16.1.1 (Turbopack)
