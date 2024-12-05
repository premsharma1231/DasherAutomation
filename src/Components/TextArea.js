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

  // Helper: Format time to 12-hour format
function formatTime(time) {
    try {
      const [hour, minute] = time
        .replace(/[^\d:]/g, "") // Remove non-numeric/non-colon characters
        .split(":")
        .map(Number);

      const date = new Date();
      date.setHours(hour, minute || 0);

      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
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

    const formattedHours = newHoursText
      .trim()
      .split("\n")
      .map(line => {
        const [day, times] = line.split(/\s(.+)/); // Split into day and time
        const [openTime, closeTime] = times.split("–"); // Split time into open and close
        return {
          day: day.trim(),
          openTime: formatTime(openTime.trim()),
          closeTime: formatTime(closeTime.trim()),
        };
      });

    console.log(formattedHours);
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
      if (range.includes("weekend")) return ["Saturday", "Sunday"];
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
        const openTime = formatTime(line);
        const closeTime = formatTime(lines[++i].trim()); // Next line is the closing time
        currentDays.forEach(day => {
          results.push({ day, openTime, closeTime });
        });
      }
    }

    console.log(results);
    return results;
  }

  // Remaining code (compareHours, rendering, etc.) remains the same...}
  // Helper: Generate remark
  function getRemark(openExtended, closeExtended, rangeLabel, newHour, oldHour, noChange = false) {
    let remarks = [];

    if (noChange) {
      remarks.push(`${rangeLabel} - No Change in Hours.`);
      return remarks;
    }

    if (openExtended) {
      remarks.push(
        `Differing Hours (Not Changing): GMB shows that ${rangeLabel} open time is ${newHour.openTime} (we have ${oldHour.openTime}). Not changing, as this would extend store hours.`
      );
    }

    if (closeExtended) {
      remarks.push(
        `Differing Hours (Not Changing): GMB shows that ${rangeLabel} end time is ${newHour.closeTime} (we have ${oldHour.closeTime}). Not changing, as this would extend store hours.`
      );
    }

    return remarks;
  }

  // Compare New and Old Hours
  function compareHours() {
    const newHours = parseNewHours();
    const oldHours = parseOldHours();
  
    if (!newHours.length || !oldHours.length) {
      setComparisonResult("Please provide valid data for both new and old hours.");
      return;
    }
  
    const remarks = [];
  
    // Iterate through all days in new and old hours
    newHours.forEach((newHour, index) => {
      const oldHour = oldHours.find((oh) => oh.day === newHour.day);
      if (!oldHour) {
        remarks.push(`No matching old hours found for ${newHour.day}.`);
        return;
      }
  
      // Compare open times
      if (newHour.openTime !== oldHour.openTime) {
        const openExtended = newHour.openTime < oldHour.openTime;
        if (openExtended) {
          remarks.push(
            `Differing Hours (Not Changing): GMB shows that ${newHour.day} open time is ${newHour.openTime} (we have ${oldHour.openTime}). Not changing, as this would extend store hours.`
          );
        }
      }
  
      // Compare close times
      if (newHour.closeTime !== oldHour.closeTime) {
        const closeExtended = newHour.closeTime > oldHour.closeTime;
        if (closeExtended) {
          remarks.push(
            `Differing Hours (Not Changing): GMB shows that ${newHour.day} end time is ${newHour.closeTime} (we have ${oldHour.closeTime}). Not changing, as this would extend store hours.`
          );
        }
      }
  
      // Compare full-time hours (both open and close)
      if (
        newHour.openTime !== oldHour.openTime &&
        newHour.closeTime !== oldHour.closeTime
      ) {
        remarks.push(
          `Differing Hours (Not Changing): GMB shows that ${newHour.day} full time is ${newHour.openTime}–${newHour.closeTime} (we have ${oldHour.openTime}–${oldHour.closeTime}). Not changing, as this would extend store hours.`
        );
      }
    });
  
    // Set the remarks as the comparison result
    setComparisonResult(remarks.join("\n\n"));
  }
  
  // function compareHours() {
  //   const newHours = parseNewHours();
  //   const oldHours = parseOldHours();

  //   if (!newHours.length || !oldHours.length) {
  //     setComparisonResult("Please provide valid data for both new and old hours.");
  //     return;
  //   }

  //   const allSameHours = newHours.every((newHour, index) => {
  //     const oldHour = oldHours[index];
  //     return (
  //       newHour.day === oldHour.day &&
  //       newHour.openTime === oldHour.openTime &&
  //       newHour.closeTime === oldHour.closeTime
  //     );
  //   });

  //   if (allSameHours) {
  //     setComparisonResult("No change in Hours.");
  //     return;
  //   }

  //   const dayGroups = [
  //     { label: "Mon-Sun", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
  //     { label: "Sun-Thu", days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
  //     { label: "Fri-Sat", days: ["Friday", "Saturday"] },
  //     { label: "Mon-Thu", days: ["Monday", "Tuesday", "Wednesday", "Thursday"] },
  //     { label: "Mon", days: ["Monday"] },
  //     { label: "Tue", days: ["Tuesday"] },
  //     { label: "Wed", days: ["Wednesday"] },
  //     { label: "Thu", days: ["Thursday"] },
  //     { label: "Fri", days: ["Friday"] },
  //     { label: "Sat", days: ["Saturday"] },
  //     { label: "Sun", days: ["Sunday"] }
  //   ];

  //   const remarks = [];
  //   const coveredGroups = new Set();

  //   dayGroups.forEach(group => {
  //     const groupNewHours = newHours.filter(hour => group.days.includes(hour.day));
  //     const groupOldHours = oldHours.filter(hour => group.days.includes(hour.day));

  //     if (groupNewHours.length && groupOldHours.length) {
  //       const allSameOpen = groupNewHours.every((newHour, i) => newHour.openTime === groupOldHours[i]?.openTime);
  //       const allSameClose = groupNewHours.every((newHour, i) => newHour.closeTime === groupOldHours[i]?.closeTime);

  //       const openExtended = !allSameOpen && groupNewHours.some((newHour, i) => newHour.openTime < groupOldHours[i]?.openTime);
  //       const closeExtended = !allSameClose && groupNewHours.some((newHour, i) => newHour.closeTime > groupOldHours[i]?.closeTime);

  //       if (allSameOpen && allSameClose && !openExtended && !closeExtended) {
  //         const groupRemarks = getRemark(openExtended, closeExtended, group.label, groupNewHours[0], groupOldHours[0], true);
  //         remarks.push(...groupRemarks);
  //       } else {
  //         const firstNew = groupNewHours[0];
  //         const firstOld = groupOldHours[0];
  //         const groupRemarks = getRemark(openExtended, closeExtended, group.label, firstNew, firstOld);
  //         remarks.push(...groupRemarks);
  //       }
  //       coveredGroups.add(group.label);
  //     }
  //   });

  //   setComparisonResult(remarks.join("\n\n"));
  // }


  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignContent: "center",
        }}
      >
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

        <div>
          <button
            style={{
              height: "160px",
              width: "200px",
              marginTop: "70px",
              marginRight: "100px",
            }}
            onClick={compareHours}
          >
            Compare Hours
          </button>
        </div>
      </div>

      <h2>Result</h2>
      <pre>{comparisonResult}</pre>
    </>
  );
}

export default TextArea;
