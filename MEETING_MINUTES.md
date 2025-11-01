Meeting Minutes NourishNet Project
Client:
U-Turn Homeless Organisation
Team:
Tshwanelo Ramongalo (PM/Full-Stack), Lidvin Megha (Mobile/UI)
Period:
July 2025 — October 2025

---

Date:
Monday, 7 July 2025, 09:00 — 10:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, U-Turn Representative (Sarah Van Wyk, Operations Manager)
Location:
Virtual (Google Meet)
Meeting 1: Project Kickoff & Sprint 1 Planning
Agenda
* Introduction of project and gathering client requirements
* Goals for sprint 1 and deliverables
* Discuss roles of the team and responsibilities
* Setup communication channels
Discussion Points
* U-Turn's mission is presented: reducing food waste, eradicating homelessness and connecting surplus meals with homeless individuals in South Africa.
* Key requirements gathering: mobile-first app, real-time notifications, location-based matching, donor/recipient trust system.
* Client placed an emphasis on a need for a **multilingual supportive system** (English, isiXhosa, Afrikaans).
* Discussed budget constraints: **Firebase free tier initially**, costs need to be monitored.
Decisions Made
* Sprint 1 (Weeks 1-2): Authentication, user profiles, basic donation posting.
* Tech Stack: **React Native + Expo, Firebase** (Auth, Firestore, Storage), Google Maps API.
* Communication: Check-ins weekly on Fridays (suitable), daily team standups async (Whatsapp).
* Project Management: Tshwanelo as PM, Lidvin to handle UI/UX components.
Action Items
[ ] Tshwanelo: Set up the project onFirebase and structure the repo
[ ] Lidvin: Create the component library for the UI (buttons, cards, inputs)
[ ] Both: Review best practices for React Native inline with Expo documentation
[ ] Sarah: Provide branding guidelines for U-Turn as well as their logo assets
Next Meeting
Friday, 11 July 2025, 14:00 (Sprint 1 Check-in)

---

Meeting 2: Sprint 1 Mid-Week Check-in
Date:
Friday, 11 July 2025, 14:00 — 14:45
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Location:
Virtual
Progress Update
* Tshwanelo: Completed the setup for Firebase, authentication flow is about 80% done and the user profile data model has been defined.
* Lidvin: UI component library 60% to completion, system colors for design has been aligned with U-Turn branding.
> Primary Colour: #84bd00 green.
Blockers
* None reported
Action Items
[ ] Tshwanelo: Ensure that authentication is complete by Monday, then proceed with donation posting feature
[ ] Lidvin: Finish the components to handle the inputs and card layouts by the end of week

---

Meeting 3: Sprint 1 Review & Sprint 2 Planning
Date:
Friday, 18 July 2025, 14:00 — 15:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Stephen Underwood (U-Turn)
Sprint 1 Review

| Completed | Partially Complete |
| :--- | :--- |
| ✅ User authentication (email/password, Google sign-in) | Donation posting form (UI done, backend integration pending) |
| ✅ User profile creation and completion flow | |
| ✅ Basic UI component library (Button, Card, Input, Badge) | |
| ✅ Firebase project configured with Auth and Firestore | |

Demo: Tshwanelo demoed the login/register flow using Expo Go;
Lidvin showcased the component library in a Storybook-style preview.
Client Feedback
> Stephen: "I like the authentication system. It’s smooth. The green color matches our brand perfectly.
Is it possible if we add a phone number system for South African numbers?"
Request: Add an eligibility check feature for SASSA grants (future sprint).
Sprint 2 Goals (Weeks 3-4)
* Complete the posting of donations with ability to upload images
* Home screen with list of donations
* Donation filter and search functionality
* Basic donation details screen
Action Items
[ ] Tshwanelo: Finish donation posting backend, implement image upload to Firebase Storage Complete the posting of donations in the backend and implement images being stored in Firebase
[ ] Lidvin: Design the Home screen and implement with the donation card component
[ ] Both: Add the functionality for validating South African phone numbers
Retrospective
* What went well: Great communication all round, the component library sped things up.
* What to improve: Need improved handling patterns for errors, add loading states earlier.
* Risks: Image upload performance on slower connections — look into compression methods.

---

Meeting 4: Sprint 2 Mid-Week Check-in
Date:
Wednesday, 23 July 2025, 10:00 — 10:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Location:
Virtual
Progress Update
* Tshwanelo: Completed donation posting, uploading an image now works, Firestore rules have been configured.
* Lidvin: Layout for home screen complete, donation cards have been styled, filter modal designed.
Technical Discussion
* Discussed strategy for image compression: **compress to 2MB max** before uploading.
* Decided on **React Native Image Picker** to access the native camera/gallery.
* Location picker: **Expo Location** to be used with Google Places autocomplete as the user types (future).
Action Items
[ ] Tshwanelo: Add expiry date logic for the donations, filter expired items
[ ] Lidvin: Implement functionality for filtering, add toggle for map view

