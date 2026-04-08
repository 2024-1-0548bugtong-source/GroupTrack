
 College of Information Technology 
  King’s College of the Philippines

GROUPTRACK: A Browser Extension for Tracking Individual Contributions in     Academic Group Projects

 BUGTONG, CHINNE D. 


1. Introduction
Group projects are widely used in academic environments because they develop collaboration, communication, and shared responsibility. However, many student groups experience recurring issues such as unequal participation, unclear responsibility assignment, and difficulty proving who contributed specific work. These challenges often result in conflict among members and unfair grading outcomes.
To address these problems, this research proposes GroupTrack, a browser-based solution designed to improve accountability and transparency in academic group projects by allowing members to record tasks, roles, deadlines, and progress. GroupTrack emphasizes privacy and ethical use by storing only user-entered project data, without monitoring browsing history, tabs, keystrokes, or other personal activity.
Objectives
1.	To gather and analyze user needs and system requirements for the development of GroupTrack.
2.	To design and refine the system’s interface and workflows through iterative prototyping and user feedback.
3.	To develop and integrate the core features of GroupTrack.
4.	To conduct system testing, deploy the application, and implement final refinements based on user evaluation.

2. Methodology
This study adopts the Rapid Application Development (RAD) methodology, an iterative and user-centered approach ideal for systems that require fast prototyping and continuous user feedback. RAD was selected because GroupTrack must be quickly refined based on user needs, ensuring usability, responsiveness, and efficient feature evolution.
RAD enables the development team to adjust components without adhering to a strictly linear process. Each phase generates prototypes and functional modules that undergo immediate review and revision. This reduces development time and ensures that the final system aligns with user expectations.
The RAD methodology will follow four phases: gathering user requirements, designing system models, constructing the system through iterative development, and completing deployment through final testing and user evaluation.



 
Figure 2. The Rapid Application Development (RAD) lifecycle, illustrating its iterative phases and emphasis on rapid prototyping and user feedback. Source: Kissflow (n.d.).

2.1 Gathering Requirements for GroupTrack

Requirements will be gathered through a targeted survey conducted via Google Forms and distributed to 20 students to identify actual group work challenges and potential system functionalities. This approach will ensure that the system’s requirements reflect real student needs rather than assumptions.
After analyzing survey responses, functional requirements will be identified and prioritized, including real-time task tracking, project creation through join codes, role-based membership, deadline notifications, and contribution monitoring. These requirements will be documented in a formal requirements specification and corresponding schema definitions (using Zod validation in schema.ts) to establish a single source of truth for data structures prior to interface development.

2.2 Designing GroupTrack
During the design phase, the researchers will outline how the system will function based on the gathered functional and non-functional requirements and defined workflows. All design outputs will remain exploratory and flexible until the most suitable development environment is finalized.
2.2.1 Use-Case Diagrams
Use-case diagrams will represent how users interact with GroupTrack. Actions such as creating a project, assigning tasks, viewing progress, generating reports, and receiving reminders will be based on the requirements gathered from the survey.
2.2.2 System Flowcharts
Preliminary flowcharts will illustrate possible workflows, including logical processes, decision paths, and data flow. These will serve as a foundation for understanding system behavior prior to coding.
2.2.3 Wireframes
Wireframes will depict the initial structure of the user interface, ensuring clarity, simplicity, and ease of use. They will serve as early prototypes for iterative review.
2.2.4 Database Schema
A conceptual database schema will guide data structure planning. It will define how data is organized, related, and stored within GroupTrack. The schema ensures consistency, integrity, and scalability, enabling efficient task tracking, user role management, and accurate contribution records.

2.3 Development Phase (Post-Analysis)

The researchers will transform the created designs into a functional system, implementing workflows, interfaces, and data structures guided by the use-case diagrams, flowcharts, wireframes, and database schema. The research team will review and select platforms and technologies essential for developing GroupTrack’s features and workflows.
Development will proceed in iterative cycles with frequent testing and user-aligned refinement. Structured iteration plans will guide each cycle to ensure that the system meets intended requirements, usability goals, and aligns with user needs.

