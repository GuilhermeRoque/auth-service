const axios = require("axios")
const path = require("path")



const TTN_BASE_URL = "https://eu1.cloud.thethings.network"
const TTN_PATH_ORG = "/organizations"
const TTN_PATH_APPLICATIONS = "/applications"
const TTN_PATH_API_KEYS = "/api-keys"
const TTN_API_PATH = "/api/v3"

const TTN_API = axios.create({
    baseURL: TTN_BASE_URL,
});

const __get_ttn_path_applications = (organizationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_ORG, organizationId, TTN_PATH_APPLICATIONS)
}

const __get_ttn_path_api_keys = (applicationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_APPLICATIONS, applicationId, TTN_PATH_API_KEYS)
}

const addApplication = async (organization, application) => {
    const token = organization.apiKey
    const organizationId = organization.organizationId
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    
    const appId = application.appId
    const applicationPayload = {
        application:{
            ids: {
                application_id: appId
            },
            name: application.name,
            description: application.description
        }
    }

    const appPath = __get_ttn_path_applications(organizationId) 
    
    return TTN_API.post(appPath , applicationPayload, config)
}


const addApiKey = async (application) => {
    const path = __get_ttn_path_api_keys(application.appId)
    const app_key_payload = {
        name: application.appId + '-key',
        rights: [28, 29, 40, 53]
    }

    return TTN_API.post(path, app_key_payload)
}

module.exports = {
    addApplication,
    addApiKey
}