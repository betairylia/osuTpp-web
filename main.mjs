// Main entry point

import { OsuTpp } from "./js/app.mjs"

var mainAudio;
var app;

function init()
{
    app = new OsuTpp();
    // app.LoadAudio("assets/audio/Gardens Under A Spring Sky.mp3", 1.0, 0);
    app.LoadAudio("assets/audio/16th-dan.mp3", 1.0, 326736);
    app.ticker.add(update)
}

var _lastLoop = Date.now();
function update(dt)
{
    var _thisLoop = Date.now();
    if (app.isLoaded)
    {
        document.getElementById("timestamp").innerHTML = `Obj: ${app.tracks[0].notes.length} | SV nodes: ${app.tracks[0].SVcurve.tree.size} | T: ${app.length.toFixed(0)} ms | C: ${app.GetAudioTimeMS().toFixed(0)} ms<br/>SV: ${app.tracks[0].SVcurve.Query(app.mainAudio.seek() * 1000.0).toFixed(3)} @ 200 BPM<br/>FPS: ${(1000 / (_thisLoop - _lastLoop)).toFixed(1)}`;
        _lastLoop = _thisLoop;
    }
}

init();