2.4 Cutover (Deployment & Testing)

2.4.1 Deployment

Browser environments will be evaluated to determine the most suitable packaging for deploying GroupTrack. Chrome extension and standalone web application formats will be assessed for performance, compatibility, classroom accessibility, and ease of distribution. The deployment method that ensures optimal usability for students will be selected.

2.4.2 Testing

System testing will include unit testing, functional testing, and user inspection. Individual features and components will be evaluated for proper operation, and functional testing will verify that all features meet the defined system requirements. Participants will assess the interface and workflows for clarity, usability, and effectiveness.

GroupTrack will also be distributed with a Google Forms link containing the standardized System Usability Scale (SUS) questionnaire. Users will perform core tasks such as login, project creation, task assignment, and contribution tracking. SUS scores and open-ended feedback will guide final refinements prior to full deployment.

3. Results

This chapter presents the outcomes of the design, development, and refinement of GroupTrack based on the Rapid Application Development (RAD) methodology within a developmental research approach. The results are organized according to the methodology phases: gathered requirements, system design outputs, implementation, deployment, and testing.

3.1 Gathered Requirements for GroupTrack

This section summarizes the gathered user needs and the resulting functional and non-functional requirements used as the foundation of GroupTrack.

3.1.1 Survey Results

A targeted survey was conducted through Google Forms with student respondents to identify common problems in academic group work and the features most needed in a support tool.

For the current dataset used in this chapter, 6 valid responses were recorded.

Table 3.3 Respondent Profile Summary

| Indicator | Result |
| --- | --- |
| Total valid responses | 6 |
| Year level distribution | Third Year (3), Fourth Year (2), Second Year (1) |
| Group-work exposure frequency | Often (5), Very Often (1) |

Based on the responses, the recurring issues were:
1. Unequal task participation among members.
2. Lack of clear role assignment.
3. Difficulty tracking deadlines consistently.
4. Difficulty proving individual contributions during grading.

Problem-indicator ratings (5-point scale) were consistently high, indicating strong agreement that the identified issues are present.

Table 3.4 Problem Indicators from Pre-Implementation Survey

| Problem Indicator | Mean Rating (1-5) |
| --- | --- |
| Unequal participation occurs in group projects | 4.50 |
| Tracking individual contributions is difficult | 4.00 |
| Responsibilities are often unclear among members | 4.33 |
| Group conflicts happen due to unclear task assignments | 4.17 |
| It is difficult to prove individual contributions to instructors | 4.33 |
| Existing tools are insufficient for tracking contributions | 3.83 |

The findings directly supported the inclusion of core GroupTrack features such as project creation and joining, role-based membership, task status tracking, deadline notifications, and analytics for contribution transparency.

Feature usefulness ratings (5-point scale) further confirmed the selected solution scope.

Table 3.5 Perceived Usefulness of Proposed Features

| Proposed Feature | Mean Rating (1-5) |
| --- | --- |
| Task assignment tracking | 4.00 |
| Role-based membership | 4.33 |
| Deadline notifications | 3.67 |
| Project join codes | 4.50 |
| Progress dashboard | 4.33 |
| Contribution history | 4.50 |

Most important feature selections were Member roles (2), Progress analytics (2), Contribution records (1), and Deadline reminders (1).

Open-ended responses commonly highlighted analytics, member roles, and task tracking as useful features. Improvement feedback was minimal, with one response indicating no major changes required.

3.1.2 Functional and Non-functional Requirements

Table 3.1 presents the final functional requirements derived from user needs analysis and validated during iterative prototyping.

Table 3.1 Functional Requirements of GroupTrack

