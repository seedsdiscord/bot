import { ChatInputCommandInteraction } from "discord.js";
import { redis } from "../bot";
import embedBuilder from "./embedBuilder";
import { logger } from "./logger";

export default async function cmdRun(cmdName: string, interaction: ChatInputCommandInteraction) {
    // get this commands count from the quack:cmds redis hash
    const cmdCount = await redis.hget("seeds:cmds", cmdName);

    // if the command is not in the redis hash, add it
    if (!cmdCount) {
        await redis.hset("seeds:cmds", {
            [cmdName]: 1
        });
    } else {
        // if the command is in the redis hash, add 1 to it
        await redis.hincrby("seeds:cmds", cmdName, 1);
    }

    await redis.hincrby("seeds:cmds", "total", 1);

    logger.info({
        mesage: "Command executed",
        command: cmdName,
        user: {
            id: interaction.user.id,
            username: interaction.user.username
        },
        guild: interaction.guild?.id
    });

    // check if there are any active alerts
    let alert: any = await redis.hget("seeds:alerts", "active");

    if (alert) {
        alert = JSON.parse(alert);
        // check if the user has already viewed the alert
        if (!alert.viewers.includes(interaction.user.id)) {
            const embedData = {
                title: "🚨 Unread message from the developers!",
                description: "Run `/alert` to view the message",
                color: "Gold"
            };
            const embed = embedBuilder(embedData as any);
            await interaction.channel?.send({ embeds: [embed] });
        }
    }
}
