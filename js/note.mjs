import { OsuTpp } from "./app.mjs";

const NoteTypes = {
    don: 0,
    kat: 1,
    DONFinish: 2,
    KATFinish: 3,
    sliderStart: 4,
    sliderEnd: 5,
    sliderFinishStart: 6,
    sliderFinishEnd: 7,
    spinnerStart: 8,
    spinnerEnd: 9
}

const NoteTint = [
    0xfa2616,
    0x3f94b5,
    0xfa2616,
    0x3f94b5,
    0xffff00,
    0xffff00,
    0xffff00,
    0xffff00,
    0x00ff00,
    0x00ff00
]

function Note(timeMS, type)
{
    return { time: timeMS, type: type };
}

class NoteRenderable extends PIXI.Container
{
    constructor(note, order = 0, size = 64, app = OsuTpp.app)
    {
        super();
        this.note = note;
        this.zIndex = order;

        if (this.note.type == NoteTypes.DONFinish || this.note.type == NoteTypes.KATFinish)
        {
            size *= 1.5;
        }

        this.sprite = new PIXI.Sprite(app.noteFillTex);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(size / 128.0);
        this.sprite.tint = NoteTint[note.type];

        this.spriteOverlay = new PIXI.Sprite(app.noteOverlayTex);
        this.spriteOverlay.anchor.set(0.5);
        this.spriteOverlay.scale.set(size / 128.0);

        this.addChild(this.sprite);
        this.addChild(this.spriteOverlay);
    }
}

var Notes = {
    d: (t) => Note(t, 0),
    k: (t) => Note(t, 1),
    D: (t) => Note(t, 2),
    K: (t) => Note(t, 3),
}

export { Note, Notes, NoteTypes, NoteRenderable };