| Functional Requirement | Description |
| --- | --- |
| User Authentication | The system shall allow users to sign up, sign in, and reset passwords securely. |
| Project Creation | The system shall allow users to create a project with title, description, and generated join code. |
| Project Joining via Code | The system shall allow users to join an existing project using a valid join code. |
| Role-based Membership | The system shall assign and manage member roles (leader, researcher, editor, member). |
| Task Creation and Assignment | The system shall allow creation of tasks with title, details, due date, category, and assignee. |
| Task Status Workflow | The system shall support task progression through pending, in-progress, submitted, and completed states. |
| Deadline Notifications | The system shall notify users about due-soon and overdue tasks. |
| File Attachment Support | The system shall support assignment/submission file attachment metadata linked to tasks. |
| Analytics and Progress View | The system shall provide project-level task analytics and completion metrics. |
| Real-time Project Updates | The system shall synchronize project, member, and task changes in real time. |

Table 3.2 presents the non-functional requirements that guided system quality and implementation constraints.

Table 3.2 Non-functional Requirements of GroupTrack

| Non-functional Requirement | Description |
| --- | --- |
| Usability | The interface shall be simple and understandable for student users with minimal onboarding. |
| Performance | Core interactions (project/task updates and page transitions) shall remain responsive under normal classroom use. |
| Reliability | Data operations shall preserve task/project integrity and enforce valid state transitions. |
| Security | Access to project data shall be restricted to authenticated users and authorized members based on role rules. |
| Privacy | The system shall only store user-entered project/task data and shall not monitor browsing history, tabs, or keystrokes. |
| Maintainability | The system shall use modular client components and shared schema validation for easier updates. |
| Portability | The system shall support both web deployment and browser-extension deployment environments. |
| Scalability | Data structures shall support multiple projects, members, and tasks per user through cloud-backed storage. |

3.2 System Design for GroupTrack

This section presents the finalized design artifacts that guided implementation.

3.2.1 Use Case Diagram

The use case model defines how students interact with GroupTrack throughout a project lifecycle. The primary actor is the student user, with core use cases that include authentication, project creation or joining, task management, task submission, role-based review, and analytics viewing.

[Insert Figure 3.2.1 here]

Figure 3.2.1: Use case diagram of GroupTrack showing user interactions for authentication, project management, task workflow, and analytics access.

3.2.2 System Flowchart

The system flow begins with user authentication, followed by navigation to the dashboard where users can create or join projects. Inside each project, users manage tasks, update statuses based on role permissions, and review analytics outputs. Notification checks run continuously for due-soon and overdue tasks.

[Insert Figure 3.2.2 here]

Figure 3.2.2: Flowchart illustrating the overall functionality and user interaction flow of GroupTrack.

3.2.3 Wireframe Design

The low-fidelity wireframes were used to verify layout clarity and interaction flow before final implementation.

3.2.3.1 Login Page

The Login Page wireframe contains authentication controls for sign-in, sign-up, and password recovery.

[Insert Figure 3.2.3.1 here]

Figure 3.2.3.1: Low-fidelity wireframe of the Login Page, providing authentication with sign-in, sign-up, and password reset functionality.

3.2.3.2 Dashboard

The Dashboard wireframe presents the project grid and primary actions for creating and joining projects.

[Insert Figure 3.2.3.2 here]

Figure 3.2.3.2: Low-fidelity wireframe of the Dashboard, showing the project grid with create and join actions.

3.2.3.3 Project Page - Tasks Tab

The Tasks Tab wireframe shows task cards, status progression, due date indicators, and assignment details.

[Insert Figure 3.2.3.3 here]

Figure 3.2.3.3: Low-fidelity wireframe of the Project Page Tasks Tab, showing task lifecycle controls and assignment details.

3.2.3.4 Project Page - Members Tab

The Members Tab wireframe focuses on member list visibility, role labels, and role-management controls for authorized users.

[Insert Figure 3.2.3.4 here]

Figure 3.2.3.4: Low-fidelity wireframe of the Project Page Members Tab, showing team composition and role-based management controls.

