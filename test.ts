const axios = require('axios');
let data = '{\n    "id": "<string>",\n    "message": {\n        "historyId": "incididunt eu",\n        "id": "pro",\n        "internalDate": "dolor",\n        "labelIds": [\n            "est sed",\n            "sint commodo voluptate enim"\n        ],\n        "payload": {\n            "body": {\n                "attachmentId": {\n                    "value": "<Error: Too many levels of nesting to fake this schema>"\n                },\n                "data": {\n                    "value": "<Error: Too many levels of nesting to fake this schema>"\n                },\n                "size": {\n                    "value": "<Error: Too many levels of nesting to fake this schema>"\n                }\n            },\n            "filename": "aute",\n            "headers": [\n                {\n                    "value": "<Error: Too many levels of nesting to fake this schema>"\n                },\n                {\n                    "value": "<Error: Too many levels of nesting to fake this schema>"\n                }\n            ],\n            "mimeType": "quis ut consectetur",\n            "partId": "fugiat exercitation esse et officia",\n            "parts": [\n                {\n                    "value": "<Circular reference to #/components/schemas/MessagePart detected>"\n                },\n                {\n                    "value": "<Circular reference to #/components/schemas/MessagePart detected>"\n                }\n            ]\n        },\n        "raw": "ipsum Lorem irure",\n        "sizeEstimate": 55613833,\n        "snippet": "exercitation in eiusmod",\n        "threadId": "labore dolore"\n    }\n}';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://gmail.googleapis.com//gmail/v1/users/<string>/drafts?$.xgafv=<string>&access_token=<string>&alt=<string>&callback=<string>&fields=<string>&key=<string>&oauth_token=<string>&prettyPrint=<boolean>&quotaUser=<string>&upload_protocol=<string>&uploadType=<string>',
  headers: {
    'Content-Type': 'message/cpim'
  },
  data: data
};

axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
