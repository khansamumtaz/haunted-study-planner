# Requirements Document

## Introduction

The Haunted Study Planner is a Halloween-themed web application that helps students track assignments and deadlines. Each assignment appears as a "spirit to banish"; completing an assignment "banishes" it with a short ghost animation and moves it to a separate "Banished" section, where it can be restored. Each deadline shows a spooky countdown that accounts for both date and time of day, and overdue tasks become "restless ghosts" shown in a distinct group at the top of the list. A dashboard summarizes spirits banished, spirits remaining, and the most urgent spirit. All data is persisted in the browser via `localStorage`, so the app requires no backend, no login, and deploys for free as a static site on Vercel or Netlify.

The application targets the Kiroween 2026 hackathon Costume Contest category, prioritizing a haunting, polished, and memorable user interface built with React + Vite, plain CSS, a gothic Google Font, and a purple-and-orange dark palette. The interface must be responsive on mobile and desktop, and accessible (good contrast, keyboard friendly).

## Glossary

- **Haunted_Study_Planner**: The React + Vite web application that tracks assignments with a Halloween theme.
- **Assignment**: A unit of student work defined by a Title, Subject, Due_Date, and Priority.
- **Title**: A non-empty text string identifying an Assignment.
- **Subject**: A free-text categorization of an Assignment (for example "Math" or "History"), with autocomplete suggestions drawn from previously used Subjects.
- **Due_Date**: A calendar date and time of day by which an Assignment must be completed.
- **Priority**: An urgency level for an Assignment, having one of three values: Low (displayed as "Faint"), Medium (displayed as "Haunting"), or High (displayed as "Terrifying").
- **Spirit**: The Halloween-themed visual representation of an uncompleted, non-overdue Assignment.
- **Banish**: The action of marking an Assignment as completed, accompanied by a Ghost_Animation.
- **Banished_Spirit**: An Assignment that has been marked completed.
- **Banished_Section**: The distinct area of the interface that displays Banished_Spirits, separate from active Spirits.
- **Restore**: The action of returning a Banished_Spirit to an active Spirit.
- **Ghost_Animation**: A short visual effect played when an Assignment is banished.
- **Restless_Ghost**: An uncompleted Assignment whose Due_Date is in the past (an earlier calendar day, or the current day with a time that has already passed).
- **Restless_Group**: The distinct group at the top of the Spirit list that displays Restless_Ghosts, separated from non-overdue Spirits.
- **Deadline_Countdown**: The Halloween-themed text describing the time remaining until a Due_Date (for example "Rises in 2 days").
- **Dashboard**: The summary view showing the count of Banished_Spirits, the count of remaining Spirits, and the Most_Urgent_Spirit.
- **Spirit_Collection**: The complete set of Assignments stored by the application.
- **Most_Urgent_Spirit**: The uncompleted Assignment with the earliest Due_Date (date and time), with ties broken by highest Priority.
- **Local_Storage**: The browser `localStorage` API used to persist the Spirit_Collection.
- **Serializer**: The function that converts the Spirit_Collection into a JSON string for storage.
- **Deserializer**: The function that converts a stored JSON string back into the Spirit_Collection.
- **Reduced_Motion_Setting**: The browser `prefers-reduced-motion` media-query value, indicating the user has requested that the application minimize non-essential motion.
- **Decorative_Animation**: A non-essential visual animation, such as floating, flickering, or parallax effects, that does not convey Assignment information.

## Requirements

### Requirement 1: Manage Assignments

**User Story:** As a student, I want to create, edit, complete, and delete assignments so that I can track all of my coursework.

#### Acceptance Criteria

