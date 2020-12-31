class BaseTrack extends PIXI.Container
{
    constructor(app, bgColor, trackHeight = 128)
    {
        super();

        this.app = app;

        this.trackWidth = this.app.renderer.width / this.app.renderer.resolution;

        // Create curve track bg
        this.bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.0, 0.5);
        this.bg.y = 0;
        this.bg.width = this.trackWidth;
        this.bg.tint = bgColor;
        this.bg.zIndex = -100000000;

        this.addChild(this.bg);
        this.SetTrackHeight(trackHeight);
    }

    SetTrackHeight(height)
    {
        this.trackHeight = height;
        this.bg.height = this.trackHeight;

        return this;
    }

    Update(time)
    { }
}

export { BaseTrack }
