import React, { useState } from "react";

function CompareHours() {
  const [gmbHours, setGmbHours] = useState("");
  const [currentHours, setCurrentHours] = useState("");

  // Function to parse input hours into structured objects
  function parseHours(input) {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const expandRange = (range) => {
      if (range.includes("Mon-Sun")) return daysOfWeek;
      if (range.includes("Sun-Thu")) return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
      if (range.includes("Fri-Sat")) return ["Friday", "Saturday"];
      if (range.includes("Mon-Thu")) return ["Monday", "Tuesday", "Wednesday", "Thursday"];
      return range.split(", ").map(day => day.trim());
    };

    const lines = input.trim().split("\n");
    let results = [];
    let currentDays = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i)) {
        currentDays = expandRange(line);
      } else if (line.match(/\d{1,2}:\d{2}(am|pm)/i)) {
        const openTime = line;
        const closeTime = lines[++i].trim();
        currentDays.forEach(day => {
          results.push({ day, openTime, closeTime });
        });
      }
    }

    return results;
  }

  // Function to compare hours and generate remarks
  function compareHours() {
    const gmbParsed = parseHours(gmbHours);
    const currentParsed = parseHours(currentHours);

    let remarks = gmbParsed.map(gmbDay => {
      const currentDay = currentParsed.find(day => day.day === gmbDay.day);
      if (!currentDay) {
        return `${gmbDay.day}: No Current Hours Provided`;
      }

      let remark = `${gmbDay.day}: `;
      if (gmbDay.openTime < currentDay.openTime) {
        remark += "Start Time Extended. ";
      }
      if (gmbDay.closeTime > currentDay.closeTime) {
        remark += "End Time Extended. ";
      }
      if (gmbDay.openTime >= currentDay.openTime && gmbDay.closeTime <= currentDay.closeTime) {
        remark += "No Change in Hours.";
      }
      return remark;
    });

    console.log(remarks);
  }

  return (
    <div>
      <h1>Compare Hours</h1>
      <textarea
        placeholder="Enter GMB Hours"
        value={gmbHours}
        onChange={(e) => setGmbHours(e.target.value)}
        rows={10}
        cols={50}
      />
      <textarea
        placeholder="Enter Current Hours"
        value={currentHours}
        onChange={(e) => setCurrentHours(e.target.value)}
        rows={10}
        cols={50}
      />
      <button onClick={compareHours}>Compare</button>
    </div>
  );
}

export default CompareHours;
