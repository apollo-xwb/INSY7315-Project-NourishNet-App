# Meeting Minutes — NourishNet Project
**Client:** U-Turn Homeless Organisation  
**Team:** Tshwanelo Ramongalo (PM/Full-Stack), Lidvin Megha (Mobile/UI)  
**Period:** July 2025 — October 2025

---

## Meeting 1: Project Kickoff & Sprint 1 Planning
**Date:** Monday, 7 July 2025, 09:00 — 10:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, U-Turn Representative (Sarah Mitchell, Operations Manager)  
**Location:** Virtual (Google Meet)

### Agenda
- Project introduction and client requirements
- Sprint 1 goals and deliverables
- Team roles and responsibilities
- Communication channels setup

### Discussion Points
- Sarah presented U-Turn's mission: reducing food waste and connecting surplus meals with homeless individuals in Cape Town
- Key requirements: mobile-first app, real-time notifications, location-based matching, donor/recipient trust system
- Client emphasized need for multilingual support (English, isiXhosa, Afrikaans)
- Budget constraints discussed: Firebase free tier initially, cost monitoring required

### Decisions Made
- **Sprint 1 (Weeks 1-2):** Authentication, user profiles, basic donation posting
- **Tech Stack:** React Native + Expo, Firebase (Auth, Firestore, Storage), Google Maps API
- **Communication:** Weekly client check-ins on Fridays, daily team standups async (Slack)
- **Project Management:** Tshwanelo as PM, Lidvin focused on UI/UX components

### Action Items
- [ ] Tshwanelo: Set up Firebase project and repository structure
- [ ] Lidvin: Create UI component library (buttons, cards, inputs)
- [ ] Both: Review React Native best practices and Expo documentation
- [ ] Sarah: Provide U-Turn branding guidelines and logo assets

### Next Meeting
Friday, 11 July 2025, 14:00 (Sprint 1 Check-in)

---

## Meeting 2: Sprint 1 Mid-Week Check-in
**Date:** Friday, 11 July 2025, 14:00 — 14:45  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha  
**Location:** Virtual

### Progress Update
- **Tshwanelo:** Firebase setup complete, authentication flow 80% done, user profile data model defined
- **Lidvin:** UI component library 60% complete, design system colors aligned with U-Turn branding (#84bd00 green)

### Blockers
- None reported

### Action Items
- [ ] Tshwanelo: Complete authentication by Monday, start on donation posting
- [ ] Lidvin: Finish input components and card layouts by end of week

---

## Meeting 3: Sprint 1 Review & Sprint 2 Planning
**Date:** Friday, 18 July 2025, 14:00 — 15:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn)

### Sprint 1 Review
**Completed:**
- ✅ User authentication (email/password, Google sign-in)
- ✅ User profile creation and completion flow
- ✅ Basic UI component library (Button, Card, Input, Badge)
- ✅ Firebase project configured with Auth and Firestore

**Partially Complete:**
- ⚠️ Donation posting form (UI done, backend integration pending)

**Demonstration:**
- Tshwanelo demoed login/register flow on Expo Go
- Lidvin showed component library in Storybook-style preview

### Client Feedback
- Sarah: "The authentication looks smooth. The green color matches our brand perfectly. Can we add phone number validation for South African numbers?"
- Request: Add SASSA eligibility check feature (future sprint)

### Sprint 2 Goals (Weeks 3-4)
- Complete donation posting with image upload
- Home screen with donation list
- Filter and search functionality
- Basic donation details screen

### Action Items
- [ ] Tshwanelo: Finish donation posting backend, implement image upload to Firebase Storage
- [ ] Lidvin: Design and implement Home screen, donation card component
- [ ] Both: Add South African phone number validation

### Retrospective
- **What went well:** Good communication, component library accelerated development
- **What to improve:** Need better error handling patterns, add loading states earlier
- **Risks:** Image upload performance on slow connections — investigate compression

---

## Meeting 4: Sprint 2 Mid-Week Check-in
**Date:** Wednesday, 23 July 2025, 10:00 — 10:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha  
**Location:** Virtual

