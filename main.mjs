// Main entry point

import { OsuTpp } from "./js/app.mjs"

var mainAudio;
var app;

function init()
{
    app = new OsuTpp();
    app.LoadAudio("assets/audio/Travel Begins.mp3");
    app.ticker.add(update)
}

function update(dt)
{
    document.getElementById("timestamp").innerText = `${app.GetAudioTimeMS().toFixed(0)} ms`;
}

init();
