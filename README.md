# Mood Tracker Web Application

## 🌟 Overview

This Mood Tracker is a simple yet effective web application designed to help users log their daily moods using intuitive emoji buttons and visualize their emotional patterns over time through a color-coded calendar and a trend graph.

This project was developed as a submission for the CodeCiruit Hackathon by Outlier AI

## ✨ Features

*   **Emoji-Based Mood Input:** Quickly log your mood for the day by selecting from a range of expressive emojis.
*   **Color-Coded Calendar:** View your mood history at a glance. Each day on the calendar is colored according to the mood logged.
*   **Interactive Calendar:**
    *   Navigate through different months.
    *   Click on a day to log or update its mood.
    *   Today's date is highlighted.
*   **Mood Trend Graph:** Visualize your mood fluctuations for the current month with a line graph.
*   **Persistent Storage:** Mood data is saved locally in your browser using `localStorage`, so your entries are preserved between sessions.
*   **Responsive Design:** The application is designed to be usable across different screen sizes.
*   **Reset Data:** Option to clear all saved mood data.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (with Tailwind CSS for styling), Vanilla JavaScript (ES6+)
*   **Storage:** Browser `localStorage`
*   **Graphics:** HTML Canvas API for the mood graph

## 🚀 How to Run Locally / View the Project

1.  **Live Demo:**
    *   You can view the live deployed version here: [Link to your GitHub Pages URL - **ADD THIS LATER AFTER DEPLOYING**]

2.  **Running from Source Code:**
    *   Clone the repository: `git clone https://github.com/Aksh2758/mood-tracker.git`
    *   Navigate to the project directory: `cd mood-tracker`
    *   Open the `index.html` file in your preferred web browser.

## 📝 How to Use

1.  **Log Today's Mood:** On the main input section, click the emoji that best represents your mood for the day.
2.  **Save & View Calendar:** Click the "Go to Calendar" (or similar) button. This saves today's mood and displays the calendar.
3.  **Navigate Calendar:** Use the arrow buttons to move between months.
4.  **Log/Update Past Moods:**
    *   First, select a mood from the top input section.
    *   Then, click on the desired day in the calendar to apply that mood. Clicking again with the same mood selected can clear it (or toggle, depending on implementation).
5.  **View Analysis:** Click the "Show Analysis" button below the calendar to see the mood trend graph for the currently viewed month.
6.  **Reset Data:** If you wish to start over, use the "Reset All Data" button (a confirmation will be required).

## 🔮 Future Enhancements (Ideas)

*   Adding optional notes to mood entries.
*   Implementing activity/trigger tags.
*   Statistics page (e.g., most common mood, mood streaks).
*   "Year in Pixels" view.

---

Thank you for checking out the Mood Tracker!