### Progress Update
- **Tshwanelo:** Donation posting complete, image upload working, Firestore rules written
- **Lidvin:** Home screen layout done, donation cards styled, filter modal designed

### Technical Discussion
- Discussed image compression strategy: compress to 2MB max before upload
- Decided to use React Native Image Picker for camera/gallery access
- Location picker: use Expo Location with Google Places autocomplete (future)

### Action Items
- [ ] Tshwanelo: Add donation expiry date logic, filter expired items
- [ ] Lidvin: Implement filter functionality, add map view toggle

---

## Meeting 5: Sprint 2 Review & Sprint 3 Planning
**Date:** Friday, 1 August 2025, 14:00 — 15:45  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn)

### Sprint 2 Review
**Completed:**
- ✅ Donation posting with image upload
- ✅ Home screen with donation list
- ✅ Filter by category and distance
- ✅ Donation details screen (basic)
- ✅ Phone number validation for South Africa

**Issues Found:**
- Images sometimes fail to upload on slow networks — retry logic needed
- Filter dropdown doesn't close on mobile after selection

### Client Feedback
- Sarah: "The home screen looks great! Can donors see who claimed their donations? Also, we need a way for recipients to confirm pickup."
- Request: Add "Claim" functionality and pickup confirmation workflow

### Sprint 3 Goals (Weeks 5-6)
- Claim donation functionality
- Chat system between donor and claimant
- Activity Center (My Donations, My Claims)
- Basic alerts/notifications

### Action Items
- [ ] Tshwanelo: Design claim data model, implement claim flow
- [ ] Lidvin: Design chat UI, Activity Center screens
- [ ] Both: Research real-time messaging solutions (Firestore subcollections)

### Retrospective
- **What went well:** Image upload strategy worked, filter UI intuitive
- **What to improve:** Add offline queue for failed uploads, improve error messages
- **Risks:** Real-time chat might be complex — start with simple message collection

---

## Meeting 6: Sprint 3 Mid-Week Standup
**Date:** Tuesday, 5 August 2025, 09:30 — 09:45  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha  
**Location:** Virtual

### Quick Updates
- **Tshwanelo:** Claim data model designed, Firestore rules updated, claim service 70% done
- **Lidvin:** Chat screen UI complete, Activity Center layout in progress

### Blockers
- Chat message ordering needs sorting by timestamp — Tshwanelo to fix

### Action Items
- [ ] Tshwanelo: Complete claim cancellation logic, test edge cases
- [ ] Lidvin: Finish Activity Center, add "Mark as Picked Up" button

---

## Meeting 7: Sprint 3 Review & Sprint 4 Planning
**Date:** Friday, 15 August 2025, 14:00 — 16:00  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn), U-Turn IT Coordinator (James Ngubane)

### Sprint 3 Review
**Completed:**
- ✅ Claim donation flow
- ✅ Chat system (one chat per donation)
- ✅ Activity Center with My Donations and My Claims
- ✅ Basic alerts when donations are claimed

**Demonstration:**
- Full flow demo: post donation → claim → chat → mark picked up
- Sarah tested on her phone via Expo Go, provided positive feedback

### Client Feedback
- **Sarah:** "This is exactly what we envisioned! The chat feature will reduce phone calls. One question: can multiple people claim the same donation, or is it first-come-first-serve?"
- **James:** "Security question: Can users see each other's email addresses? We need privacy protection."
- **Decision:** Implement first-come-first-serve with queue system (future), but allow multiple claims for now (donor decides)

### Technical Discussion
- Privacy: Email addresses hidden, only names shown
- Security: Firestore rules reviewed — owner-only updates for donations
- Performance: Home screen loads quickly, but need to optimize image loading

### Sprint 4 Goals (Weeks 7-8)
- Ratings and reviews system
- Enhanced alerts (mark as read, delete)
- Donor rating display on donation details
- QR code for pickup verification
- Web platform support

### Action Items
- [ ] Tshwanelo: Design ratings/reviews schema, implement rating service
- [ ] Lidvin: Design rating modal, review UI, update donation details to show donor rating
- [ ] Both: Test web build, fix responsive layout issues
- [ ] Sarah: Provide QR code requirements and pickup process documentation

