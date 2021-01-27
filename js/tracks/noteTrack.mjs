import { Note, NoteTypes, Notes as N, NoteRenderable as Nr } from "../note.mjs"
import { _Fapu_s_Verdancy_HO, _Fapu_s_Verdancy_TP, _16dan_HO, _16dan_TP } from "../test_osu.mjs"
import { BaseTrack } from "./baseTrack.mjs"

class NoteTrack extends BaseTrack
{
    constructor(app, height)
    {
        super(app, 0x242424, height);

        this.SetNoteHeight(this.trackHeight);

        this.BPM = 200.0;
        this.notes = [];
        this.noteTree = new RBTree((a, b) => { return a.time - b.time });

        this.sortableChildren = true;
    }

    SetNoteHeight(height)
    {
        this.noteHeight = height;
        this.scrollSpeed_heightbase = this.noteHeight / 128.0;

        return this;
    }

    AddNote(note)
    {
        this.notes.push(note);
        this.noteTree.insert(note);

        return this;
    }

    PlaceOsuHitObjects(src = null, offset = 0)
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

    UpdateRenderList(time)
    {
        // TODO
    }

    Update(time)
    {
        // TODO
    }
}

export { NoteTrack }
