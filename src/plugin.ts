import streamDeck from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { ToggleItem } from "./actions/toggle-item";
import { GlobalSettingsManager } from "./global-settings";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());

// Register the toggle item action.
streamDeck.actions.registerAction(new ToggleItem());

// Initialize global settings manager
GlobalSettingsManager.getInstance().initialize();

// Finally, connect to the Stream Deck.
streamDeck.connect();