1. WHEN a user submits a Title, Subject, Due_Date, and Priority, THE Haunted_Study_Planner SHALL create a new Assignment and add the Assignment to the Spirit_Collection.
2. WHEN a user edits an existing Assignment's Title, Subject, Due_Date, or Priority, THE Haunted_Study_Planner SHALL update the Assignment with the new values while preserving the Assignment identity.
3. WHEN a user deletes an Assignment, THE Haunted_Study_Planner SHALL remove the Assignment from the Spirit_Collection.
4. THE Haunted_Study_Planner SHALL require a non-empty Title and a complete Due_Date (date and time of day) before creating or saving an Assignment.
5. IF a user attempts to save an Assignment with an empty Title or an incomplete Due_Date (missing date or time), THEN THE Haunted_Study_Planner SHALL reject the save and display a validation message.
6. WHERE the Priority field is left unset, THE Haunted_Study_Planner SHALL default the Priority to Medium.
7. WHERE a user enters a Subject, THE Haunted_Study_Planner SHALL suggest previously used Subjects as autocomplete options.
8. THE Haunted_Study_Planner SHALL display the Priority of each Assignment using the themed names "Faint" for Low, "Haunting" for Medium, and "Terrifying" for High.

### Requirement 2: Banish Spirits with a Ghost Animation

**User Story:** As a student, I want to complete assignments by "banishing" them with a ghost animation so that finishing work feels rewarding and on theme, and to undo a banishing when I make a mistake.

#### Acceptance Criteria

1. WHEN a user completes an Assignment, THE Haunted_Study_Planner SHALL mark the Assignment as a Banished_Spirit, play a Ghost_Animation, and move the Assignment to the Banished_Section.
2. THE Ghost_Animation SHALL complete within 2 seconds.
3. WHILE a Ghost_Animation is playing, THE Haunted_Study_Planner SHALL keep the Assignment visible and then transition the Assignment to the banished state.
4. WHEN a Ghost_Animation finishes, THE Haunted_Study_Planner SHALL persist the completed state to Local_Storage.
5. THE Haunted_Study_Planner SHALL display Banished_Spirits in the Banished_Section, which is distinct from the active Spirit list.
6. WHEN a user restores a Banished_Spirit, THE Haunted_Study_Planner SHALL return the Assignment to an active Spirit, remove the Assignment from the Banished_Section, and persist the change.

### Requirement 3: Spooky Deadline Countdown

**User Story:** As a student, I want a Halloween-themed countdown for each deadline so that I can see at a glance how much time remains before work is due, and so I can spot overdue work immediately.

#### Acceptance Criteria

1. THE Haunted_Study_Planner SHALL display a Deadline_Countdown for each uncompleted Assignment based on the gap between the current date-time and the Due_Date (date and time of day).
2. WHEN the Due_Date is on a future calendar day, THE Haunted_Study_Planner SHALL display the Deadline_Countdown as "Rises in N days", where N is the number of calendar days between the current date and the Due_Date.
3. WHEN the Due_Date is on the current calendar day and the Due_Date time has not yet passed, THE Haunted_Study_Planner SHALL display the Deadline_Countdown as "Rises tonight" alongside the time of day.
4. WHEN an uncompleted Assignment's Due_Date is in the past (an earlier calendar day, or the current day with a time that has already passed), THE Haunted_Study_Planner SHALL reclassify the Assignment as a Restless_Ghost and display a "Restless" indicator.
5. THE Haunted_Study_Planner SHALL display Restless_Ghosts in the Restless_Group at the top of the Spirit list, separated from non-overdue Spirits.
6. FOR ALL uncompleted Assignments whose Due_Date is on a future calendar day, the displayed day count N SHALL equal the number of calendar days between the current date and the Due_Date.

### Requirement 4: Dashboard Summary

**User Story:** As a student, I want a dashboard summarizing my spirits so that I can quickly grasp my overall workload and the most urgent task.

#### Acceptance Criteria

1. THE Haunted_Study_Planner SHALL display a Dashboard showing the count of Banished_Spirits and the count of remaining uncompleted Spirits.
2. THE Haunted_Study_Planner SHALL identify the Most_Urgent_Spirit as the uncompleted Assignment with the earliest Due_Date and display the Most_Urgent_Spirit's Title and Deadline_Countdown on the Dashboard.
3. WHEN two or more uncompleted Assignments share the same earliest Due_Date, THE Haunted_Study_Planner SHALL select the Most_Urgent_Spirit as the one with the highest Priority.
4. WHEN no uncompleted Assignments remain, THE Haunted_Study_Planner SHALL display a "No spirits haunt you" message on the Dashboard.
5. WHEN the Spirit_Collection changes, THE Haunted_Study_Planner SHALL refresh the Dashboard counts and Most_Urgent_Spirit to reflect the updated state.

