// Main entry point

import { OsuTpp } from "./js/app.mjs"

var mainAudio;
var app;

function init()
{
    app = new OsuTpp(true, true);
    app.LoadAudio("assets/audio/Gardens Under A Spring Sky.mp3", 1.0, 0);
    // app.LoadAudio("assets/audio/16th-dan.mp3", 1.0, 326736);
    app.ticker.add(update)

    document.getElementById("RandomJumpBtn").onclick = RandomJump;
    document.getElementById("BackBtn").onclick = () => { app.mainAudio.seek(Math.max(0, app.mainAudio.seek() - 15)) };
    document.getElementById("ForwardBtn").onclick = () => { app.mainAudio.seek(Math.min(app.length / 1000.0, app.mainAudio.seek() + 15)) };
}

var _lastLoop = Date.now();
function update(dt)
{
    var _thisLoop = Date.now();
    if (app.isLoaded)
    {
        document.getElementById("timestamp").innerHTML = `Obj: ${app.tracks[0].notes.length} (rendered: ${(app.tracks[0].children.length.toString()).padStart(4, '.')}) | SV nodes: ${app.tracks[0].SVcurve.tree.size} | T: ${app.length.toFixed(0)} ms | C: ${app.GetAudioTimeMS().toFixed(0)} ms<br/>SV: ${app.tracks[0].SVcurve.Query(app.mainAudio.seek() * 1000.0).toFixed(3)} @ 200 BPM<br/>FPS: ${(1000 / (_thisLoop - _lastLoop)).toFixed(1)}`;
        _lastLoop = _thisLoop;
    }
}

function getRndInteger(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

function RandomJump()
{
    app.mainAudio.seek(getRndInteger(0, app.length) / 1000.0);
}

init();
