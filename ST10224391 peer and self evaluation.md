Work Integrated Learning (WIL) Report
Student Name: Tshwanelo Ramongalo 

Student Number: ST10224391 

Module: INSY7315 

Organisation: U-Turn Homeless Organisation 

Client Communication: Stephen Underwood 

Team Member: Lidvin Megha ST1004958

Period: July 2025 - October 2025

Introduction
Work Integrated learning (WIL) is a crucial opportunity for students to be able to form a bridge between the knowledge we gain in the classroom in a theoretical manner and actually put into practice in a real-world setting. The purpose of WIL is to provide students with exposure to the industry in its authentic sense, the environment, where academic concepts can be applied, practical skills can be developed and students gain insight into real-world standards and expectations. Throughout my WIL placement with U-Turn Homeless Organisation, I was privileged to work alongside Lidvin Megha to help develop NourishNet, a cross platform app that is designed to connect recipients in need with food donors. Being a part of this project allowed me to gain an understanding of how technology can be used to drive sustainable social impacts. I further learnt how a production-ready solution addressing needs in the real world. The value of WIL to me stretched far beyond just the technical aspect but also instilled a newfound appreciation for the management of stakeholders, communication, methodologies as well as the importance of developing technology solutions that are not just functional but meaningful.






Skills Learnt
Throughout this journey, I developed a wide spectrum of interpersonal skills with a newfound understanding  to use practical examples to aid illustration during WIL.


Technical Skills & Industry Practices
Agile Development & SDLC: I applied scrum principles throughout this semester through my participation is 6 bi-weekly sprints. These sprints involved task estimation and using story points, daily asynchronous standups and then learnt how to structure sprint reviews with retrospectives, which in turn helped me refine my ability when it comes to managing scope and timelines. 


Full-Stack Mobile Development: 

Through developing the core features of the app I gained proficient experience in React Native (Expo) especially when developing the donation, posting, claim management features alongside Lidvin handling cross-platform complexities (IOS, Android, Web).                        


Cloud Backend Integration: 

Firebase is something i’ve learnt to master throughout this experience, especially across multiple devices and integrations. Firebase services are now something i’m fond of, especially when I had to come up with the Firestore data model across 8 collection and implemented authentication as well as constructing  comprehensive security rules to ensure data privacy is enforced.


Quality Assurance & DevOps: 

Using GitHub actions, I established a CI/CD pipeline to automate the quality checks for code and ran unit test (Jest). My responsibility was to test the coverage for all the business logic and prevent regression.


Version Control: 

I made sure to follow professional Git branching strategies like feature branches, code reviews and pull requests to efficiently collaborate with my team whilst using a shared codebase.


Interpersonal & Management Skills
Client Communication: I led weekly check-ins, translating technical concepts into accessible language for non-technical stakeholders (U-Turn Operations). I was expected to present feature demos and effectively gather and incorporate client feedback.
Conflict Resolution: I facilitated discussions on contentious topics, such as the multi-claim vs. first-come-first-serve policy, ensuring the final decision balanced technical feasibility with client operational needs.
Time Management & Prioritization: I managed parallel tasks across development, testing, and documentation, ensuring features were delivered on time for sprint deadlines despite unexpected technical blockers (e.g., web map integration).

Role in the Team

Team Dynamic and Reporting


Our team consisted of myself as the PM/full-stack developer and Lidvin Megha (Mobile/UI). Together we ensured to maintain a codebase and experience that is dynamic, complementary and collaborative. Lidvin really excelled on the visual design aspect which gave me the true freedom to focus on the backend . We reported directly to Stephen Underwood who heads the media and donations team at U-Turn for the direction of the project and obtaining feedback from the clients perspective.














My Role and Contribution
The role I was assigned to was to be the Project Manager (PM) and the developer (full-stack). The duality of this role allowed me to express myself in:


Leadership/Instruction: 

The facilitation of all the sprint activities like planning and retrospectives and ensuring to assign tasks based on our skill-sets and provide guidance on a technical level for the backend integration and security functions. Through this I ensured that I adhered to the Agile methodology.


Technical Contribution:

Designing the data architecture is the secure Firestore features and implementing the core features like making claims, the chat and ratings feature as well as the setting up of the initial development and the CI/CD.


Team Success: 

Through my contribution in the prioritization of documentation like the meeting minutes and technical architecture as well as removing the technical blockers proactively which in turn allowed Lidvin to focus more on the UI/UX development. Through my work we ensure an application that is not only of high quality but has a secure foundation.









Research, Technology and the Presentation of Information
In order to overcome some of the more complex technical challenges, finding accurate and relevant information played a major role.


Scenario: Resolving Cross-Platform Map Integration
I was tasked to handle the implementation of an interactive map that would work seamlessly across both mobile and web platforms which was challenging as the react native maps feature isn't supported on the web.



