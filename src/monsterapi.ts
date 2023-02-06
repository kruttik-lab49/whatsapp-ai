// @ts-ignore
const axios = require('axios');
require("dotenv").config();

// const taskData = JSON.stringify({
//     "model": "txt2img",
//     "data": {
//         "prompt": "hot tall British man with toned body and a hot light brown short height slim indian girl on a long romantic walk, visible faces",
//         "negprompt": "",
//         "samples": 1,
//         "steps": 50,
//         "aspect_ratio": "square",
//         "guidance_scale": 7.5,
//         "seed": 2414
//     }
// });
//
// const taskConfig = {
//     method: 'post',
//     url: 'https://api.monsterapi.ai/apis/add-task',
//     headers: {
//         'x-api-key': process.env.MONSTER_API_KEY,
//         'Authorization': "Bearer ${process.env.MONSTER_AUTH_TOKEN}",
//         'Content-Type': 'application/json'
//     },
//     data : taskData
// };

// axios(taskConfig)
//     .then(function (response) {
//         console.log(JSON.stringify(response.data));
//         return response;
//     })
//     .then(function (response) {
//         const data = JSON.stringify({
//             "process_id": "${response.process_id}"
//         });
//         return response;
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

const processStatus = (processId) => {
    const data = JSON.stringify({
        "process_id": processId
    });
    const processConfig = {
        method: 'post',
        url: 'https://api.monsterapi.ai/apis/add-task',
        headers: {
            'x-api-key': process.env.MONSTER_API_KEY,
            'Authorization': `Bearer ${process.env.MONSTER_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data : data
    };
    axios(processConfig)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
}

processStatus("0f0de4fe-a588-11ed-a55c-75e61617013a");