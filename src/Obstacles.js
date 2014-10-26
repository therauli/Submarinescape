var Pipe = cc.PhysicsSprite.extend({
	body: null,
    shape: null,
    type: null,
    ctor: function(pos) {
        this._super();
        this.initWithFile(res.pipe_png);

        var size = this.getContentSize();
        
        var verts = [pos.x - size.width / 2, pos.y - size.height / 2,
                    pos.x - size.width / 2, pos.y + size.height / 2,
                    pos.x - size.width / 2+ size.width, pos.y + size.height / 2,
                    pos.x + size.width / 2, pos.y - size.height / 2];

        cc.log('Pipe verts:', verts);

        this.body = new cp.Body(1000, cp.momentForBox(1000, size.width, size.height));
        this.shape = new cp.PolyShape(this.body, verts, cp.vzero);
        this.shape.setElasticity(1.0);
        this.shape.setFriction(0.1);

        this.setBody(this.body);

        this.shape.setCollisionType(6);

        this.type = "Pipe";
        cc.log('Pipe created', pos);
    }
});