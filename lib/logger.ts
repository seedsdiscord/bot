import winston from "winston";
import Transport, { TransportStreamOptions } from "winston-transport";
import { client } from "../bot";
import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import config from "../config";

class WebhookTransport extends Transport {
    constructor(opts: TransportStreamOptions) {
        super(opts);
    }
    async log(info: any, callback: Function) {
        // strip any color codes from the message
        info.message = info.message.replace(/\x1b\[[0-9;]*m/g, "");
        try {
            await client.webhookClient?.send({
                content: `\`\`\`json\n${JSON.stringify(info, null, 2)}\`\`\``,
                username: "Console",
                avatarURL: client.user?.displayAvatarURL()
            });
        } catch (e) {
            console.error("Failed to send webhook message via logger", e);
        }

        callback();
    }
}

const whTransport = new WebhookTransport({});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.colorize({
            message: true
        })
    ),
    defaultMeta: { service: "quack-bot" },
    transports: [
        new winston.transports.Console(),
        new AxiomTransport({
            dataset: config.axiom.dataset,
            token: config.axiom.token,
            orgId: config.axiom.orgId
        })
    ]
});

export { logger };
