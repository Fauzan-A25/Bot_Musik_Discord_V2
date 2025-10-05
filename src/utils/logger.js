const colors = require('colors');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsPath = path.join(__dirname, '../../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logsPath)) {
            fs.mkdirSync(this.logsPath, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString().replace('T', ' ').split('.')[0];
    }

    log(message, level = 'INFO') {
        const timestamp = this.getTimestamp();
        const logMessage = `[${timestamp}] [${level}] ${message}`;

        // Console output with colors
        switch (level) {
            case 'ERROR':
                console.error(logMessage.red);
                break;
            case 'WARN':
                console.warn(logMessage.yellow);
                break;
            case 'SUCCESS':
                console.log(logMessage.green);
                break;
            case 'INFO':
                console.log(logMessage.cyan);
                break;
            default:
                console.log(logMessage.white);
        }

        // Write to file
        this.writeToFile(logMessage);
    }

    writeToFile(message) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logsPath, `${today}.log`);
            
            fs.appendFileSync(logFile, message + '\n', 'utf8');
        } catch (error) {
            console.error('Failed to write log file:', error.message);
        }
    }

    info(message) {
        this.log(message, 'INFO');
    }

    error(message) {
        this.log(message, 'ERROR');
    }

    warn(message) {
        this.log(message, 'WARN');
    }

    success(message) {
        this.log(message, 'SUCCESS');
    }

    debug(message) {
        if (process.env.NODE_ENV === 'development') {
            this.log(message, 'DEBUG');
        }
    }
}

module.exports = new Logger();
