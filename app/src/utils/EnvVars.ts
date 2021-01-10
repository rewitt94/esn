import dotenv from "dotenv";

const envVars = [
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
    "TYPEORM_CONNECTION",
    "TYPEORM_HOST",
    "TYPEORM_USERNAME",
    "TYPEORM_PASSWORD",
    "TYPEORM_DATABASE",
    "TYPEORM_PORT",
    "TYPEORM_SYNCHRONIZE",
    "TYPEORM_LOGGING",
    "TYPEORM_ENTITIES",
    "JWT_SECRET",
    "WEB_APP_PORT"
] as const;

type EnvVar = typeof envVars[number];

export default class EnvVars {

    private static instance: EnvVars;

    constructor() {

        // load env vars
        dotenv.config();

        envVars.forEach(key => {
            if (process.env[key] === undefined) {
                throw new Error(`Env var '${key}' is not defined`);
            }
        });

    };

    static get = (): EnvVars => {
        if (EnvVars.instance === undefined) {
            EnvVars.instance = new EnvVars();
        }
        return EnvVars.instance;
    }

    valueOf = (envVar: EnvVar): string => {
        return process.env[envVar]!
    }

}
