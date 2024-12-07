import React, { useState } from "react";
import "../App.css";

function TextArea() {
  const [newHoursText, setNewHoursText] = useState("");
  const [oldHoursText, setOldHoursText] = useState("");
  const [comparisonResult, setComparisonResult] = useState([]);

  // Handle change for new hours input

  // Compare New and Old Hours
  let remarks = [];
function compareTimes(a, b) {
    // Loop through all days and compare open and close times

    for (let i = 0; i < a.length; i++) {
        let aDay = a[i];
        let bDay = b[i];

        if (!aDay || !bDay) {
            remarks.push(`${aDay.day} not found in one of the arrays.`);
            continue;
        }

        // Compare open and close times
        let openTimeExtending = new Date(`01/01/2000 ${bDay.openTime}`) < new Date(`01/01/2000 ${aDay.openTime}`);
        let closeTimeExtending = new Date(`01/01/2000 ${bDay.closeTime}`) > new Date(`01/01/2000 ${aDay.closeTime}`);
        let openTimeReducing = new Date(`01/01/2000 ${bDay.openTime}`) > new Date(`01/01/2000 ${aDay.openTime}`);
        let closeTimeReducing = new Date(`01/01/2000 ${bDay.closeTime}`) < new Date(`01/01/2000 ${aDay.closeTime}`);

        if (openTimeReducing && closeTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(Full Day): From ${aDay.openTime}-${aDay.closeTime} to ${bDay.openTime}-${bDay.closeTime}.\n`);
        } else if (openTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(Opening Time): From ${aDay.openTime} to ${bDay.openTime}.\n`);
        } else if (closeTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(End Time): From ${aDay.closeTime} to ${bDay.closeTime}.\n`);
        } else if (openTimeExtending && closeTimeExtending) {
            remarks.push(`Extend - ${aDay.day} full time is ${bDay.openTime} - ${bDay.closeTime} (We have ${aDay.openTime} - ${aDay.closeTime}).\n`);
        } else if (openTimeExtending) {
            remarks.push(`Extend - ${aDay.day} open time is ${bDay.openTime} (We have ${aDay.openTime}).\n`);
        } else if (closeTimeExtending) {
            remarks.push(`Extend - ${aDay.day} end time is ${bDay.closeTime} (We have ${aDay.closeTime}).\n`);
        } 
        // else if (openTimeExtending && closeTimeReducing) {
        //     // Only open time is extending, and close time is reducing
        //     remarks.push(`${aDay.day} open time is ${bDay.openTime} (We have ${aDay.openTime}), Reducing - Monday(End Time): From ${aDay.closeTime} to ${bDay.closeTime}.`);
        // } else if (openTimeReducing && closeTimeExtending) {
        //     // Only close time is extending, and open time is reducing
        //     remarks.push(`${aDay.day} end time is ${bDay.closeTime} (We have ${aDay.closeTime}).`);
        // }
        //  else if (!openTimeExtending && !closeTimeExtending && !openTimeReducing && !closeTimeReducing) {
        //     // No changes, no remarks
        //     remarks.push(`${aDay.day} - No Change in Hours.`);
        // }
    }

    // Return remarks for all days
    return remarks.length > 0 ? remarks.join(" ") : "No changes in hours.";
}

// Example arrays
let a = [
    { day: 'Monday', openTime: '11:00 AM', closeTime: '9:00 PM' },
    { day: 'Tuesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
    { day: 'Wednesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
];
let b = [
    { day: 'Monday', openTime: '11:00 AM', closeTime: '9:00 PM' },
    { day: 'Tuesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
    { day: 'Wednesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
];

// Call the function
let result = compareTimes(a, b);
console.log(result);

  return (
    <div className="container">
      <div className="inputs">
        <div>
          <h2>New Hours</h2>
          <textarea
            onChange={handleNewHoursChange}
            value={newHoursText}
            cols="50"
            placeholder="Enter new hours here (e.g., Monday 11:00 AM–9:00 PM)"
            rows={10}
          ></textarea>
        </div>

        <div>
          <h2>Old Hours</h2>
          <textarea
            onChange={handleOldHoursChange}
            value={oldHoursText}
            cols="50"
            placeholder="Enter old hours here (e.g., All Days 10:00 AM–8:00 PM)"
            rows={10}
          ></textarea>
        </div>
      </div>

      <div className="button-container">
        <button onClick={compareTimes}>Compare Hours</button>
      </div>

      <h2>Result</h2>
      <pre>{JSON.stringify(comparisonResult, null, 2)}</pre>
    </div>
  );
}

export default TextArea;