### Retrospective
- **What went well:** Chat implementation simpler than expected, Activity Center well-received
- **What to improve:** Need better error handling for network failures, add retry logic
- **Risks:** Web platform might need significant UI changes — allocate extra time

---

## Meeting 8: Sprint 4 Mid-Week Check-in
**Date:** Wednesday, 20 August 2025, 11:00 — 11:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha

### Progress Update
- **Tshwanelo:** Ratings/reviews schema designed, rating service 60% complete, QR code generation working
- **Lidvin:** Rating modal designed, review form UI done, web layout fixes in progress

### Technical Challenges
- QR code scanning: decided to show QR code only (scanning app-side not needed for MVP)
- Web map: React Native Maps doesn't work on web — need Google Maps API integration

### Action Items
- [ ] Tshwanelo: Complete rating aggregation logic, test review submission
- [ ] Lidvin: Fix web map integration, ensure responsive design works

---

## Meeting 9: Sprint 4 Review & Sprint 5 Planning
**Date:** Friday, 29 August 2025, 14:00 — 15:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn)

### Sprint 4 Review
**Completed:**
- ✅ Ratings and reviews system
- ✅ Donor rating displayed on donation details
- ✅ Enhanced alerts (mark read, delete, mark all read)
- ✅ QR code generation for pickup
- ✅ Web platform basic support

**Issues:**
- Web map not interactive (showing static image) — needs Google Maps API key
- Rating modal sometimes doesn't close after submission — minor bug

### Client Feedback
- **Sarah:** "The ratings feature adds trust! Recipients can make informed choices. The QR code is perfect for verification. Can we add a 'days remaining' indicator on donations?"
- Request: Show expiry countdown on donation cards

### Sprint 5 Goals (Weeks 9-10)
- Fix web map interactivity
- Add expiry countdown display
- Implement "Mark All Alerts as Read"
- Improve offline support (queue failed actions)
- Code refactoring and testing
- Documentation updates

### Action Items
- [ ] Tshwanelo: Set up Google Maps API, fix web map, add offline queue
- [ ] Lidvin: Add expiry countdown to donation cards, improve alert UI
- [ ] Both: Write unit tests for core utilities, document API

### Retrospective
- **What went well:** Ratings system straightforward, QR code integration smooth
- **What to improve:** Need more comprehensive error handling, add loading states consistently
- **Risks:** Web map API key setup might be complex — start early

---

## Meeting 10: Sprint 5 Mid-Week Standup
**Date:** Tuesday, 3 September 2025, 09:00 — 09:20  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha

### Updates
- **Tshwanelo:** Google Maps API configured, web map working, offline queue 50% complete
- **Lidvin:** Expiry countdown added, "Mark All Read" button implemented

### Blockers
- Offline queue testing requires network simulation — Tshwanelo researching tools

### Action Items
- [ ] Tshwanelo: Complete offline queue, start writing unit tests
- [ ] Lidvin: Polish UI animations, add skeleton loaders

---

## Meeting 11: Sprint 5 Review & Sprint 6 Planning (Final Sprint)
**Date:** Friday, 12 September 2025, 14:00 — 16:00  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn), James Ngubane (U-Turn IT)

### Sprint 5 Review
**Completed:**
- ✅ Web map fully interactive with Google Maps API
- ✅ Expiry countdown on donation cards
- ✅ Mark all alerts as read
- ✅ Offline queue for claims and messages
- ✅ Unit tests for sanitize, validation, serialization utilities
- ✅ Code refactoring (removed redundant code, improved structure)

### Client Feedback
- **Sarah:** "The app feels production-ready! The offline support is crucial for our users who may have unreliable internet. When can we start user testing?"
- **James:** "Security looks good. Can we schedule a security review before launch?"
- **Decision:** User testing in Sprint 6, security review scheduled for 3 October

### Sprint 6 Goals (Weeks 11-12 — Final Sprint)
- Bug fixes and polish
- Performance optimization
- Comprehensive testing (unit, integration, manual)
- User manual and admin documentation
- Prepare for submission (POE documentation)
- Final client review and sign-off

