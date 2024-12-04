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

  // Parse new hours format
  function parseNewHours() {
    if (!newHoursText.trim()) {
      console.error("No new hours data provided!");
      return [];
    }

    const formattedHours = newHoursText
      .trim()
      .split("\n")
      .map(line => {
        const [day, times] = line.split(/\s(.+)/); // Split into day and time
        const [openTime, closeTime] = times.split("–"); // Split time into open and close
        return { day: day.trim(), openTime: openTime.trim(), closeTime: closeTime.trim() };
      });

    return formattedHours;
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
      if (range.includes("All Days")) return daysOfWeek;
      return range.split(", ").map(day => day.trim());
    };

    const lines = oldHoursText.trim().split("\n");
    let results = [];
    let currentDays = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/(Weekday|All Days|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
        currentDays = expandWeekdayRange(line);
      } else if (line.match(/\d{1,2}:\d{2}(am|pm)/i)) {
        const openTime = line;
        const closeTime = lines[++i].trim(); // Next line is the closing time
        currentDays.forEach(day => {
          results.push({ day, openTime, closeTime });
        });
      }
    }

    return results;
  }

  // Compare New and Old Hours
  function compareHours() {
    const newHours = parseNewHours();
    const oldHours = parseOldHours();
  
    if (!newHours.length || !oldHours.length) {
      setComparisonResult("Please provide valid data for both new and old hours.");
      return;
    }
  
    const dayGroups = [
      { label: "Mon-Sun", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      { label: "Sun-Thu", days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
      { label: "Fri-Sat", days: ["Friday", "Saturday"] },
      { label: "Mon-Thu", days: ["Monday", "Tuesday", "Wednesday", "Thursday"] },
      { label: "Thu-Sat", days: ["Thursday", "Friday", "Saturday"] },
      { label: "Individual Days", days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
    ];
  
    const remarks = [];
    const coveredGroups = new Set();
  
    // Helper: Generate Remark
    function getRemark(openExtended, closeExtended, rangeLabel, newHour, oldHour) {
      if (openExtended && closeExtended) {
        return `Differing Hours (Not Changing): GMB shows that ${rangeLabel} full time is ${newHour.openTime}–${newHour.closeTime} (we have ${oldHour.openTime}–${oldHour.closeTime}). Not changing, as this would extend store hours.`;
      } else if (openExtended) {
        return `Differing Hours (Not Changing): GMB shows that ${rangeLabel} open time is ${newHour.openTime} (we have ${oldHour.openTime}). Not changing, as this would extend store hours.`;
      } else if (closeExtended) {
        return `Differing Hours (Not Changing): GMB shows that ${rangeLabel} end time is ${newHour.closeTime} (we have ${oldHour.closeTime}). Not changing, as this would extend store hours.`;
      }
      return null;
    }
  
    // Process Each Group
    dayGroups.forEach(group => {
      const groupNewHours = newHours.filter(hour => group.days.includes(hour.day));
      const groupOldHours = oldHours.filter(hour => group.days.includes(hour.day));
  
      if (groupNewHours.length && groupOldHours.length) {
        const allSameOpen = groupNewHours.every((newHour, i) => newHour.openTime === groupOldHours[i]?.openTime);
        const allSameClose = groupNewHours.every((newHour, i) => newHour.closeTime === groupOldHours[i]?.closeTime);
  
        const openExtended = !allSameOpen && groupNewHours.some((newHour, i) => newHour.openTime < groupOldHours[i]?.openTime);
        const closeExtended = !allSameClose && groupNewHours.some((newHour, i) => newHour.closeTime > groupOldHours[i]?.closeTime);
  
        if (openExtended || closeExtended) {
          const firstNew = groupNewHours[0];
          const firstOld = groupOldHours[0];
          const remark = getRemark(openExtended, closeExtended, group.label, firstNew, firstOld);
          if (remark) {
            remarks.push(remark);
            coveredGroups.add(group.label);
          }
        }
      }
    });
  
    // Handle Individual Days Not Covered in Groups
    newHours.forEach(newHour => {
      if (![...coveredGroups].some(groupLabel => dayGroups.find(group => group.label === groupLabel)?.days.includes(newHour.day))) {
        const oldHour = oldHours.find(old => old.day === newHour.day);
        if (oldHour) {
          const openExtended = newHour.openTime < oldHour.openTime;
          const closeExtended = newHour.closeTime > oldHour.closeTime;
  
          const remark = getRemark(openExtended, closeExtended, newHour.day, newHour, oldHour);
          if (remark) remarks.push(remark);
        }
      }
    });
  
    setComparisonResult(remarks.join("\n\n"));
  }
  
  
  
  
  return (
    <>
      <div style={{display: "flex", justifyContent:"space-around", alignContent: "center"}}>
      {/* New Hours Input */}
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
      
      {/* Old Hours Input */}
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
      <div>
        <button style={{height: '160px', width: '200px', marginTop:'70px', marginRight: '100px'}} onClick={compareHours}>Compare Hours</button>
      </div>
      </div>
      {/* Compare Button */}

      {/* Comparison Result */}
      <div>
        <h2>Comparison Result</h2>
        <pre style={{fontSize: 'large'}}>{comparisonResult}</pre>
      </div>
    </>
  );
}

export default TextArea;
