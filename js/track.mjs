import { Note, NoteTypes, Notes as N, NoteRenderable as Nr } from "./note.mjs"
import { _Fapu_s_Verdancy_HO, _Fapu_s_Verdancy_TP, _16dan_HO, _16dan_TP } from "./test_osu.mjs"
import { CurveNodeType, Curve } from "./curve.mjs"

class Track extends PIXI.Container
{
    constructor(app)
    {
        super();

        this.app = app;
        // this.y = 100 + height / 2;
        // this.anchor.set(0.0, 0.5);

        // this.trackHeight = height;

        // Create track bg
        this.bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.0, 0.5);
        this.bg.y = 0;
        this.bg.width = this.app.renderer.width / this.app.renderer.resolution;
        this.bg.tint = 0x242424;
        this.bg.zIndex = -100000000;

        this.addChild(this.bg);

        this.SetTrackHeight(128);
        this.SetNoteHeight(128);
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

        // For better handling notes
        this.noteAppearenceTree = new RBTree((a, b) => { return a.appearTime - b.appearTime });
        this.noteDisappearenceTree = new RBTree((a, b) => { return a.disappearTime - b.disappearTime });
        this.noteTree = new RBTree((a, b) => { return a.time - b.time });

        this._prevTime = 0;
        this.muted = false;

        // For test
        this.notes = []; // not ordered
        // this.aliveRenderables = [];

        this.sortableChildren = true;

        // Stress test
        for (let i = 0; i < 1; i++)
        {
            this.PlaceTestNotes(_Fapu_s_Verdancy_HO, i * 10);
        }

        this.PlaceTestTimingPoints(_Fapu_s_Verdancy_TP);
        this.InitNoteRendererAccelerator();

        // for (let note of this.notes)
        // {
        //     this.aliveRenderables.push(new Nr(note, -note.time));
        // }