3.2.3.5 Project Page - Analytics Tab

The Analytics Tab wireframe presents status distribution, completion metrics, and completion quality indicators.

[Insert Figure 3.2.3.5 here]

Figure 3.2.3.5: Low-fidelity wireframe of the Project Page Analytics Tab, showing project progress summaries and completion quality metrics.

3.2.4 Database Schema (Firestore)

The implemented Firestore schema follows a hierarchical structure that separates user profiles from project workspaces while preserving project-specific member and task records.

High-level collections and subcollections are as follows:
1. users/{uid}
2. projects/{projectId}
3. projects/{projectId}/members/{memberId}
4. projects/{projectId}/tasks/{taskId}

Each project document stores project metadata (name, description, creator, join code, status, assignment policy, optional deadline). The members subcollection stores role and participation metadata for each participant. The tasks subcollection stores task metadata, assignee information, due dates, status progression, submission timestamps, approval metadata, and revision tracking.

Security rules enforce authenticated access and role-aware write permissions, ensuring only authorized users can update critical task states and project/member records.

3.2.5 Chrome Local Storage Schema

For extension-specific notifications, GroupTrack uses browser local storage to cache a simplified task dataset required for periodic deadline checks.

Primary key-value structure:
1. grouptrack_tasks (array)

Task objects in local storage include minimal notification fields such as task identifier, title, current status, and due date-time. This schema supports lightweight background processing without duplicating complete project records in the extension context.

3.3 Develop GroupTrack

The development phase translated design outputs into a functioning system through iterative RAD cycles. The final implementation integrates a web application and browser extension workflow.

Major implementation outcomes include:
1. Authentication and access control:
The system supports sign-up, sign-in, and password reset, with protected routes for authenticated access.

2. Dashboard and project lifecycle:
Users can create projects, receive generated join codes, join existing projects, and view all associated projects in a unified dashboard.

3. Role-based member management:
Projects enforce role-aware actions (leader, researcher, editor, member), especially for assignment, approval, and member administration tasks.

4. Task contribution tracking:
Tasks are created and assigned with due dates, categories, and details. Status transitions are controlled by workflow logic (pending -> in progress -> submitted -> completed), enabling auditable contribution records.

5. File-related task evidence:
Task records support assignment, submission, and official file metadata to strengthen proof of individual work outputs.

6. Analytics and visibility:
The analytics module summarizes total tasks, completion rate, status distribution, on-time versus late completion, and recent completed task activity.

7. Notification support:
The system provides due-soon and overdue alerts through browser notifications and extension background checks.

8. Real-time synchronization:
Project, task, and member records are synchronized in real time through cloud database listeners, reducing manual refresh and improving team coordination.

Overall, the development phase achieved the core objective of providing a transparent and role-aware contribution tracking environment suitable for academic group work.

3.4 Deployment

Deployment outputs were prepared for both standalone web access and Chrome extension usage to maximize classroom accessibility.

Web deployment packaging included:
1. Client build generation through Vite.
2. Server build generation for API/static hosting.
3. Environment-based configuration for Firebase and runtime endpoints.

Extension deployment packaging included:
1. Dedicated extension build output.
2. Manifest-based permission and background service worker configuration.
3. Notification and alarm integration for periodic deadline checks.

The selected deployment strategy supports:
1. Web-based usage for users who prefer a standard browser application.
2. Extension-based usage for users who prefer quick access and background reminders inside Chrome.

Final deployment validation included the following checks:
1. Build success verification for web and extension outputs.
2. Authentication and project workflow smoke checks.
3. Notification behavior checks for due-soon and overdue tasks.

Note: Insert final hosting links and release metadata after production deployment.
- [Insert web application URL]
- [Insert extension package/version identifier]
- [Insert release date]

3.5 Testing

Testing was conducted through iterative feature checks, rule validation, and user-facing workflow verification.

3.5.1 Functional Validation