Aspect
Details of Information Use
Technology Used
Presentation of Information
Information Sought
How to replace React Native Maps functionality on the web platform, specifically using the Google Maps API.
Google Search, Expo Documentation, Stack Overflow.
Presented a technical proposal to the team (Lidvin) detailing the recommended @react-google-maps/api library, its pros/cons, and estimated effort, followed by a proof-of-concept branch.
Information Found
Documentation for Google Maps Platform API key setup, usage limits, and integration guides for the @react-google-maps/api library.
Google Maps Platform Documentation and GitHub for code examples.
I created the final implementation and documented the API key setup and configuration steps in the Systems Manual for U-Turn's IT staff.







Scenario: Designing Secure Data Access
I was expected to design robust security rules to ensure user data privacy and prevent unauthorized modification of donations, a critical client requirement.

I was also in charge of designing the security rules to make sure that data privacy is intact and that unauthorized changes to the donations wasn't possible which was a critical requirement from the client.
Information Found: Official Firebase Security Rules documentation, best practices from security blogs (Firebase, 2025), and the OWASP Mobile Top 10 for mobile security guidelines. (OWASP, 2025)


Technology Used: I used the Firebase emulator suite to handle the automated testing for the security rules against the multiple user roles and then I made use of the firebase console to test interactively.


Presentation: Based on the firebase rules document, I also create a thorough security review document to hand to the client which was aimed at summarizing the access controls such as only the original donor being able to edit a donation, which was then presented to the clients IT Intern, James Korkie.

Personal Strengths and Weaknesses
Personal Strengths:


Throughout this WIL I came to understand that I really thrive when it comes to thinking systematically and visually the way the backend architecture should map out to complement the user experience.
Debugging: I did really well when it came to figuring out the most efficient way to debug when errors or conflicts prevented progress, like errors in the firestore permissions or the image retry logic or when designing the system architecture in a broader sense. Perfecting this skill allowed us as a team to really take charge of challenges like the offline queueing functionality in an efficient manner.


Security and Quality: When brainstorming with my team, I took initiative when it came to the firestore security rules and handling the integration and unit testing, where I made sure that the app stood on a secure and robust foundation. Displaying these security measures to the relevant stakeholder impressed them in terms of how much detail goes into preventing certain unwanted actions.


Client Communication: I effectively managed client expectations, translating technical project status and risks into clear, non-technical language during check-ins.

The expectations of the client were managed very efficiently with the technical project risks and status being translated into concise, clear and non-technical language throughout our checkins.


Self-Directed Learning: I quickly mastered React Native and the required Firebase services without formal training, allowing me to contribute significantly from Sprint 1.

I was able to rapidly master the React Native library with the help of my team without much guidance as figuring things out along the way and discovering what makes them break is the flow state where I learnt the most about the library and its capabilities cross-platform.


Documentation: I documented all project documentation alongside my team, specifically the technical manual and user manual with POE documentation to bring the project together.
Personal Weaknesses (Areas for Improvement)


UI/UX Design and Visual Polish:  I’m not the best when it comes to aesthetics and having a good eye for design was a trait I was glad I could rely on Lidvin for. The user flow aspects like styling responsively and the consistency of the design was where I relied heavily on the expertise from Lidvin.


Improvement: Dedicate time to improving modern UI/UX principles and their integrations in design systems to bridge this knowledge gap.


Initial Time Estimation: Initially I thought the moe complex features would be much simpler, but building something cross platform came with its own challenges, but it was worth the experience as the reality of the world and industry is being able to cater to the latest devices that roll out without care for your expertise.


Improvement: Add a buffer for estimating new features I'm comfortable with (20-30%) and ensure to have the actual versus estimated tracked to check how accurate the prediction was.


Delegation (as PM): I occasionally took on complex technical tasks that could have been delegated, to ensure quality and speed. This limited Lidvin's exposure to some backend systems.

Delegation is one of the things I struggle with the most as I am extremely critical of myself and don't feel that others deserve that kind of treatment, so I justify it by being hard on myself, which makes me very competitive. This has its pros and cons in that i’m always getting better but at the same time want to do everything to ensure its perfect which slows down progress as there's only so much one human can do and I found myself limiting myself in my other strengths like leadership if one is benign overshadowed as leaders delegate.


Improvement: Figure out what the most important tasks are from a high level and consolidate a time cost equation for yourself, because even though you can do it yourself, you could be doing something more pivotal. “FOCUS ON THINGS THAT MOVE THE NEEDLE and keep the main thing the main thing.” - message to myself

Stakeholder Relationship 


Relationship with Stephen Underwood (Client Supervisor)


