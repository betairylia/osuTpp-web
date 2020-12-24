
import { Track } from "./track.mjs";

class OsuTpp extends PIXI.Application
{
    constructor(isDefault = true)
    {
        super({
            antialias: true,
            resolution: window.devicePixelRatio || 1,
        });

        if (isDefault)
        {
            OsuTpp.app = this;
        }

        // Add the canvas that Pixi automatically created for you to the HTML document
        document.body.appendChild(this.view);

        // Fill Screen
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display = "block";
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth, window.innerHeight);

        // Setup Loader to load resources
        this.loader = PIXI.Loader.shared;
        this.loader
            .add([
                "assets/img/taikohitcircle.png",
                "assets/img/taikohitcircleoverlay.png",
            ])
            .load(this.onStartUpLoadFinish.bind(this));

        this.hitsounds = [
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitnormal.wav"] }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitclap.wav"] }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitfinish.wav"] }),
            new Howl({ src: ["assets/audio/hitsounds/taiko-normal-hitwhistle.wav"] }),
        ]

        // No audio rn
        this.mainAudio = null;
    }

    onStartUpLoadFinish()
    {
        this.noteFillTex = this.loader.resources["assets/img/taikohitcircle.png"].texture;
        this.noteOverlayTex = this.loader.resources["assets/img/taikohitcircleoverlay.png"].texture;

        this.tracks = new Array(1);
        this.tracks[0] = new Track(this);
        this.stage.addChild(this.tracks[0]);

        this.ticker.add(this.Update.bind(this));
    }

    Update()
    {
        var time = this.GetAudioTimeMS();
        for (let track of this.tracks)
        {
            track.Update(time);
        }
    }

    LoadAudio(url, rate = 1.0)
    {
        // Load Audio
        this.mainAudio = new Howl({
            src: [url]
        });

        this.mainAudio.play();
        this.mainAudio.rate(rate);
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
