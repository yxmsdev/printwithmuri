# TODO - Slicing Performance Improvements

## Upload Progress Tracking + Server Timing Logs
**Priority**: High
**Status**: Not Started
**Estimated Time**: 1-2 hours

### Problem
The 31MB STL file upload causes 10-30 seconds of delay before slicing even starts. Users see no feedback during this time and think the app is frozen. The server-side slicing itself only takes ~15 seconds, but the upload time is hidden.

### Root Cause
- Server logs only show time AFTER file is received (after `await request.formData()`)
- Upload progress is invisible to the user
- Total user wait time = Upload time (10-30s) + Slicing time (15s) = 25-45 seconds

### Solution: Two-Phase Approach

#### Phase 1: Server-Side Timing Logs
**File**: `/app/api/slicer/slice/route.ts`

Add timestamps to measure:
- When request arrives
- When formData parsing completes (upload done)
- Upload duration calculation

This confirms the upload bottleneck hypothesis.

#### Phase 2: Client-Side Upload Progress Tracking
**File**: `/components/configurator/ConfiguratorSidebar.tsx`
**Figma Reference**: https://www.figma.com/design/K1HMyfdabrnxLAPn9oVHfD/Blanko-By-Muri?node-id=953-2208

Replace `fetch()` with `XMLHttpRequest` to get progress events.

**UI Design (from Figma):**
- File icon + filename (e.g., "Sharkin_Warriors.stl")
- Progress text: "20,234kb of 31mb" (current/total in KB/MB)
- Progress bar: Cyan/turquoise (#41D4EA) horizontal bar
- Percentage display: "60%" aligned to the right
- X button to cancel upload
- **"Add to Bag" button DISABLED (grayed out) until upload reaches 100%**
- "Change" link remains enabled during upload

**State to Add:**
- `uploadProgress` (0-100%) - percentage complete
- `uploadedBytes` (number) - bytes uploaded
- `totalBytes` (number) - total file size
- `uploadingFile` (boolean) - upload in progress
- `slicingInProgress` (boolean) - slicing after upload

**Progress Display Logic:**
1. Show file size as "XXXkb of XXmb" or "XX.Xmb of XX.Xmb"
2. Progress bar fills from 0% to 100% with cyan gradient
3. Percentage shows to the right of progress info
4. Disable "Add to Bag" button until uploadProgress === 100
5. After 100%, transition to "Slicing model..." state

### Files to Modify
1. `/app/api/slicer/slice/route.ts` - Add timing logs
2. `/components/configurator/ConfiguratorSidebar.tsx` - Implement upload progress UI

### Design System Colors (from Figma)
- Progress bar: `linear-gradient(155deg, #34E5FF -2.79%, #0098C7 93.92%)`
- Progress bar background: `#E6E6E6` (nav line grey)
- Text primary: `#1F1F1F` (Text Black)
- Text secondary: `#626262` (Body Text Grey)
- Disabled button: `linear-gradient(to bottom, #464750 0%, #000000 111.56%)`
- Active button: `linear-gradient(to right, #1F1F1F 0%, #3a3a3a 100%)`

### Expected User Experience After Fix
```
Before: [Black screen for 40s] → "Loading..." → Result
After:  "Uploading... 45% (14.2 MB / 31 MB)" → "Uploading... 100%" → "Slicing..." → Result
```

**Critical UX Rule:** User CANNOT click "Add to Bag" until file upload reaches 100%

### Future Enhancements (Optional)
- Show upload speed estimate (e.g., "2.1 MB/s")
- Add pause/resume upload capability
- Consider WebAssembly client-side slicing to eliminate upload entirely

---

## Notes
- Server logs from successful slice: `[gytx7i] ⏱️ Slicing operation took 15.4s`
- File size: Sharkin_Warriors.stl (31.09 MB)
- The delay is NOT from slicing performance - PrusaSlicer is fast
