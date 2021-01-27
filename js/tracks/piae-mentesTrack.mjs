import { Note, NoteTypes, NoteTypes_pm, NotePM, Notes as N, NoteRenderable_pm } from "../note.mjs"
import { _Fapu_s_Verdancy_HO, _Fapu_s_Verdancy_TP, _16dan_HO, _16dan_TP } from "../test_osu.mjs"
import { CurveNodeType, Curve } from "../curve.mjs"
import { PreviewTrack } from "./previewTrack.mjs";
import { Notes } from "../note.mjs";

class PiaeMentesTrack extends PreviewTrack
{
    constructor(app, height)
    {
        super(app, height, 1.0, CurveNodeType.Step);
        this.SetTrackHeight(height);
        this.waterHeight = 0.65 * this.trackHeight;

        this.wbg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.wbg.anchor.set(0.0, 0.5);
        this.wbg.y = 0;
        this.wbg.width = this.trackWidth;
        this.wbg.tint = 0x465daa;
        this.wbg.zIndex = -1000000;
        // this.wbg.height = this.waterHeight;
        this.addChild(this.wbg);
    }

    SetTrackHeight(height)
    {
        super.SetTrackHeight(height);
        this.waterHeight = 0.65 * this.trackHeight;

        if (this.wbg)
        {
            this.wbg.height = this.waterHeight;
            this.wbg.y = (this.trackHeight - this.waterHeight) / 2;
        }

        return this;
    }

    realizeNote(note)
    {
        note.SV = this.SVcurve.Query(note.time);
        note.SVbpm = note.SV * this.BPM;

        note.inWaterTime = (60.0 / note.SVbpm) * note.waterHitDelay * 1000.0;

        switch (note.type)
        {
            case NoteTypes_pm.Light:
                note.accTime = note.inWaterTime;
                note.waterAcc = - (6 * note.y) / (note.accTime * note.accTime);
                note.initSpeed = (note.y / note.accTime) - 0.5 * (note.waterAcc * note.accTime);
                note.finalSpeed = -note.initSpeed; // will not be used anyway
                break;
            case NoteTypes_pm.Medium:
                note.accTime = note.inWaterTime * note.accSustain;
                note.waterAcc = - (2 * note.y) / (note.accTime * note.accTime);
                note.finalSpeed = 0;
                note.initSpeed = - note.waterAcc * note.accTime;
                break;
            case NoteTypes_pm.Heavy:
                // Constraint: note.finalSpeed = note.initSpeed * 0.5
                // Solve: v0 + at = 1/2v0; v0t + 1/2at^2 + 1/2v0(T-t) = y
                note.accTime = note.inWaterTime * note.accSustain;
                note.initSpeed = note.y / (0.75 * note.accTime + 0.5 * (note.inWaterTime - note.accTime));
                note.finalSpeed = note.initSpeed * 0.5;
                note.waterAcc = (- 0.5 * note.initSpeed) / (note.accTime);
                break;
        }

        note.appearTime = note.time - note.inWaterTime - (this.trackHeight - this.waterHeight) / note.initSpeed;
        console.log(note);
    }

    _UpdateNoteAccInfo(note)
    {
        this.realizeNote(note);

        this.noteAppearenceTree.insert(note);
        this.noteDisappearenceTree.insert(note);
    }

    AddNoteRenderables(note)
    {
        this.addChild(new NoteRenderable_pm(note, -note.time, 128));
    }

    RndRange(min, max)
    {
        return Math.random() * (max - min) + min;
    }

    GetPosIter(step = 4) // actual steps = step + 1
    {
        let currCol = 0;
        let currRow = 0;
        let tw = this.trackWidth;
        let wh = this.waterHeight;
        let th = this.trackHeight;
        let rr = this.RndRange;

        const posIterator = {
            next: function ()
            {
                let result = [tw * 0.1 + currCol * (tw * 0.8 / step), currRow * (wh * 0.45) + wh * 0.2];
                if (currRow == 0)
                {
                    currCol++;
                    if (currCol > step)
                    {
                        currRow = 1;
                        currCol--;
                    }
                }
                else
                {
                    currCol--;
                    if (currCol < 0)
                    {
                        currRow = 0;
                        currCol++;
                    }
                }

                result[0] += rr(-tw * 0.05, tw * 0.05);
                result[1] += rr(-wh * 0.07, wh * 0.07);

                return result;
            }
        }

        return posIterator;
    }