Core functional testing covered:
1. Authentication flow (sign-up, sign-in, password reset).
2. Project creation and joining via code.
3. Member role updates and restrictions.
4. Task creation, assignment, and status transitions.
5. Analytics consistency with task records.
6. Browser/extension notification triggers based on due dates.

3.5.2 Data and Rule Validation

Schema and rule-level validation covered:
1. Shared schema validation for project, member, and task data structures.
2. Firestore security rule enforcement for authenticated and role-based access.
3. Storage rule enforcement for task-related file paths and ownership constraints.

3.5.3 Build and Technical Validation

Technical validation included:
1. Type-checking and compile-time checks across client, server, shared, and extension modules.
2. Build pipeline checks for web and extension artifacts.
3. Post-build smoke tests for core user workflows.

3.5.4 User Evaluation (SUS-Based Questionnaire)

User inspection was performed using guided core tasks and a SUS-based questionnaire distributed through Google Forms.

For this dataset, 6 respondents completed the usability rating items.

Table 3.6 Post-Use Usability Summary

| Metric | Value |
| --- | --- |
| Respondents who completed usability items | 6 |
| Composite mean score across 12 post-use items (1-5) | 4.29 |
| Equivalent percent of maximum score | 85.8% |

Interpretation: The system demonstrated high perceived usability and acceptability for classroom use in the context of developmental evaluation.

Summarized feedback themes:
1. Positive themes: analytics visibility, role-based structure, and task tracking clarity.
2. Improvement themes: minimal requests for additional features in the current sample.

Testing results indicate that GroupTrack satisfied the required core workflows for accountability-oriented group project management, with final refinements guided by observed usability feedback.

3.6 Developmental Research Alignment

This study is developmental research because its primary output is a developed and iteratively refined tool (GroupTrack) designed to address an identified educational problem. The process followed requirement identification, design artifact production, prototype construction, user-informed refinement, and implementation validation.

The chapter results support this classification through:
1. Problem-to-solution mapping from survey findings to system requirements.
2. Design-to-build continuity across use case, flow, wireframe, and schema artifacts.
3. Iterative feature refinement based on functional checks and user feedback.
4. Practical evaluation focused on usability, workflow effectiveness, and classroom applicability.

Therefore, the contribution of this research is both the resulting system artifact and the documented development process used to produce and improve it.

4. Conclusion

The results demonstrate that GroupTrack, as a developmental research output, successfully implemented the targeted features identified during requirements gathering and design. Through RAD-based iterative development, the study produced and refined a functional system that addresses key academic group-work issues, including uneven participation, unclear responsibility, and limited visibility of individual outputs.

By combining role-based task workflows, deadline-aware notifications, and analytics summaries, GroupTrack provides a practical structure for documenting and reviewing contributions in group projects. The dual deployment approach (web and browser extension) also improves accessibility and adoption potential in classroom contexts.

Therefore, the study contributes both a validated software artifact and a documented development process that can guide similar educational tool-development efforts.

5. Limitations of the Study

Despite the achieved outcomes, the study has limitations:
1. Evaluation sample size is limited to a small student cohort.
2. Testing duration is limited to the project period and may not reflect long-term usage patterns.
3. Platform validation is focused primarily on browser-based usage scenarios.
4. Quantitative impact on academic grades and conflict reduction was not measured longitudinally.

In developmental research terms, these limitations indicate that while the artifact is functionally validated for initial use, broader empirical validation across larger and more diverse contexts is still necessary.

6. Recommendations for Future Enhancements

Future development may consider:
1. Instructor or adviser dashboard for oversight and grading support.
2. Automated contribution scoring models based on task history and revision behavior.
3. Expanded reporting exports for documentation and evaluation workflows.
4. Deeper multi-platform support and additional browser compatibility testing.
5. Advanced analytics such as workload balancing and predictive deadline risk.

7. References

[Insert finalized reference entries here based on the citation style required by your institution.]
