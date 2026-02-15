import streamDeck from "@elgato/streamdeck";

import { ToggleItem } from "./actions/toggle-item";
import { DisplayHaste } from "./actions/display-haste";
import { SetMastery } from "./actions/set-mastery";
import { RotateChampion } from "./actions/champion-rotator";
import { GlobalSettingsManager } from "./global-settings";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the toggle item action.
streamDeck.actions.registerAction(new ToggleItem());

// Register the display haste action.
streamDeck.actions.registerAction(new DisplayHaste());

// Register the set mastery action.
streamDeck.actions.registerAction(new SetMastery());

// Register the rotate champion action.
streamDeck.actions.registerAction(new RotateChampion());

// Initialize global settings manager
GlobalSettingsManager.getInstance().initialize();

// Finally, connect to the Stream Deck.
streamDeck.connect();