### Action Items
- [ ] Tshwanelo: Write integration tests, performance profiling, complete POE documentation
- [ ] Lidvin: Final UI polish, accessibility audit, create user manual screenshots
- [ ] Both: Prepare demo video, final bug fixes
- [ ] Sarah: Recruit 5-10 beta testers from U-Turn network

### Retrospective
- **What went well:** Team collaboration excellent, client feedback incorporated quickly
- **What to improve:** Should have started testing earlier, documentation could be more comprehensive
- **Celebrations:** Web platform working well, offline support successful

---

## Meeting 12: Sprint 6 Mid-Week Check-in
**Date:** Wednesday, 17 September 2025, 10:00 — 10:30  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha

### Progress Update
- **Tshwanelo:** Integration tests written, Firestore rules tests passing, POE documentation 70% complete
- **Lidvin:** Accessibility improvements done (contrast, touch targets), user manual draft complete

### Blockers
- None — on track for sprint completion

### Action Items
- [ ] Tshwanelo: Finish POE documentation, prepare final presentation
- [ ] Lidvin: Final UI polish, ensure all screens tested

---

## Meeting 13: Sprint 6 Review & Project Closure
**Date:** Friday, 26 September 2025, 14:00 — 17:00  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn), James Ngubane (U-Turn IT), U-Turn Executive Director (Dr. Patricia Williams)

### Sprint 6 Review
**Completed:**
- ✅ All known bugs fixed
- ✅ Comprehensive test suite (unit, integration, Firestore rules)
- ✅ User manual and systems manual complete
- ✅ POE documentation prepared
- ✅ Performance optimizations applied
- ✅ Accessibility improvements verified

### Final Demonstration
- Full app walkthrough: onboarding → post donation → claim → chat → rate/review
- Web and mobile platforms demonstrated
- Performance metrics shown (load times, image optimization)
- Security rules explanation

### Client Sign-Off
- **Dr. Williams:** "This exceeds our expectations. The app is intuitive, secure, and addresses our core mission. We're excited to launch this in our community."
- **Sarah:** "The team has been responsive and professional throughout. We're ready for beta testing."
- **James:** "Security review passed. Ready for production deployment."

### Project Metrics
- **Total Sprints:** 6 (12 weeks)
- **Features Delivered:** 15+ major features
- **Test Coverage:** 80%+ for core utilities
- **Documentation:** User manual, systems manual, API docs, POE docs

### Post-Project Actions
- [ ] Tshwanelo: Submit POE documentation, prepare handover documentation
- [ ] Lidvin: Final code review, ensure all assets included
- [ ] U-Turn: Begin beta testing, plan launch event

### Retrospective (Final)
- **What went well:**
  - Strong client collaboration
  - Agile methodology worked well
  - Technical decisions (React Native + Firebase) proved correct
  - Team communication excellent
  
- **What to improve:**
  - Should have allocated more time for testing earlier
  - Documentation could have been written incrementally
  - Web platform required more effort than anticipated
  
- **Lessons Learned:**
  - Client feedback loops essential
  - Offline support crucial for target users
  - Security rules need thorough testing
  - Performance optimization should be continuous

### Next Steps
- Beta testing phase (October 2025)
- Production deployment planning (November 2025)
- Post-launch support agreement (to be discussed)

### Meeting Closure
Project officially completed and signed off by all parties. Handover documentation provided to U-Turn.

---

## Meeting 14: Post-Project Follow-up
**Date:** Friday, 3 October 2025, 14:00 — 15:00  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn)

### Beta Testing Update
- 8 beta testers recruited (4 donors, 4 recipients)
- Initial feedback positive: "Easy to use," "Quick to post donations"
- Minor issues reported: image upload timeout on slow connections, map sometimes doesn't load

### Technical Discussion
- Image upload timeout: implement progressive upload or chunked upload (future enhancement)
- Map loading: investigate Google Maps API quota limits

### Action Items
- [ ] Tshwanelo: Monitor Firebase usage, prepare for production scaling
- [ ] Lidvin: Address minor UI bugs reported by beta testers
- [ ] Sarah: Continue beta testing, gather more user feedback

### Next Meeting
Monthly check-in scheduled for 31 October 2025

