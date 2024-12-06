import React, { useState } from "react";
import "../App.css";

function TextArea() {
  const [newHoursText, setNewHoursText] = useState("");
  const [oldHoursText, setOldHoursText] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");

  // Handle change for new hours input
  function handleNewHoursChange(e) {
    setNewHoursText(e.target.value);
  }

  // Handle change for old hours input
  function handleOldHoursChange(e) {
    setOldHoursText(e.target.value);
  }

  // Helper: Format time to 24-hour format
  function formatTime(time) {
    try {
      const [timePart, period] = time.trim().split(/\s?(am|pm)$/i); // Split by AM/PM
      let [hours, minutes] = timePart.split(":").map(Number);

      if (period === "pm" && hours < 12) hours += 12;  // Convert PM hours to 24-hour format
      if (period === "am" && hours === 12) hours = 0;  // Handle 12 AM case

      return new Date(2000, 0, 1, hours, minutes).getTime(); // Return time in milliseconds
    } catch (error) {
      console.error("Error formatting time:", time);
      return time; // Return original time if formatting fails
    }
  }

  // Parse new hours format
  function parseNewHours() {
    if (!newHoursText.trim()) {
      console.error("No new hours data provided!");
      return [];
    }

    return newHoursText.trim().split("\n").map((line) => {
      const [day, times] = line.split(/\s(.+)/);
      const [openTime, closeTime] = times.split("–");
      return {
        day: day.trim(),
        openTime: formatTime(openTime.trim()),
        closeTime: formatTime(closeTime.trim()),
      };
    });
  }

  // Parse old hours format
  function parseOldHours() {
    if (!oldHoursText.trim()) {
      console.error("No old hours data provided!");
      return [];
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const expandWeekdayRange = (range) => {
      if (range.includes("Weekday")) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      if (range.includes("weekend")) return ["Saturday", "Sunday"];
      if (range.includes("All Days")) return daysOfWeek;
      return range.split(", ").map((day) => day.trim());
    };

    const lines = oldHoursText.trim().split("\n");
    let results = [];
    let currentDays = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/(Weekday|All Days|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
        currentDays = expandWeekdayRange(line);
      } else if (line.match(/\d{1,2}:\d{2}(am|pm)/i)) {
        const openTime = formatTime(line);
        const closeTime = formatTime(lines[++i].trim());
        currentDays.forEach((day) => {
          results.push({ day, openTime, closeTime });
        });
      }
    }
    return results;
  }

  // Compare New and Old Hours
  function compareTimes() {
    const newHours = parseNewHours();
    const oldHours = parseOldHours();
    console.log(newHours);
    console.log(oldHours);

    let remarks = [];

    newHours.forEach((aDay) => {
      const bDay = oldHours.find((b) => b.day === aDay.day);
      if (bDay) {
        const openTimeExtending = bDay.openTime < aDay.openTime;
        const closeTimeExtending = bDay.closeTime > aDay.closeTime;
        const openTimeReducing = bDay.openTime > aDay.openTime;
        const closeTimeReducing = bDay.closeTime < aDay.closeTime;

        if (openTimeExtending && closeTimeExtending) {
          remarks.push(`${aDay.day} full time is extending. New full time: ${aDay.openTime} - ${aDay.closeTime} (old full time: ${bDay.openTime} - ${bDay.closeTime}).`);
        } else if (openTimeExtending && closeTimeReducing) {
          remarks.push(`${aDay.day} open time is extending. New open time: ${aDay.openTime} (old open time: ${bDay.openTime}).`);
        } else if (openTimeReducing && closeTimeExtending) {
          remarks.push(`${aDay.day} end time is extending. New end time: ${aDay.closeTime} (old end time: ${bDay.closeTime}).`);
        } else if (openTimeReducing && closeTimeReducing) {
          remarks.push(`${aDay.day} full time is reducing. New full time: ${aDay.openTime} - ${aDay.closeTime} (old full time: ${bDay.openTime} - ${bDay.closeTime}).`);
        } else {
          remarks.push(`${aDay.day} timings are unchanged.`);
        }
      }
    });

    setComparisonResult(remarks.length > 0 ? remarks.join(" ") : "No changes detected for the week.");
  }

  return (
    <div className="container">
      <div className="inputs">
        <div>
          <h2>New Hours</h2>
          <textarea
            onChange={handleNewHoursChange}
            value={newHoursText}
            cols="50"
            placeholder="Enter new hours here (e.g., Monday 12 pm–12 am)"
            rows={10}
          ></textarea>
        </div>

        <div>
          <h2>Old Hours</h2>
          <textarea
            onChange={handleOldHoursChange}
            value={oldHoursText}
            cols="50"
            placeholder="Enter old hours here (e.g., All Days 11:00am 10:50pm)"
            rows={10}
          ></textarea>
        </div>
      </div>

      <div className="button-container">
        <button onClick={compareTimes}>Compare Hours</button>
      </div>

      <h2>Result</h2>
      <pre>{comparisonResult}</pre>
    </div>
  );
}

export default TextArea;