    PlaceOsuHitObjects(src = null, offset = 0)
    {
        if (src == null)
        {
            this.notes = [
                NotePM(3500, 100, 100, NoteTypes_pm.Heavy, 1.0, 0.7),
                NotePM(4000, 200, 100, NoteTypes_pm.Light, 1.0, 0.7),
                NotePM(4500, 300, 100, NoteTypes_pm.Medium, 1.0, 0.7),
                NotePM(5000, 400, 100, NoteTypes_pm.Light, 1.0, 0.7),
                NotePM(5500, 500, 100, NoteTypes_pm.Heavy, 1.0, 0.7),
            ]
        }
        else
        {
            let pIter = this.GetPosIter();
            var lines = src.split("\n");
            for (let line of lines)
            {
                var properties = line.split(",");
                if (properties[3] == '1' || properties[3] == '5')
                {
                    var targetTime = parseInt(properties[2]) + offset;
                    let pos = pIter.next();
                    let x = pos[0];
                    let y = pos[1];
                    // var x = this.RndRange(0, this.trackWidth);
                    // var y = this.RndRange(this.waterHeight * 0.2, this.waterHeight * 0.67);
                    // var y = this.RndRange(this.trackHeight - this.waterHeight, this.trackHeight);
                    if (properties[4] == '0')
                    {
                        // d
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Heavy, 1.0, 0.7));
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Medium, 3.0, 0.7));
                    }
                    else if (properties[4] == '8' || properties[4] == '2')
                    {
                        // k
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Light, 3.0, 0.7));
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Medium, 1.0, 0.7));
                    }
                    else if (properties[4] == '4')
                    {
                        // D
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Heavy, 1.0, 0.7));
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Medium, 3.0, 0.7));
                    }
                    else if (properties[4] == '12' || properties[4] == '6')
                    {
                        // K
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Light, 3.0, 0.7));
                        this.AddNote(NotePM(targetTime, x, y, NoteTypes_pm.Medium, 1.0, 0.7));
                    }
                }
            }
        }
    }

    getNotePos(note, time)
    {
        var sinceAppear = time - note.appearTime;
        var sinceWaterHit = sinceAppear - ((this.trackHeight - this.waterHeight) / note.initSpeed);

        var y = 0;

        // above water
        if (sinceWaterHit < 0)
        {
            y = sinceAppear * note.initSpeed;
        }
        // below water
        else
        {
            var sinceAccFinish = sinceWaterHit - note.accTime;
            // Still changing speed
            if (sinceAccFinish < 0)
            {
                y = (this.trackHeight - this.waterHeight) + note.initSpeed * sinceWaterHit + 0.5 * note.waterAcc * (sinceWaterHit * sinceWaterHit);
            }
            // Speed fixed
            else
            {
                // y after acc
                y = (this.trackHeight - this.waterHeight) + note.initSpeed * note.accTime + 0.5 * note.waterAcc * (note.accTime * note.accTime);
                y += note.finalSpeed * sinceAccFinish;
            }
        }

        return [note.x, y];
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
                // renderable.x = (renderable.note.time - time) * renderable.note.SV / 2.0 * (this.BPM / 200.0) * 1.4 * this.scrollSpeed_heightbase;
                // renderable.x = (renderable.note.time - time) * this.SVcurve.Query(renderable.note.time) / 2.0 * (this.BPM / 200.0) * 1.4;

                var pos = this.getNotePos(renderable.note, time);
                renderable.x = pos[0];
                renderable.y = pos[1] - (this.trackHeight / 2);

                if (this.muted) { continue; }
                if (time >= renderable.note.time && this._prevTime < renderable.note.time)
                {
                    this.app.hitsounds[renderable.note.type].play();
                }
            }
        }

        this._prevTime = time;
    }
}

export { PiaeMentesTrack }
