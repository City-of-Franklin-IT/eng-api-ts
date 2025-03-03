"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require('dotenv');
dotenv.config({ path: 'config/config.env' });
exports.default = {
    "development": {
        "databases": {
            "cip": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.CIP_DB_DATABASE,
                "host": process.env.CIP_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "stormwater": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.STORMWATER_DB_DATABASE,
                "host": process.env.STORMWATER_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "vesting": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.VESTING_DB_DATABASE,
                "host": process.env.VESTING_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "traffic-calming": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.CALMING_DB_DATABASE,
                "host": process.env.CALMING_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "infor": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.INFOR_DB_DATABASE,
                "host": process.env.INFOR_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
        }
    },
    "production": {
        "databases": {
            "cip": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.CIP_DB_DATABASE,
                "host": process.env.CIP_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "stormwater": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.STORMWATER_DB_DATABASE,
                "host": process.env.STORMWATER_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "vesting": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.VESTING_DB_DATABASE,
                "host": process.env.VESTING_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "traffic-calming": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.CALMING_DB_DATABASE,
                "host": process.env.CALMING_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
            "infor": {
                "username": process.env.DB_USERNAME,
                "password": process.env.DB_PASSWORD,
                "database": process.env.INFOR_DB_DATABASE,
                "host": process.env.INFOR_DB_HOST,
                "dialect": "mssql",
                "dialectOptions": {
                    useUTC: true
                },
                "timezone": "US/Chicago",
                "logging": false
            },
        }
    }
};
//# sourceMappingURL=config.js.map