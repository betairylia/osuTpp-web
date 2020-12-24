import { Note, NoteTypes, Notes as N, NoteRenderable as Nr } from "./note.mjs"

class Track extends PIXI.Container
{
    constructor(app, height = 100)
    {
        super();

        this.app = app;
        this.y = 100 + height / 2;

        // Create track bg
        this.bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.0, 0.5);
        this.bg.y = 0;
        this.bg.width = this.app.renderer.width;
        this.bg.height = 100;
        this.bg.tint = 0x555555;

        this.addChild(this.bg);

        this.notes = [
            N.d(1500),
            N.d(1600),
            N.k(1700),
            N.d(1800),
            N.k(1900),
        ];

        this.aliveRenderables = [];
        for (let note of this.notes)
        {
            this.aliveRenderables.push(new Nr(note));
        }

        this.aliveRenderables.forEach(element =>
        {
            this.addChild(element);
        });
    }

    Update(time)
    {
        for (let renderable of this.aliveRenderables)
        {
            renderable.x = (renderable.note.time - time);
            if (time >= renderable.note.time && renderable.played == false)
            {
                renderable.played = true;
                this.app.hitsounds[renderable.note.type].play();
            }
        }
    }
}

export { Track }
