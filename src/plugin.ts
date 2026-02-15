import streamDeck from "@elgato/streamdeck";

import { ToggleItem } from "./actions/toggle-item";
import { DisplayHaste } from "./actions/display-haste";
import { SetMastery } from "./actions/set-mastery";
import { RotateChampion } from "./actions/champion-rotator";
import { DisplayPassive } from "./actions/display-passive";
import { DisplayQ } from "./actions/display-q";
import { DisplayW } from "./actions/display-w";
import { DisplayE } from "./actions/display-e";
import { DisplayR } from "./actions/display-r";
import { IncrementLevel } from "./actions/increment-level";
import { IncrementLegendStack } from "./actions/increment-legend-stack";
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

// Register the display passive action.
streamDeck.actions.registerAction(new DisplayPassive());

// Register the display Q action.
streamDeck.actions.registerAction(new DisplayQ());

// Register the display W action.
streamDeck.actions.registerAction(new DisplayW());

// Register the display E action.
streamDeck.actions.registerAction(new DisplayE());

// Register the display R action.
streamDeck.actions.registerAction(new DisplayR());

// Register the increment level action.
streamDeck.actions.registerAction(new IncrementLevel());

// Register the increment legend stack action.
streamDeck.actions.registerAction(new IncrementLegendStack());

// Initialize global settings manager
GlobalSettingsManager.getInstance().initialize();

// Finally, connect to the Stream Deck.
streamDeck.connect();
