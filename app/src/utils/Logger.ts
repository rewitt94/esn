import { v4 as uuid } from "uuid";

export default class Logger {

    private correlationId: string;

    constructor() {
        this.correlationId = uuid();
    }

    access(text: string, object?: object) {
        const data = this.getData('ACCESS', text, object)
        console.log(data)
    }


    info(text: string, object?: object) {
        const data = this.getData('INFO', text, object)
        console.log(data)
    }

    warn(text: string, object?: object) {
        const data = this.getData('WARN', text, object)
        console.log(data)
    }

    error(text: string, object?: object) {
        const data = this.getData('ERROR', text, object)
        console.log(data)
    }

    private getData(logLevel: string, text: string, object?: object) {
        const timeNow = new Date().toISOString();
        const data = !object ? [ timeNow, logLevel, this.correlationId, text ]: [ timeNow, logLevel,  this.correlationId, text, JSON.stringify(object) ];
        return data.join(' - ');
    }

}