### Requirement 5: Local Storage Persistence

**User Story:** As a student, I want my assignments saved in my browser so that they persist across sessions without requiring a login.

#### Acceptance Criteria

1. WHEN the Spirit_Collection changes, THE Haunted_Study_Planner SHALL serialize the collection with the Serializer and save the result to Local_Storage.
2. WHEN the application loads, THE Haunted_Study_Planner SHALL load the stored data from Local_Storage and reconstruct the Spirit_Collection with the Deserializer.
3. IF Local_Storage contains no saved data, THEN THE Haunted_Study_Planner SHALL start with an empty Spirit_Collection.
4. IF the stored data is missing required fields or fails to deserialize, THEN THE Haunted_Study_Planner SHALL discard the corrupted data and start with an empty Spirit_Collection.
5. FOR ALL valid Spirit_Collections, serializing with the Serializer and then deserializing with the Deserializer SHALL produce an equivalent Spirit_Collection (round-trip property).

### Requirement 6: Halloween Visual Theme and Accessibility

**User Story:** As a student, I want a polished, spooky, accessible interface so that the app is pleasant and usable on any device.

#### Acceptance Criteria

1. THE Haunted_Study_Planner SHALL apply a dark theme using a purple and orange color palette.
2. THE Haunted_Study_Planner SHALL load a gothic typeface from Google Fonts for headings and body text.
3. WHILE the application is displayed, THE Haunted_Study_Planner SHALL maintain a color contrast ratio of at least 4.5:1 between text and background for all text content.
4. THE Haunted_Study_Planner SHALL allow every interactive control to be reached and operated using the keyboard alone.
5. THE Haunted_Study_Planner SHALL display a visible focus indicator on every focusable control.
6. WHERE the viewport width is a mobile size, THE Haunted_Study_Planner SHALL reflow the layout to remain usable without horizontal scrolling.

### Requirement 7: Free Static Deployment

**User Story:** As a developer, I want the app to deploy for free on Vercel or Netlify so that I can share it during the hackathon.

#### Acceptance Criteria

1. THE Haunted_Study_Planner SHALL build to a static bundle using Vite that requires no backend server.
2. WHEN deployed to Vercel or Netlify, THE Haunted_Study_Planner SHALL load and function using static hosting alone, relying on Local_Storage for all data.

### Requirement 8: Automatic Refresh of Countdowns and Restless Classification

**User Story:** As a student, I want deadline countdowns and overdue classifications to update automatically while the app is open, so that I always see accurate time remaining and restless spirits without reloading the page.

#### Acceptance Criteria

1. WHILE the Haunted_Study_Planner is open, THE Haunted_Study_Planner SHALL recalculate every Deadline_Countdown at least once per minute without reloading the page.
2. WHILE the Haunted_Study_Planner is open, THE Haunted_Study_Planner SHALL re-evaluate Restless_Ghost classification for every uncompleted Assignment at least once per minute without reloading the page.
3. FOR ALL uncompleted Assignments, after each periodic refresh THE Haunted_Study_Planner SHALL classify the Assignment as a Restless_Ghost if and only if the Assignment's Due_Date is earlier than the current date and time.

### Requirement 9: Reduced-Motion Accommodation

**User Story:** As a student sensitive to motion, I want animations reduced when my system requests it, so that I can use the Haunted_Study_Planner comfortably without distracting or uncomfortable motion.

#### Acceptance Criteria

1. WHERE the Reduced_Motion_Setting is enabled, THE Haunted_Study_Planner SHALL either suppress the Ghost_Animation or replace the Ghost_Animation with a simple fade transition.
2. WHERE the Reduced_Motion_Setting is enabled, THE Haunted_Study_Planner SHALL either suppress all Decorative_Animations or replace all Decorative_Animations with a simple fade transition.
3. WHERE the Reduced_Motion_Setting is enabled, WHEN a user completes an Assignment, THE Haunted_Study_Planner SHALL mark the Assignment as a Banished_Spirit and persist the completed state to Local_Storage.
