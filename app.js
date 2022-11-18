"use strict;"
const express = require("express");

const app = express();

const createError = require('http-errors');

const morgan = require('morgan');

const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 8080;

app.use(express.json({
    limit: "50mb",
    type: 'application/json'
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

app.set("views", path.join(__dirname, "/views/"));

app.set("view engine", "ejs");

//  http://localhost:8080/  

app.get("/", (req, res) => {

    res.render("timer")

});

app.post("/getTimer", async function (req, res, next) {
    try {
        let { startTime, endTime } = req.body;
         if(startTime > endTime) throw createError.BadRequest('star time should be less than end time ');
        let regex = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm;
        
        if (!startTime?.trim().match(regex) || !endTime?.trim().match(regex)) throw createError.BadRequest('time formart does not match');

        let magicalTimearr = await printMagicalTime(startTime.toString(), endTime.toString());

        if (magicalTimearr.length) return res.status(200).json({
            code: 200,
            data: magicalTimearr
        })

        return res.status(400).json({
            code: 400,
            message: 'No magical number found!'
        })
    } catch (e) {
        next(e)
    }

});

function printMagicalTime(startTime, endTime) {
    return new Promise((resolve, reject) => {
        try {
            const magicalTimearr = [];
            let startHH = startTime.split(":")[0];
            let startMM = startTime.split(":")[1];
            let startSS = startTime.split(":")[2];

            const myInterval = setInterval(() => {
                if (startTime != endTime) {
                    if (startSS == 59) {
                        if (startMM == 59 && startSS == 59) {
                            startHH++;
                            startMM = 0;
                        } else {
                            startMM++;
                        }
                        startSS = 0;
                    } else {
                        startSS++;
                    }

                    if (startSS.toString().length == 1) startSS = "0" + startSS;
                    if (startMM.toString().length == 1) startMM = "0" + startMM;
                    if (startHH.toString().length == 1) startHH = "0" + startHH;
                    startTime = `${startHH}:${startMM}:${startSS}`;
                    const arr = [];
                    startTime.split(":").join("").split("").forEach(num => {
                        if (!arr.includes(num)) arr.push(num);
                    });
                    if (arr.length <= 2) {
                        console.log(startTime);
                        magicalTimearr.push(startTime);
                    }
                } else {
                    clearInterval(myInterval);
                    resolve(magicalTimearr);
                }
            }, 1);
        } catch (e) {
            reject(e);
        }
    });
}


/**
 * catch 404 and forward to error handler
 */

app.use((req, res, next) => {
    next(createError(404, "Not Found"));
});

/**
 * error handler
 */
app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: !err.status || err.status === 500 ? "Internal server error" : err.message
        }
    });
});