---

Meeting 5: Sprint 2 Review & Sprint 3 Planning
Date:
Friday, 1 August 2025, 14:00 — 15:45
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Stephen Underwood (U-Turn)
Sprint 2 Review
* **Completed**: Donation posting uploading images, Home screen with list of donations, Filter by category and distance, Donation details screen (simple), Validation system for phone numbers for South Africans.
* **Issues Found**: Sometimes images dont upload successfully if the internet connectivity is weak (retry logic needed); the dropdown for filtering doesn't close on mobile after its been selected/toggled.
Client Feedback
> Stephen: "The home screen looks good. So can the donors also see who claimed their donations? Also, is there a way for recipients to confirm a pickup?"
Request: Add  functionality for "**Claim**" and workflow for **pickup confirmation**.
Sprint 3 Goals (Weeks 5-6)
* Donation claim functionality
* Chat functionality between the donor and recipient
* Activity Center (My Donations, My Claims)
* Simple alerts/notifications in app
Action Items
[ ] Tshwanelo: Design the data model for claims, implement the flow for claims
[ ] Lidvin: Design UI for chat, screens in Activity Center
[ ] Both: Check how real-time messaging solutions can be implemented in React (Firestore subcollections)
Retrospective
* What went well: Strategy for Image upload worked, filter UI is intuitive.
* What to improve: Add queue for failed uploads if offline, improve messages for errors.
* Risks: Real-time chat could be too complex. start with a simple message collection.

---

Meeting 6: Sprint 3 Mid-Week Standup
Date:
Tuesday, 5 August 2025, 09:30 — 09:45
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Location:
Virtual
Quick Updates
* Tshwanelo: Designed the claim model for claim data, updated Firestore rules, claim service 70% done.
* Lidvin: UI for chat screen is complete, layout for Activity Center in progress.
Blockers
* Timestamp sorting for messages. Tshwanelo to fix.
Action Items
[ ] Tshwanelo: Complete cancellation logic for claims, test edge cases
[ ] Lidvin: Complete Activity Center, add button for "Mark as Picked Up"

---

Meeting 7: Sprint 3 Review & Sprint 4 Planning
Date:
Friday, 15 August 2025, 14:00 — 16:00
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk (U-Turn), U-Turn IT Coordinator (Stephen Underwood)
Sprint 3 Review
* **Completed**: Donation flow for claims, Chat system (one chat for every donation), Activity Center containing My Donations and My Claims, Basic alerts for donations when claimed.
* **Demonstration**: Full flow demo: post donation → claim → chat → mark picked up.
Client Feedback
> Sarah: "This is exactly like the Facebook Messenger thing! We’ll get less phone calls now. Quick question: can more than one person claim the same donation, or is it just on a first-come-first-serve basis?"
> Stephen: "Security question: Would the users be able to see each other's email addresses? Or can we protect it somehow?"
* **Decision**: Implement first-come-first-serve with a system for queueing (future), but allow **multiple claims for now** (donor makes the decision).
Technical Discussion
* **Privacy**: Email addresses out of sight, **only names to display**.
* **Security**: Firestore rules reviewed - updates for donations by owner-only.
* **Performance**: Quick home screen load, but image loading needs to be optimized
Sprint 4 Goals (Weeks 7-8)
* System for **ratings and reviews**
* Better alerts functionality (mark as read, delete)
* Display donor rating on donation details
* **QR code** to verify pickup
* Support for **web platform**
Action Items
[ ] Tshwanelo: Design schema for ratings/reviews, implement service for ratings
[ ] Lidvin: Design rating modal, review UI, change donation details to display donor rating
[ ] Both: Test web build, fix issues with responsiveness
[ ] Sarah: Provide requirements for QR code and process for pickup documentation
Retrospective
* What went well: Chat implementation simpler than thought, Activity Center well-received.
* What to improve: Better error handling is needed incase network fails, add logic for retry.
* Risks: Web platforms needs significant UI changes - allocate more time.

---

Meeting 8: Sprint 4 Mid-Week Check-in
Date:
Wednesday, 20 August 2025, 11:00 — 11:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Progress Update
* Tshwanelo: Designed ratings/reviews schema, rating service 60% complete, QR code now generates.
* Lidvin: Designed rating modal, form UI review complete, fixes for layout issues for web in progress.
Technical Challenges
* QR code scanning: decided to only display QR code (**scanning app-side not required for MVP**).
* Web map: React Native Maps not functional on web - need to integrate **Google Maps API**.
Action Items
[ ] Tshwanelo: Finish aggregation logic for rating, test submission of review
[ ] Lidvin: Fix map integration on web, ensure design functions responsively

