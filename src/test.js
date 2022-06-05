const axios = require("axios")
const path = require("path")



const TTN_BASE_URL = "https://eu1.cloud.thethings.network"
const TTN_PATH_ORG = "/organizations"
const TTN_PATH_APPLICATIONS = "/applications"
const TTN_PATH_API_KEYS = "/api-keys"
const TTN_API_PATH = "/api/v3"

const get_ttn_path_applications = (organizationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_ORG, organizationId, TTN_PATH_APPLICATIONS)
}

const get_ttn_path_api_keys = (applicationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_APPLICATIONS, applicationId, TTN_PATH_API_KEYS)
}
const token = "NNSXS.WEJ3SSUUXEZ7UH457EGU3RIYEMDGN5QCOFPQPEI.J3R7M5FQTNNUCSSLQG2O4K5YHT6ASU7FMQIFF6H4WHTBNW6YVQSA"
const config = {
    headers: { Authorization: `Bearer ${token}` },
};

const appId = "org-teste5"
const applicationPayload = {
    application:{
        ids: {
            application_id: appId
        },
        name: "org-teste5",
        description: "org-teste5"
    }
}

const app_path = get_ttn_path_applications("organization-sensor-app") 

const ttnApi = axios.create({
    baseURL: TTN_BASE_URL,
  });

const app_key_path = get_ttn_path_api_keys(appId)


const app_key_payload = {
    name: appId + '-key',
    rights: [28, 29, 40, 53]
}

// ttnApi.post(app_path , applicationPayload, config)
//     .then((resp) => {
//         console.log(resp)
//     })
//     .catch((error) => {
//         console.log(error)
//     })

ttnApi.post(app_key_path , app_key_payload, config)
.then((resp) => {
    console.log(resp)
})
.catch((error) => {
    console.log(error.response.status)
})

    // const app_key = await ttnApi.post(app_key_path, app_key_payload, config)

    // ttnApi.get(get_ttn_path_applications("organization-sensor-app") , config)
    // .then((resp) => {
    //     console.log(resp.data)
    // })
    // .catch((error) => {
    //     console.log(error.response.status)
    //     // console.log(error.status)
    // })