Worked Well: Relationships flows smoothly. Stephen and his feedback was always clear and consistent in terms of us demoing the features and he had trust in our technical judgment, which allowed us to practice complete developmental autonomy.


Did Not Work Well: In the beginning we had a little bit of friction in terms of misaligned expectations as the communication was not happening frequent enough and was not asynchronous. At times we only received feedback late which resulted in pressure to make changes mid-sprint which taught us a lot about handling pressure and using it to deliver and better ourselves.


Improvement Strategy: I could have improved the relationship by initiating more informal, mid-week check-ins beyond the formal sprint reviews, allowing for quicker course correction. I should also have been more explicit about timeline trade-offs when a new requirement was introduced.

The relationship could have been improved through the initiating mid-week check-ins that are less formal outside of the sprint reviews, making way for more agile course correction. I could have also been more direct about the trade-off the sudden changes would have on the timeline instead of trying to please the stakeholders all the time.






Relationship with WIL Coordinator


Worked Well: The coordinator provided clear instructions on the academic deliverables and was available to clarify rubric criteria, ensuring I understood the requirements for the final submission.

The coordinator aided in explaining the complex assessment structure and how best to go about it to ensure I do well and clarified many parts of the rubric criteria including deliverables and how they integrate into the assessment which helped toward the finall submission. 


Did Not Work Well: The constant documentation felt like an administrative burden as it felt like I was disconnected from actual development.


Improvement Strategy: To integrate the documentation more efficiently, I could have asked for clarity of the academic requirements sooner in the sprints instead of just doing them in the final stages.

Impact

The contributions I made had a positive impact on the stakeholders and the organizations future.
Benefits to Others
U-Turn Organisation (Management): A platform that was centered around security, scalability and being fully functional was provided to the clients, enabling them to expand their arms in the social sphere on the African continent whilst tackling a crucial and difficult sector to penetrate efficiently. 


End Users (Donors/Recipients): Some features that were very critical to the end users were a result of my efforts, like the offline queueing functionality that lets users still use the app and make changes that sync once connected to the internet which is vital for low income areas. Another feature was the ratings/reviews system which was crucial for building trust.


Team Member (Lidvin Megha): With our skills, I complemented his by offering a firm technical foundation and acted like his mentor in terms of the backend logic and best practices for testing via code reviews and made sure that the environment that we shared together was a collaborative one.




How I Made a Better/Greater Impact
I made it a point to exceed the basic functional requirements through excelling technically and gaining user trust. 
Security and Trust: The clients biggest concern was tackled head on through the implementation of Firestore Security Rules to adhere to data privacy. By acting proactively in this manner, I made sure that the app was trustworthy from inception, which is very crucial for an app that is community based. 


Scalability and Quality: Maintainability was prioritized through ensuring that architecture is clean and that the test-suite is comprehensive. Contributing in this way ensures that there is long-term viability and future maintenance costs are reduced for U-Turn, ensuring the project to be a sustainable asset instead of a once-off build.


Offline Capability: The offline queue functionality was not initially required explicitly but was very important and is basic practice for a community based app with low income demographics in mind. The accessibility and reliability of the app for users who have weak connections ensure the social impact of the app was truly maximised.

Conclusion
Overall my WIL experience with U-Turn through the NourishNet app was one of the most formative steps in my preparation for my career in software development and sparked so many ideas of which I’ve already shipped and have in my pipeline going through their own scrum processes with outsourcing being one of the crucial lessons I learnt in this module. It truly came back to the philosophical thought of going together being the quickest path to success and opened opportunities to focus on higher impact activities where my skills could be of better use. This reinforced the crucial link between my modules academically and the reality of the professional world. I took on the responsibility of being both a full stack developer and a project manager which saw me delivering a production-ready solution whilst maintaining the expectations of the client.

The challenges I faced, particularly in performance, security and consistency cross-platform, truly sparked my skills for problem solving and self-awareness in terms of my strengths on a technical level as well as identifying my growth points. All-in-all, the WIl gave me a clear and detailed outlook on the professional world, further instilling an authentic confidence in the ability I have to join a development team and ensure that my contribution is positive and meaningful. I can only be grateful.

References:

OWASP (2025) The OWASP Foundation. Available at: https://owasp.org/ (Accessed: 1 November 2025).


OWASP (2025) Application Security Verification Standard (ASVS) V5.0. Available at: https://owasp.org/www-project-application-security-verification-standard/ (Accessed: 1 November 2025).


Google (2025) Firebase Documentation. Available at: https://firebase.google.com/docs (Accessed: 1 November 2025).


Google (2025) Cloud Firestore. Available at: https://firebase.google.com/docs/firestore (Accessed: 1 November 2025).



<img width="1138" height="545" alt="image" src="https://github.com/user-attachments/assets/bfa1ef1e-0a42-4643-b0a7-55d026dac022" />