---

Meeting 9: Sprint 4 Review & Sprint 5 Planning
Date:
Friday, 29 August 2025, 14:00 — 15:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk (U-Turn)
Sprint 4 Review
* **Completed**: Ratings and reviews system, rating displayed for donor on donation details, alerts enhanced , QR code generates for pickup, Web platform has basic support.
* **Issues**: map not interactive on web (shows static image) - need to implement Google Maps API key; sometimes the rating modal doesn't close after submission.
Client Feedback
> Sarah: "I like how the ratings feature adds so much more credibility! The QR code is exactly what we need for verification. Can we add an indicator for 'days remaining' on donations?"
Request: Show **countdown for expiry** on the donation cards.
Sprint 5 Goals (Weeks 9-10)
* Fix interactivity for **web map**
* Add display for **expiry countdown**
* Implement "Mark All Alerts as Read"
* Improve **offline support** (queue actions if failed)
* Refactor code and test
* Update documentation
Action Items
[ ] Tshwanelo: Set up Google Maps API, fix map on web, add offline queue
[ ] Lidvin: Add countdown for expiry to donation cards, improve alert UI
[ ] Both: Write unit tests for core utilities, document API
Retrospective
* What went well: Ratings system works well, QR code integration works seamlessly.
* What to improve: Need error handling to be more comprehensive, add loading states consistently.
* Risks: API key setup might be complex for Web map - start early.

---

Meeting 10: Sprint 5 Mid-Week Standup
Date:
Tuesday, 3 September 2025, 09:00 — 09:20
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Updates
* Tshwanelo: configured Google Maps API, web map works, offline queue 50% complete.
* Lidvin: Added expiry countdown, Implemented "Mark All Read" button.
Blockers
* Network simulation required for offline queue testing - Tshwanelo researching tools.
Action Items
[ ] Tshwanelo: Complete offline queue, start writing unit tests
[ ] Lidvin: Polish animations for UI, add skeleton loaders

---

Meeting 11: Sprint 5 Review & Sprint 6 Planning (Final Sprint)
Date:
Friday, 12 September 2025, 14:00 — 16:00
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk(U-Turn), Stephen Underwood (U-Turn IT)
Sprint 5 Review
* **Completed**: Google Maps API now fully interactive with Web map , Expiry countdown on donation cards, Mark all alerts as read, queue for claims and messages offline, Unit tests for core utilities, Code refactoring.
Client Feedback:
> "The app feels like we can launch! The offline support is so important." "Can we have a security review before we launch the app for testing?"
* **Decision**: User testing in Sprint 6, **security review scheduled for 3 October**.
Sprint 6 Goals (Weeks 11-12 — Final Sprint)
* Bug fixes and polish
* Performance optimization
* Thorough testing (unit, integration, manual)
* User manual and admin docs
* Prepare for submission (POE documentation)
* Final review and client sign-off
Action Items
[ ] Tshwanelo: Write integration tests, performance profiling, complete documentation for POE
[ ] Lidvin: Final UI polish, audit accessibility , create screenshots for user manual
[ ] Both: Prepare video for demo, final bug fixes
[ ] Sarah: Recruit 5-10 testers for the beta version from U-Turn network
Retrospective
* What went well: Team collaboration went well, feedback from client was incorporated quickly.
* What to improve: Testing should have started earlier, need for thorough documentation
* **Celebrations**: Web platform also works well now, offline support works as expected.

---

Meeting 12: Sprint 6 Mid-Week Check-in
Date:
Wednesday, 17 September 2025, 10:00 — 10:30
Attendees:
Tshwanelo Ramongalo, Lidvin Megha
Progress Update
* Tshwanelo: Wrote integration tests, Tests for Firestore rules pass, Documentation for POE 70% complete.
* Lidvin: Improvements done for accessibility, draft for user manual complete.
Blockers
* None - on track for completion of sprint.
Action Items
[ ] Tshwanelo: Finish documentation for POE, Final presentation preparation
[ ] Lidvin: Last UI polish, test all screens

---

Meeting 13: Sprint 6 Review & Project Closure
Date:
Friday, 26 September 2025, 14:00 — 17:00
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk (U-Turn), Stephen Underwood (U-Turn IT)
Final Demonstration
* Full app walkthrough: onboarding → post donation → claim → chat → rate/review.
* Demonstrate web and mobile platforms.
* Explained performance metrics and security rules.
Client Sign-Off
> Sarah: "I actually really like this version.. The app is feels easy to use and the map on the home page feels like Snapchat and the app addresses our core mission."
> Stephen: "The app passes the security review which is very important. We’re looking to launch toward the end of Q1 or Q2 in 2026"
* **Meeting Closure**: Project completed and signed off and completed by all parties.
Post-Project Actions
[ ] Tshwanelo: Submit all documentation for POE, prepare documentation for handover with clear instructions
[ ] Lidvin: Final code review, ensure all assets have been included
[ ] U-Turn: Begin beta testing, plan launch event for next Q2
Lessons Learned (Key Takeaways)
* **Strong client collaboration** with the Agile methodology works really well and prevents misunderstandings.
* **Offline support crucial** vital target demographic.
* **Security rules need to be tested thoroughly**.

