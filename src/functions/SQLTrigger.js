const { DefaultAzureCredential } = require("@azure/identity");
//const { DefaultAzureCredential, ManagedIdentityCredential } = require("@azure/identity");
const sql = require("mssql");

module.exports = async function (context, myTimer) {
//    const credential = new DefaultAzureCredential();
// Use UAMI's Client ID
const uamiClientId = "5edde04a-baff-4ceb-85a5-5edc5baa78f0";
const credential = new ManagedIdentityCredential(uamiClientId);

    try {
        // Get access token for Azure SQL
        const tokenResponse = await credential.getToken("https://database.windows.net/");
        const accessToken = tokenResponse.token;

        const config = {
            server: "globalcontentstudioint.database.windows.net",
            database: "ContentValidationInt",
            options: {
                encrypt: true,
                enableArithAbort: true
            },
            authentication: {
                type: "azure-active-directory-access-token",
                options: {
                    token: accessToken
                }
            }
        };

        // Connect to SQL and run query
        await sql.connect(config);
        const result = await sql.query`SELECT 1 AS result`;
        context.log("SQL Query Result:", result.recordset[0].result);

    } catch (err) {
        context.log.error("Error connecting to SQL:", err.message);
    } finally {
        sql.close();
    }
};
