const fs = require('fs');

const { default: axios } = require("axios");
const AWS = require('aws-sdk')


exports.handler = async (event, context, callback) => {

    if (event.id === undefined) {
        return {
            statusCode: 406,
            body: "Id is required",
        };
    }
    
    const id = event.id;

    async function callExternalAPI(id) {
        try {
            const response = await axios.get("https://pokeapi.co/api/v2/pokemon/" + id);
            return {
                statusCode: 200,
                body: {
                    pokemon: {
                        name: response.data.name,
                        height: response.data.height,
                        weight: response.data.weight
                    }
                }
            }
        } catch(error) {
            return {
                statusCode: 500,
                body: "Error calling external api",
            }
        }
    }

    async function uploadToS3(name, body) {
        console.log("Starting to save on S3");
        console.log("Data to upload: ", body);
        const params = {
            Bucket : "prueba-vianys",
            Key : name + ".json",
            Body : body,
            ContentType: "json"
        };

        const S3 = new AWS.S3({
            signatureVersion: 'v4',
            region: 'us-east-1',
            accessKeyId: "AKIA6CL3CSX5F4I3NXRV",
            secretAccessKey: "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"
        });

        try {
            await S3.putObject(params).promise()
            console.log("S3 Upload Completed")
        } catch(error) {
            console.log("Error uploading: ", error)
        }
        
    }

    const dataFromApi = await callExternalAPI(id);
    const name = "pokemon_" + id;
    uploadToS3(name, JSON.stringify(dataFromApi.body));

    return dataFromApi;
}
