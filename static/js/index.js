import CommunityPullRequest from "./components/addons/CommunityPullRequest.js";
import EnterprisePullRequest from "./components/addons/EnterprisePullRequest.js";
import Mergebot from "./components/addons/Mergebot.js";
import Runbot from "./components/addons/Runbot.js";
import Settings from "./components/addons/Settings.js";
import Popup from "./components/Popup.js";
import Environment from "./Environment.js";

const { Component } = owl;

Component.env = new Environment("dev");

async function start() {
    Popup.registerAddon(CommunityPullRequest);
    Popup.registerAddon(EnterprisePullRequest);
    Popup.registerAddon(Runbot);
    Popup.registerAddon(Mergebot);
    Popup.registerAddon(Settings);

    await Component.env.load();

    const popup = new Popup();
    popup.mount(document.body);
}

start();
