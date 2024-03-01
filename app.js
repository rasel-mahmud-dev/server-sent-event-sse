const express = require('express');
const {resolve, join} = require("path");
const app = express();

app.set('view engine', 'ejs');
app.set('views', resolve('views'));
app.use(express.static(resolve("static")))

function sleep(mili = 500) {
    return new Promise((r) => setTimeout(r, mili))
}

app.get('/', (req, res) => {
    res.render('index', {title: 'EJS Example', message: 'Hello, world!'});
});


app.post("/api/upload-batch", async (req, res) => {

    // process big step operation

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});