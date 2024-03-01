![](https://ik.imagekit.io/rwx12mtuk/portfolio-blogs/EVENT.webp)

### What are Server-Sent Events (SSE)?

Server-Sent Events (SSE) is a standard mechanism for pushing real-time updates from a server to a web client over a single, long-lived HTTP connection. SSE is often used in scenarios where real-time information needs to be sent from the server to the client without the client needing to continuously poll the server for updates.

### Key Features of SSE:

- **Simple Setup**: SSE is easy to implement and only requires standard HTTP connections.
- **Unidirectional Communication**: SSE allows the server to push data to the client without requiring any action from the client.
- **Text-Based**: SSE sends data as plain text, making it easy to understand and implement. we can send any array of object using JSON format.

### Introduction:

In this tutorial, we'll explore how to utilize Server-Sent Events (SSE) to enhance the user experience during batch uploads in a web application. We'll address the common challenge of users being left in the dark about the progress of their uploads, leading to frustration and uncertainty. By implementing SSE, we'll enable real-time visualization of backend tasks, providing users with transparency and satisfaction.

### Project DEMO:

![](https://ik.imagekit.io/rwx12mtuk/portfolio-blogs/Peek%202024-03-01%2012-13.gif)


### Repository: 
https://github.com/rasel-mahmud-dev/server-sent-event-sse


Recently, I built a project where a large Excel file was uploaded to the backend. The backend handled various tasks, including uploading thousands of areas, departments, designations, creating employee accounts, uploading employee schedules, onboarding driver lists, and assigning cars.

All of these tasks occurred at the same route endpoint.

However, the problem was that clients didn't know what was happening in the backend, and they had to wait for 2 to 5 minutes for the entire process to complete.

After implementing SSE events, clients can now visualize each step of the process in the UI, providing them with more user experience and satisfaction.

### Implementation of SSE:

To address this challenge, we'll implement Server-Sent Events (SSE) in our project. SSE allows the server to send real-time updates to the client, enabling users to visualize each step of the backend process directly in the user interface.

### **Prerequisites:**

- Basic knowledge of HTML, CSS, JavaScript, and Node.js.
- An understanding of Express.js for server-side development.

### **Step 1: Set Up the Server**

First, let's set up the server using Express.js:

```jsx
const express = require('express');
const { resolve } = require("path");
const app = express();

app.set('view engine', 'ejs');
app.set('views', resolve('views'));
app.use(express.static(resolve("static")));

function sleep(mili = 500) {
    return new Promise((r) => setTimeout(r, mili))
}

// Your SSE logic goes here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

```

### **Step 2: Implement SSE Endpoint (Server side)**

Define an SSE endpoint on the server to send progress updates:

```jsx

app.get('/api/events', async (req, res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const waitForEvent = () => {
        return new Promise(resolve => {
            const checkEvent = () => {
                const eventName = req.app.locals.eventName;
                res.write(`data: ${eventName}\n\n`);
                if (eventName === "COMPLETED") {
                    res.end();
                    resolve();
                } else {
                    setTimeout(checkEvent, 200);
                }
            };

            checkEvent();
        });
    };

    await waitForEvent();

    return res.end();
});

```

### **Step 3: Set Up Multi Step Task endpoint**

Implement the logic to send SSE updates during the batch upload process:

```jsx
app.post("/api/upload-batch", async (req, res) => {

    // process time consuming multi step operations

    const locals = req.app.locals

    locals.eventName = "UPLOADING_AREA"

    await sleep()
    locals.eventName = "UPLOADING_DEPARTMENT"

    await sleep()
    locals.eventName = "UPLOADING_DESIGNATION"

    await sleep()
    locals.eventName = "UPLOADING_EMPLOYEE"

    await sleep()
    locals.eventName = "UPLOADING_SCHEDULE"

    await sleep()
    locals.eventName = "UPLOADING_DRIVERS"

    await sleep()
    locals.eventName = "UPLOADING_ASSIGN_CAR"

    await sleep()
    locals.eventName = "COMPLETED"

})
```

### **Step 4: Create the Frontend UI**

Create an HTML file with JavaScript to handle SSE updates:

```html
<div class="control">
        <button onclick="onStartProgress()">Start Upload</button>
        <button onclick="onResetProgress()">Reset</button>
 </div>

  <ol class="stepper">
      <li data-id="UPLOADING_AREA">
          <span>UPLOADING AREA</span>
      </li>
      <li data-id="UPLOADING_DEPARTMENT">
          <span>UPLOADING DEPARTMENT</span>
      </li>
      <li data-id="UPLOADING_DESIGNATION">
          <span>UPLOADING DESIGNATION</span>
      </li>
      <li data-id="UPLOADING_EMPLOYEE">
          <span>UPLOADING EMPLOYEE</span>
      </li>
      <li data-id="UPLOADING_SCHEDULE">
          <span>UPLOADING SCHEDULE</span>
      </li>
      <li data-id="UPLOADING_DRIVERS">
          <span>UPLOADING DRIVERS</span>
      </li>
      <li data-id="UPLOADING_ASSIGN_CAR">
          <span>UPLOADING ASSIGN CAR</span></li>
      <li data-id="COMPLETED">
          <span>COMPLETED</span>
      </li>
  </ol>
```

### **Step 5: Implement SSE JavaScript Logic**

Add JavaScript code to initiate SSE connection and update UI:

```jsx

    let eventSource;
    const stepper = document.querySelectorAll(".stepper li")

    async function uploadBatchTask(){
        try{
            const formData = new FormData()
            formData.append("file", 'some_large_xlsx.xlsx')
            const res = await fetch("/api/upload-batch", {
                method: "POST",
                headers: {},
                body: formData
            })
            const data = await res.json()
        } catch (ex){
            // handle error
        }
    }

    function onStartProgress() {
        // reset ui active steps...
        resetUI()
        uploadBatchTask()

        eventSource = new EventSource('/api/events');
        eventSource.onmessage = function (event) {
            const evtData = event.data
            for (let step of stepper) {
                const id = step.dataset.id

                // Update UI step
                if (evtData.startsWith(id)) {
                    step.classList.add("active")
                }

            }

            if (evtData === "COMPLETED") {
                // Terminating SSE communication
                eventSource.close();
            }
        };

        eventSource.onerror = function(error) {
            console.error("EventSource failed:", error);
            eventSource.close();
        };
    }

    function resetUI(){
        for (let step of stepper) {
            step.classList.remove("active")
        }
    }

    function onResetProgress(){
        resetUI()
        eventSource?.close();
    }

```

**Terminating SSE communication**

`eventSource.close()`

### WebSocket vs SSE:

WebSocket and SSE serve different purposes and have different characteristics. WebSocket is suitable for applications requiring bidirectional communication and low latency, while SSE is ideal for unidirectional server-to-client communication, such as sending periodic updates or notifications.

### **Conclusion:**

Server-Sent Events (SSE) provide a simple and efficient way to push real-time updates from the server to the client. In your project, SSE is utilized to provide live progress updates during a batch upload process, allowing users to monitor the progress without continuously polling the server. This enhances the user experience by providing real-time feedback and transparency during long-running processes.