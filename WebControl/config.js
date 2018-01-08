const config = {
    name: "CustomerSolution",
    host: "",
    port: 3010,
    version: "1.0.0",
    database: {
        mongo: {
            url: "mongodb://localhost/",
            db: "company_database"
        }
    },
    log: {
        level: {
            file: 'info',
            command: 'trace'
        }
    }
};
module.exports = config;