---

Meeting 14: Post-Project Follow-up
Date:
Friday, 3 October 2025, 14:00 — 15:00
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk (U-Turn)
Beta Testing Update
* Initial feedback positive: "Easy to use," "Posting donations is quick."
* Minor issues reported: image upload times out when the connection is slow, sometimes the map doesn't load.
Action Items
[ ] Tshwanelo: Monitor usage of Firebase, prepare for scaling in production
[ ] Lidvin: UI bugs reported by beta testers to be addressed
[ ] Sarah: Continue beta testing, gather more feedback from users

---

Meeting 15: Monthly Check-in
Date:
Friday, 31 October 2025, 14:00 — 14:45
Attendees:
Tshwanelo Ramongalo, Lidvin Megha, Sarah Van Wyk (U-Turn)
Beta Testing Progress
* **15 active beta users**, 47 donations have been posted, 32 claims made, 8 successful pickups.
* Average rating: **4.6/5 stars**.
Issues Resolved
* Fixed the image upload timeout (added retry logic).
* Issue where map doesn't load fixed (API key permissions updated).
Production Readiness
* Status: **Ready for limited production launch**
* Timeline: Scheduled for **Q2 2026**
Action Items
[ ] Tshwanelo: Prepare checklist for production deployment
[ ] Lidvin: Final UI polish based on feedback from beta use
[ ] Sarah: Plan launch event and materials for marketing

---

Meeting Attendance Summary

| Meeting | Date | Tshwanelo | Lidvin | Client Present |
| :--- | :--- | :--- | :--- | :--- |
| 1. Kickoff | 7 Jul 2025 | ✅ | ✅ | ✅ (Stephen) |
| 2. S1 Check-in | 11 Jul 2025 | ✅ | ✅ | ❌ |
| 3. S1 Review | 18 Jul 2025 | ✅ | ✅ | ✅ (Stephen) |
| 4. S2 Check-in | 23 Jul 2025 | ✅ | ✅ | ❌ |
| 5. S2 Review | 1 Aug 2025 | ✅ | ✅ | ✅ (Sarah) |
| 6. S3 Standup | 5 Aug 2025 | ✅ | ✅ | ❌ |
| 7. S3 Review | 15 Aug 2025 | ✅ | ✅ | ✅ (Sarah, Stephen) |
| 8. S4 Check-in | 20 Aug 2025 | ✅ | ✅ | ❌ |
| 9. S4 Review | 29 Aug 2025 | ✅ | ✅ | ✅ (Sarah) |
| 10. S5 Standup | 3 Sep 2025 | ✅ | ✅ | ❌ |
| 11. S5 Review | 12 Sep 2025 | ✅ | ✅ | ✅ (Sarah, Stephen) |
| 12. S6 Check-in | 17 Sep 2025 | ✅ | ✅ | ❌ |
| 13. S6 Review | 26 Sep 2025 | ✅ | ✅ | ✅ (Sarah, Stephen) |
| 14. Follow-up | 3 Oct 2025 | ✅ | ✅ | ✅ (Sarah) |
| 15. Monthly | 31 Oct 2025 | ✅ | ✅ | ✅ (Sarah) |
Total Meetings: 15 \| Client Attendance: 9 meetings \| Team Attendance: 100%

Key Decisions Log

| Decision | Date |
| :--- | :--- |
| Tech Stack: React Native + Expo, Firebase | 7 Jul 2025 |
| Communication: Weekly client check-ins, daily async standups | 7 Jul 2025 |
| Multi-claim Policy: Allow multiple claims, donor decides | 15 Aug 2025 |
| Privacy: Hide email addresses, show names only | 15 Aug 2025 |
| Production Launch: Q2 2026 | 31 Oct 2025 |

---

Risk Register

| Risk | Impact | Probability | Mitigation | Status |
| :--- | :--- | :--- | :--- | :--- |
| Firebase costs exceed budget | High | Medium | Monitor usage, implement cost alerts | ✅ Mitigated |
| Web map API complexity | Medium | Medium | Start early, use @react-google-maps/api | ✅ Resolved |
| Image upload failures | High | Medium | Add compression and retry logic | ✅ Resolved |
| Security vulnerabilities | High | Low | Regular security reviews, Firestore rules testing | ✅ Mitigated |

Last Updated: 31 October 2025
Prepared By: Tshwanelo Ramongalo (Project Manager)
