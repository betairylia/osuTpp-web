const fragmentSrc = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// Inverse resolution
uniform vec2 iRes;
uniform float trackHeight;

uniform vec4 bgColor;
uniform vec4 fgColor;
uniform vec4 borderColor;
uniform float borderWidth;

vec4 SampleColor(vec2 uv)
{
    float discriminator = float((1.0 - uv.y) - texture2D(uSampler, uv).r);
    if(abs(discriminator) * trackHeight < (borderWidth / 2.0))
    {
        return borderColor;
    }
    return mix(bgColor, fgColor, float(discriminator <= 0.0));
}

void main(void)
{
    // trivial MSAA
    vec4 msaa = 
        SampleColor(vTextureCoord + vec2(iRes.x / 2.0, 0)) +
        SampleColor(vTextureCoord - vec2(iRes.x / 2.0, 0)) +
        SampleColor(vTextureCoord + vec2(0, iRes.y / 2.0)) +
        SampleColor(vTextureCoord - vec2(0, iRes.y / 2.0));
    msaa = msaa / 4.0;

    gl_FragColor = msaa;
    // gl_FragColor = vec4(vTextureCoord, 0, 1);
}
`;

const DEFAULT_N_SEGMENTS = 1024;

class CurveTrack extends PIXI.Container
{
    constructor(app)
    {
        super();

        this.app = app;

        this.trackWidth = this.app.renderer.width / this.app.renderer.resolution;

        // Create curve track bg
        this.bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.0, 0.5);
        this.bg.y = 0;
        this.bg.width = this.trackWidth;
        this.bg.tint = 0x162122;
        this.bg.zIndex = -100000000;

        this.SetSegments(DEFAULT_N_SEGMENTS);

        // Init geometries
        this.renderFilter = new PIXI.Filter(null, fragmentSrc);
        this.renderFilter.uniforms.t = 0;

        this.renderFilter.uniforms.bgColor = [0, 0, 0, 0];
        this.renderFilter.uniforms.fgColor = [0.243, 0.337, 0.275, 0.5];
        this.renderFilter.uniforms.borderColor = [0.239, 0.957, 0.561, 1];
        this.renderFilter.uniforms.borderWidth = 2.5;

        this.curveRenderable = PIXI.Sprite.from(PIXI.Texture.fromBuffer(
            this.segments, this.segments.length, 1, {
            mipmap: PIXI.MIPMAP_MODES.OFF,
            wrapMode: PIXI.WRAP_MODES.CLAMP,
            format: PIXI.FORMATS.LUMINANCE,
            scaleMode: PIXI.SCALE_MODES.LINEAR,
            // type: PIXI.TYPES.FLOAT,
        }));
        this.curveRenderable.anchor.set(0.0, 0.5);
        this.curveRenderable.width = this.trackWidth;
        this.curveRenderable.blendMode = PIXI.BLEND_MODES.NORMAL;
        this.bg.blendMode = PIXI.BLEND_MODES.NORMAL;

        this.curveRenderable.filters = [this.renderFilter];

        this.addChild(this.bg);
        this.addChild(this.curveRenderable);

        this.SetTrackHeight(128);
    }

    SetSegments(n)
    {
        this.segments = new Uint8Array(n);
        this.nSegments = n;

        return this;
    }

    SetData(curve)
    {
        this.curve = curve;
        return this;
    }

    SetTrackHeight(height)
    {
        this.trackHeight = height;
        this.bg.height = this.trackHeight;
        this.curveRenderable.height = this.trackHeight;
        this.renderFilter.uniforms.iRes = [1.0 / this.trackWidth, 1.0 / this.trackHeight];
        this.renderFilter.uniforms.trackHeight = this.trackHeight;

        return this;
    }

    Update(time)
    {
        // Update segments by querying the curve
        // TODO: use cyclic queue to enhance performance - too lazy now
        for (let i = 0; i < this.nSegments; i++)
        {
            this.segments[i] = this.curve.Query(time + i * (20480 / this.nSegments)) * (255.0 / 1.2);
        }

        this.curveRenderable.texture.update();
    }
}

export { CurveTrack }