---

## Meeting 15: Monthly Check-in
**Date:** Friday, 31 October 2025, 14:00 — 14:45  
**Attendees:** Tshwanelo Ramongalo, Lidvin Megha, Sarah Mitchell (U-Turn)

### Beta Testing Progress
- 15 active beta users
- 47 donations posted, 32 claims made
- 8 successful pickups completed
- Average rating: 4.6/5 stars

### Issues Resolved
- Image upload timeout fixed (added retry logic)
- Map loading issue resolved (API key permissions updated)

### Production Readiness
- **Status:** Ready for limited production launch
- **Timeline:** Planned for mid-November 2025
- **Support:** Team available for post-launch bug fixes (first month)

### Action Items
- [ ] Tshwanelo: Prepare production deployment checklist
- [ ] Lidvin: Final UI polish based on beta feedback
- [ ] Sarah: Plan launch event and marketing materials

### Next Meeting
Pre-launch meeting scheduled for 7 November 2025

---

## Meeting Attendance Summary

| Meeting | Date | Tshwanelo | Lidvin | Client Present |
|---------|------|-----------|--------|----------------|
| 1. Kickoff | 7 Jul 2025 | ✅ | ✅ | ✅ (Sarah) |
| 2. S1 Check-in | 11 Jul 2025 | ✅ | ✅ | ❌ |
| 3. S1 Review | 18 Jul 2025 | ✅ | ✅ | ✅ (Sarah) |
| 4. S2 Check-in | 23 Jul 2025 | ✅ | ✅ | ❌ |
| 5. S2 Review | 1 Aug 2025 | ✅ | ✅ | ✅ (Sarah) |
| 6. S3 Standup | 5 Aug 2025 | ✅ | ✅ | ❌ |
| 7. S3 Review | 15 Aug 2025 | ✅ | ✅ | ✅ (Sarah, James) |
| 8. S4 Check-in | 20 Aug 2025 | ✅ | ✅ | ❌ |
| 9. S4 Review | 29 Aug 2025 | ✅ | ✅ | ✅ (Sarah) |
| 10. S5 Standup | 3 Sep 2025 | ✅ | ✅ | ❌ |
| 11. S5 Review | 12 Sep 2025 | ✅ | ✅ | ✅ (Sarah, James) |
| 12. S6 Check-in | 17 Sep 2025 | ✅ | ✅ | ❌ |
| 13. S6 Review | 26 Sep 2025 | ✅ | ✅ | ✅ (Sarah, James, Dr. Williams) |
| 14. Follow-up | 3 Oct 2025 | ✅ | ✅ | ✅ (Sarah) |
| 15. Monthly | 31 Oct 2025 | ✅ | ✅ | ✅ (Sarah) |

**Total Meetings:** 15  
**Client Attendance:** 9 meetings  
**Team Attendance:** 100% (all meetings)

---

## Key Decisions Log

1. **Tech Stack:** React Native + Expo, Firebase (7 Jul 2025)
2. **Sprint Duration:** 2 weeks per sprint (7 Jul 2025)
3. **Communication:** Weekly client check-ins, daily async standups (7 Jul 2025)
4. **Multi-claim Policy:** Allow multiple claims, donor decides (15 Aug 2025)
5. **Privacy:** Hide email addresses, show names only (15 Aug 2025)
6. **Beta Testing:** 8-10 users from U-Turn network (12 Sep 2025)
7. **Production Launch:** Mid-November 2025 (31 Oct 2025)

---

## Risk Register

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Firebase costs exceed budget | High | Medium | Monitor usage, implement cost alerts | ✅ Mitigated |
| Web map API complexity | Medium | Medium | Start early, use @react-google-maps/api | ✅ Resolved |
| Offline support complexity | Medium | Low | Use offline queue pattern | ✅ Resolved |
| Image upload failures | High | Medium | Add compression and retry logic | ✅ Resolved |
| Security vulnerabilities | High | Low | Regular security reviews, Firestore rules testing | ✅ Mitigated |

---

**Document Version:** 1.0  
**Last Updated:** 31 October 2025  
**Prepared By:** Tshwanelo Ramongalo (Project Manager)

