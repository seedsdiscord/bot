package events

import (
	"github.com/bwmarrin/discordgo"
	"github.com/quackdiscord/bot/commands"
)

func init() {
	Events = append(Events, onInteractionCreate)
}

func onInteractionCreate(s *discordgo.Session, i *discordgo.InteractionCreate) {
	switch i.Type {
	case discordgo.InteractionApplicationCommand:
		commands.OnInteraction(s, i)
	}
	// case discordgo.InteractionMessageComponent:
	// 	components.OnInteraction(s, i)
	// }
}
