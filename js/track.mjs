import { Note, NoteTypes, Notes as N, NoteRenderable as Nr } from "./note.mjs"
import { _Fapu_s_Verdancy_HO, _Fapu_s_Verdancy_TP, _16dan_HO, _16dan_TP } from "./_test_osu.mjs"
import { CurveNodeType, Curve } from "./curve.mjs"

class Track extends PIXI.Container
{
    constructor(app, height = 100)
    {
        super();

        this.app = app;
        // this.y = 100 + height / 2;
        // this.anchor.set(0.0, 0.5);

        // Create track bg
        this.bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.0, 0.5);
        this.bg.y = 0;
        this.bg.width = this.app.renderer.width;
        this.bg.height = 128;
        this.bg.tint = 0x242424;
        this.bg.zIndex = -100000000;

        this.addChild(this.bg);
        this.SV = 1.0;
        this.BPM = 200.0;

        this.SVcurve = new Curve(app.length);

        // It is good
        // this.SVcurve.Insert(50, 2, 1);
        // console.log(this.SVcurve.Query(-10));
        // console.log(this.SVcurve.Query(10));
        // console.log(this.SVcurve.Query(50));
        // console.log(this.SVcurve.Query(70));
        // console.log(this.SVcurve.Query(1000));

        this._prevTime = 0;
        this.muted = false;

        // For test
        this.notes = [];
        this.aliveRenderables = [];

        this.sortableChildren = true;

        // Stress test
        for (let i = 0; i < 1; i++)
        {
            this.PlaceTestNotes(_16dan_HO, i * 10);
        }

        this.PlaceTestTimingPoints(_16dan_TP);

        for (let note of this.notes)
        {
            this.aliveRenderables.push(new Nr(note, -note.time));
        }

        this.aliveRenderables.forEach(element =>
        {
            this.addChild(element);
        });
    }

    PlaceTestNotes(src = null, offset = 0)
    {
        if (src == null)
        {
            this.notes = [
                N.d(1500),
                N.d(1600),
                N.k(1700),
                N.d(1800),
                N.k(1900),
            ]
        }
        else
        {
            var lines = src.split("\n");
            for (let line of lines)
            {
                var properties = line.split(",");
                if (properties[3] == '1' || properties[3] == '5')
                {
                    var targetTime = parseInt(properties[2]) + offset;
                    if (properties[4] == '0')
                    {
                        this.notes.push(N.d(targetTime));
                    }
                    else if (properties[4] == '8' || properties[4] == '2')
                    {
                        this.notes.push(N.k(targetTime));
                    }
                    else if (properties[4] == '4')
                    {
                        this.notes.push(N.D(targetTime));
                    }
                    else if (properties[4] == '12' || properties[4] == '6')
                    {
                        this.notes.push(N.K(targetTime));
                    }
                }
            }
        }
    }

    PlaceTestTimingPoints(src)
    {
        var currentBPM = 0.0;

        var lines = src.split("\n");
        for (let line of lines)
        {
            var properties = line.split(",");
            var time = properties[0];

            if (properties[1] > 0) // Red
            {
                currentBPM = (60000.0 / properties[1]);
            }
            else // Green
            {
                var _SV = 100.0 / (-properties[1]);
                _SV = Math.max((_SV - 1.0) * 1.5 + _SV, 0.1);
                this.SVcurve.Insert(time, _SV * currentBPM / this.BPM, CurveNodeType.Linear);
            }
        }
    }

    Update(time)
    {
        if (time - this._prevTime > 100) { this._prevTime = time; }
        for (let renderable of this.aliveRenderables)
        {
            // renderable.x = (renderable.note.time - time) * this.SV / 2.0 * (this.BPM / 200.0) * 1.4;
            renderable.x = (renderable.note.time - time) * this.SVcurve.Query(renderable.note.time) / 2.0 * (this.BPM / 200.0) * 1.4;

            if (this.muted) { continue; }
            if (time >= renderable.note.time && this._prevTime < renderable.note.time)
            {
                this.app.hitsounds[renderable.note.type].play();
            }
        }
        this._prevTime = time;
    }

    Mute()
    {
        this.muted = true;
    }

    Unmute()
    {
        this.muted = false;
    }
}

export { Track }