        // this.aliveRenderables.forEach(element =>
        // {
        //     this.addChild(element);
        // });
    }

    GetOnTrackTime(note, bpm, appearRange = (this.bg.width / this.scrollSpeed_heightbase) + 500, disappearRange = -500)
    {
        // TODO: sliders, spinners, ...
        var tmp = (1.0 / 2.0 * (bpm / 200.0) * 1.4); // idk what is this but okay
        return [note.time - appearRange / tmp, note.time - disappearRange / tmp];
    }

    AddNote(note)
    {
        this.notes.push(note);
        this.noteTree.insert(note);

        return this;
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
                        this.AddNote(N.d(targetTime));
                    }
                    else if (properties[4] == '8' || properties[4] == '2')
                    {
                        this.AddNote(N.k(targetTime));
                    }
                    else if (properties[4] == '4')
                    {
                        this.AddNote(N.D(targetTime));
                    }
                    else if (properties[4] == '12' || properties[4] == '6')
                    {
                        this.AddNote(N.K(targetTime));
                    }
                }
            }
        }
    }

    _UpdateNoteAccInfo(note)
    {
        note.SV = this.SVcurve.Query(note.time);
        var times = this.GetOnTrackTime(note, note.SV * this.BPM)
        // console.log(times);
        note.appearTime = times[0];
        note.disappearTime = times[1];

        this.noteAppearenceTree.insert(note);
        this.noteDisappearenceTree.insert(note);
    }

    // Basically a faster UpdateNoteRendererAccelerator(0, length)
    InitNoteRendererAccelerator()
    {
        this.noteAppearenceTree.clear();
        this.noteDisappearenceTree.clear();

        console.log("InitNoteRendererAccelerator");
        for (let note of this.notes)
        {
            this._UpdateNoteAccInfo(note);
        }
        console.log("finished");

        this._prevTime = this.noteAppearenceTree.min().appearTime - 1000;
        return this;
    }

    UpdateNoteRendererAccelerator(startTime, endTime)
    {
        // TODO
        return this;
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
                _SV = Math.max((_SV - 1.0) * 2.0 + _SV, 0.001);
                this.SVcurve.Insert(time, _SV * currentBPM / this.BPM, CurveNodeType.Linear);
            }
        }

        return this;
    }

    // Given time, modify render list so only notes currently in stage are alive.
    UpdateRenderList(time)
    {
        if (time == this._prevTime) { return; }

        var dirc = (time > this._prevTime); // true = forward; false = reverse

        //////////////////////////
        // disappear
        //////////////////////////

        // // Check disappear tree (disappearTime < time)
        // // start from current time
        // var iter = this.noteDisappearenceTree.lowerBound({ disappearTime: time });

        // // mark all note which should disappear (disappearTime < time)
        // var shouldDel = [] // FIXME: performance ok?
        // iter.prev(); // move to previous note
        // while (iter.data() != null)
        // {
        //     shouldDel.push(iter.data());
        // }

        // // Delete them
        // shouldDel.forEach(note =>
        // {
        //     this.removeChild(note);
        //     this.noteDisappearenceTree.remove(note);
        // });

        // // Check appear tree (appearTime > time)
        // // start from current time
        // iter = this.noteDisappearenceTree.upperBound({ appearTime: time });

        var shouldDel = [];

        // Check all children
        this.children.forEach(obj =>
        {
            if ('note' in obj)
            {
                if (obj.note.appearTime > time || obj.note.disappearTime < time)
                {
                    shouldDel.push(obj);
                }
            }
        });

        shouldDel.forEach(noteR =>
        {
            this.removeChild(noteR);
        });

        //////////////////////////
        // Appear
        //////////////////////////

        // Appearence tree
        // start from previous time (upperBound: iter.data().appearTime always > _prevTime)
        var iter = this.noteAppearenceTree.upperBound({ appearTime: this._prevTime });

        var shouldAdd = new Map();

        // Add all notes
        while (iter.data() != null)
        {
            // alias
            var note = iter.data();

            // check if not exist
            if ((note.appearTime > this._prevTime) || (note.disappearTime < this._prevTime))
            {
                // check if should continue
                if (note.appearTime <= time)
                {
                    // check if should add
                    if (note.disappearTime >= time)
                    {
                        shouldAdd.set(note.time, note);
                    }
                }
                // we are done
                else
                {
                    break;
                }
            }

            // Move cursor
            if (dirc) { iter.next(); }
            else { iter.prev(); }
        }

        // Disappearence tree; similar as above
        iter = this.noteDisappearenceTree.upperBound({ disappearTime: this._prevTime });

        // Add all notes
        while (iter.data() != null)
        {
            // alias
            var note = iter.data();

            // check if not exist
            if ((note.appearTime > this._prevTime) || (note.disappearTime < this._prevTime))
            {
                // check if should continue
                if (note.disappearTime >= time)
                {
                    // check if should add
                    if (note.appearTime <= time)
                    {
                        shouldAdd.set(note.time, note);
                    }
                }
                // we are done
                else
                {
                    break;
                }
            }

            // Move cursor
            if (dirc) { iter.next(); }
            else { iter.prev(); }
        }

        shouldAdd.forEach((v, k) =>
        {
            this.addChild(new Nr(v, -v.time, this.trackHeight / 2));
        });

        return this;
    }

    SetTrackHeight(height)
    {
        this.trackBGHeight = height;
        this.bg.height = this.trackBGHeight;

        return this;
    }

    SetNoteHeight(height)
    {
        this.trackHeight = height;
        this.scrollSpeed_heightbase = this.trackHeight / 128.0;

        return this;
    }

    Update(time)
    {
        // Update render list
        this.UpdateRenderList(time);

        // Don't play hitsound if jump
        if (time - this._prevTime > 100) { this._prevTime = time; }


        // Render
        for (let renderable of this.children)
        {
            // a note
            if ('note' in renderable)
            {
                // renderable.x = (renderable.note.time - time) * this.SV / 2.0 * (this.BPM / 200.0) * 1.4;
                renderable.x = (renderable.note.time - time) * renderable.note.SV / 2.0 * (this.BPM / 200.0) * 1.4 * this.scrollSpeed_heightbase;
                // renderable.x = (renderable.note.time - time) * this.SVcurve.Query(renderable.note.time) / 2.0 * (this.BPM / 200.0) * 1.4;

                if (this.muted) { continue; }
                if (time >= renderable.note.time && this._prevTime < renderable.note.time)
                {
                    this.app.hitsounds[renderable.note.type].play();
                }
            }
        }

        this._prevTime = time;
    }

    Mute()
    {
        this.muted = true;
        return this;
    }

    Unmute()
    {
        this.muted = false;
        return this;
    }
}

export { Track }
