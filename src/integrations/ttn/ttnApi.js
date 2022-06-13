const crypto = require("crypto")
const axios = require("axios")
const path = require("path")

const TTN_SERVER = "eu1.cloud.thethings.network"
const TTN_BASE_URL = "https://"+TTN_SERVER
const TTN_API_PATH = "/api/v3"

const TTN_PATH_ORG = "/organizations"
const TTN_PATH_APPLICATIONS = "/applications"
const TTN_PATH_DEVICES = '/devices'
const TTN_PATH_API_KEYS = "/api-keys"
const TTN_PATH_NETWORK_SETTINGS = "/ns"

const TTN_API = axios.create({
    baseURL: TTN_BASE_URL,
});

const __get_ttn_path_applications = (organizationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_ORG, organizationId, TTN_PATH_APPLICATIONS)
}

const __get_ttn_path_api_keys = (applicationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_APPLICATIONS, applicationId, TTN_PATH_API_KEYS)
}

const __get_ttn_path_devices = (applicationId) => {
    return path.join(TTN_API_PATH, TTN_PATH_APPLICATIONS, applicationId, TTN_PATH_DEVICES)
}

const __get_ttn_path_network_settings = (applicationId, deviceId) => {
    return path.join(TTN_API_PATH, TTN_PATH_NETWORK_SETTINGS, TTN_PATH_APPLICATIONS, applicationId, TTN_PATH_DEVICES, deviceId)
}
const __get_auth_config = (apiKey) => {
    return {headers: { Authorization: `Bearer ${apiKey}` }}
}

const get_random_local_eui64 = () => {
    // rangom 64 bits
    const buffer = crypto.randomBytes(8)
    // set to local
    buffer[0] |= (1 << 1)
    buffer[0] &= ~(1 << 0)
    return buffer.toString('hex')
}

const get_random_appkey = () => {
    const buffer = crypto.randomBytes(16)
    return buffer.toString('hex')
}

const addApplication = async (apiKey, organizationId, application) => {
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
    
    return TTN_API.post(appPath , applicationPayload, __get_auth_config(apiKey))
}


const addApiKey = async (apiKey, applicationId) => {
    const path = __get_ttn_path_api_keys(applicationId)
    const app_key_payload = {
        name: application.appId + '-key',
        rights: [28, 29, 40, 53]
    }

    return TTN_API.post(path, app_key_payload, __get_auth_config(apiKey))
}

const addDevice = async (apiKey, applicationId, device) => {
    const path = __get_ttn_path_devices(applicationId)
    const dev_eui = device.dev_eui?device.dev_eui: get_random_local_eui64()
    const join_eui = device.app_eui?device.join_eui: "0000000000000000"
    const network_server_address = device.network_server_address?device.network_server_address:TTN_SERVER
    const application_server_address =  device.application_server_address?device.application_server_address:TTN_SERVER
    
    // const app_key = device.app_key?device.app_key: get_random_appkey()
    
    const device_payload = {
        end_device: {
            ids: {
                device_id: device.devId,
                dev_eui: dev_eui,
                join_eui: join_eui,
                // app_key: app_key
                application_ids: {
                    application_id: applicationId,
                },
                network_server_address:network_server_address,
                application_server_address:application_server_address
            },
            name: device.name
        }
    }
    return TTN_API.post(path, device_payload, __get_auth_config(apiKey))
}

const setDeviceNetworkSettings = async (apiKey, applicationId, deviceId, networkSettings) => {
    const path = __get_ttn_path_network_settings(applicationId, deviceId)
    const config = __get_auth_config(apiKey)
    
    const networkSettingsPayload = {
        frequency_plan_id: networkSettings.freqPlanId,
        lorawan_version: networkSettings.macVersionId
    }
    return TTN_API.put(path, networkSettingsPayload, config)

}

module.exports = {
    addApplication,
    addApiKey,
    addDevice,
    setDeviceNetworkSettings
}