
import { PreviewTrack } from "./tracks/previewTrack.mjs";
import { CurveTrack } from "./tracks/curveTrack.mjs";

class OsuTpp extends PIXI.Application
{
    constructor(isDefault = true)
    {
        var res = (window.devicePixelRatio || 1);

        super({
            antialias: true,
            resolution: res,
        });

        if (isDefault)
        {
            OsuTpp.app = this;
        }

        // Add the canvas that Pixi automatically created for you to the HTML document
        document.body.appendChild(this.view);
        this.isLoaded = false;

        // Fill Screen
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display = "block";
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth / res, window.innerHeight / res);

        this.PIXIready = false;
        this.Howlready = false;
        this.playbackRate = 1.0;
        this.audioCursor = 0;

        // Setup Loader to load resources
        this.loader = PIXI.Loader.shared;
        this.loader
            .add([
                "assets/img/taikohitcircle.png",
                "assets/img/taikohitcircleoverlay.png",
            ])
            .load(() => { this.PIXIready = true; this.onStartUpLoadFinish(); });

        this.hitBaseVol = 0.5;
        this.hitsounds = [
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitnormal.wav"], volume: this.hitBaseVol }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitclap.wav"], volume: this.hitBaseVol }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitfinish.wav"], volume: this.hitBaseVol }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitwhistle.wav"], volume: this.hitBaseVol }),
        ]

        // No audio rn
        this.mainAudio = null;
        this.length = -1;
    }

    onStartUpLoadFinish()
    {
        // Wait until everything are ready
        if (!(this.PIXIready && this.Howlready)) { return; }

        // Register textures
        this.noteFillTex = this.loader.resources["assets/img/taikohitcircle.png"].texture;
        this.noteOverlayTex = this.loader.resources["assets/img/taikohitcircleoverlay.png"].texture;

        // Play audio
        this.length = this.mainAudio.duration() * 1000.0;
        this.mainAudio.play();

        // Setup UI elements
        this.tracks = [];

        // Seems needs to be power of 2 (at least ntrackH / ctrackH)
        var gap = 8;
        var trackH = 72;
        var ntrackH = 64;
        var ctrackH = 32;

        var _calc_gap = gap + trackH + ctrackH;

        for (let i = 0; i < 10; i++)
        {
            var t = new PreviewTrack(this)
                .SetTrackHeight(trackH)
                .SetNoteHeight(ntrackH)
                .InitNoteRendererAccelerator();

            var ct = new CurveTrack(this)
                .SetData(t.SVcurve)
                .SetTrackHeight(ctrackH);

            t.y = 60 + (trackH / 2) + i * _calc_gap;
            ct.y = 60 + trackH + (ctrackH / 2) + i * _calc_gap;

            if (i > 0) { t.Mute(); }
            this.stage.addChild(t);
            this.stage.addChild(ct);
            this.tracks.push(t);
            this.tracks.push(ct);
        }

        // Register update event
        this.ticker.add(this.Update.bind(this));

        this.isLoaded = true;
    }

    Update()
    {
        var time = this.GetAudioTimeMS();
        for (let track of this.tracks)
        {
            track.Update(time);
        }
    }

    LoadAudio(url, rate = 1.0, startMS = 0)
    {
        // Load Audio
        this.mainAudio = new Howl({
            src: [url],
            rate: rate,
            loop: true,
        });

        this.playbackRate = rate;
        this.audioCursor = startMS;
        this.mainAudio.seek(startMS / 1000.0);

        this.mainAudio.on('load', () =>
        {
            this.Howlready = true;
            this.onStartUpLoadFinish();
        });
    }

    GetAudioTimeMS()
    {
        if (this.mainAudio != null)
        {
            return this.mainAudio.seek() * 1000;
        }
        return 0;
    }
}

export { OsuTpp };
